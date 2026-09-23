/**
 * MKV embedded-subtitle extractor.
 *
 * File hosts keep SoftSub subtitles INSIDE the .mkv (no sidecar .srt,
 * no API). Browsers can't render those — so we parse the Matroska
 * structure ourselves with small HTTP Range fetches (headers + Cues
 * index + clusters around the playback position, a few MB total —
 * never the whole multi-GB file) and feed cues into a TextTrack.
 *
 * Works in browsers (WebView with cleartext allowed) and in Node
 * (for testing) — no DOM dependency.
 */

export interface SubCue {
  start: number; // seconds
  end: number; // seconds
  text: string;
}

export interface MkvSubTrack {
  num: number;
  codec: string; // S_TEXT/UTF8 | S_TEXT/ASCII | S_TEXT/ASS | S_TEXT/SSA | S_TEXT/WEBVTT
  lang: string;
}

export interface MkvMeta {
  timecodeScale: number; // ns per tick (default 1_000_000)
  durationSec: number;
  tracks: MkvSubTrack[];
  cues: { timeMs: number; pos: number }[]; // pos = offset from segment data start
  segDataStart: number;
  totalSize: number;
  rangesOk: boolean;
}

type FetchFn = (url: string, headers?: Record<string, string>) => Promise<Response>;

// EBML element IDs we care about
const ID = {
  EBML: 0x1a45dfa3,
  Segment: 0x18538067,
  SeekHead: 0x114d9b74,
  Seek: 0x4dbb,
  SeekID: 0x53ab,
  SeekPosition: 0x53ac,
  Info: 0x1549a966,
  TimecodeScale: 0x2ad7b1,
  Duration: 0x4489,
  Tracks: 0x1654ae6b,
  TrackEntry: 0xae,
  TrackNumber: 0xd7,
  TrackType: 0x83,
  CodecID: 0x86,
  Language: 0x22b59c,
  ContentEncodings: 0x6d80,
  Cues: 0x1c53bb6b,
  CuePoint: 0xbb,
  CueTime: 0xb3,
  CueTrackPositions: 0xb7,
  CueTrack: 0xf7,
  CueClusterPosition: 0xf1,
  Cluster: 0x1f43b675,
  Timecode: 0xe7,
  SimpleBlock: 0xa3,
  BlockGroup: 0xa0,
  Block: 0xa1,
  BlockDuration: 0x9b,
};

const TRACK_TYPE_SUB = 17;

class Reader {
  view: DataView;
  buf: Uint8Array;
  pos = 0;
  constructor(buf: Uint8Array) {
    this.buf = buf;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  get len() {
    return this.buf.length;
  }
  eof() {
    return this.pos >= this.buf.length;
  }
  u8() {
    return this.view.getUint8(this.pos++);
  }
  /** EBML ID: keep length-marker bits */
  readId(): number {
    const b = this.u8();
    let len = 1;
    let mask = 0x80;
    while (len <= 4 && !(b & mask)) {
      mask >>= 1;
      len++;
    }
    let id = b;
    for (let i = 1; i < len; i++) id = id * 256 + this.u8();
    return id;
  }
  /** EBML size: strip marker; -1 = unknown size */
  readSize(): number {
    const b = this.u8();
    let len = 1;
    let mask = 0x80;
    while (len <= 8 && !(b & mask)) {
      mask >>= 1;
      len++;
    }
    let size = b & (mask - 1);
    for (let i = 1; i < len; i++) size = size * 256 + this.u8();
    if (size === Math.pow(2, 7 * len) - 1) return -1;
    return size;
  }
  readUint(len: number): number {
    let v = 0;
    for (let i = 0; i < len; i++) v = v * 256 + this.u8();
    return v;
  }
  readInt(len: number): number {
    let v = this.readUint(len);
    const bits = len * 8;
    if (v >= Math.pow(2, bits - 1)) v -= Math.pow(2, bits);
    return v;
  }
  readFloat(len: number): number {
    if (len === 4) {
      const v = this.view.getFloat32(this.pos);
      this.pos += 4;
      return v;
    }
    const v = this.view.getFloat64(this.pos);
    this.pos += 8;
    return v;
  }
  readUtf8(len: number): string {
    const s = new TextDecoder().decode(this.buf.subarray(this.pos, this.pos + len));
    this.pos += len;
    return s;
  }
  skip(len: number) {
    this.pos = Math.min(this.buf.length, this.pos + Math.max(0, len));
  }
}

function walkChildren(
  r: Reader,
  end: number,
  cb: (id: number, size: number, dataPos: number) => void
) {
  const limit = end < 0 ? r.len : Math.min(end, r.len);
  while (r.pos < limit) {
    let id: number;
    try {
      id = r.readId();
    } catch {
      break;
    }
    let size: number;
    try {
      size = r.readSize();
    } catch {
      break;
    }
    const dataPos = r.pos;
    cb(id, size, dataPos);
    if (size < 0) {
      r.pos = limit;
    } else {
      r.pos = Math.min(limit, dataPos + size);
    }
  }
}

async function readCapped(res: Response, cap: number): Promise<Uint8Array> {
  if (!res.body || typeof res.body.getReader !== 'function') {
    const ab = await res.arrayBuffer();
    if (ab.byteLength > cap) throw new Error('no-range');
    return new Uint8Array(ab);
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > cap) {
        try {
          await reader.cancel();
        } catch {}
        throw new Error('no-range');
      }
      chunks.push(value);
    }
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.byteLength;
  }
  return out;
}

async function fetchRange(
  fetchFn: FetchFn,
  url: string,
  start: number,
  length: number
): Promise<{ buf: Uint8Array; total: number; ranges: boolean }> {
  const res = await fetchFn(url, { Range: `bytes=${start}-${start + length - 1}` });
  if (!res.ok && res.status !== 206 && res.status !== 200) {
    throw new Error(`range fetch failed: ${res.status}`);
  }
  const total = Number(res.headers.get('Content-Range')?.split('/')[1] || res.headers.get('Content-Length') || 0);
  const ranges =
    res.status === 206 || (res.headers.get('Accept-Ranges') || '').toLowerCase() === 'bytes';
  // If the server ignored Range (200 + huge body), bail instead of buffering GBs
  const buf = await readCapped(res, length + 1024 * 1024);
  return { buf, total, ranges };
}

function pickTrack(tracks: MkvSubTrack[]): MkvSubTrack | null {
  if (!tracks.length) return null;
  const fa = tracks.find((t) => /^(per|fas|fa|fa-ir)$/i.test(t.lang));
  return fa || tracks[0];
}

function cleanText(raw: string): string {
  const lines = raw
    .replace(/\{[^}]*\}/g, '') // ASS overrides
    .replace(/<[^>]*>/g, '') // html tags
    .replace(/\\N/g, '\n')
    .split('\n')
    .map((l) => l.trim().replace(/\s{2,}/g, ' '))
    .filter((l) => l.length > 0)
    // drop SDH noise: bracket-only directions and lone music notes
    .filter((l) => !/^\[.*\]$/.test(l) && !/^[♪♫\s]+$/.test(l));
  return lines.join('\n').trim();
}

/** Normalized form for duplicate detection (ignore spacing/punctuation). */
export function normSub(s: string): string {
  return s.replace(/[\s\p{P}]/gu, '');
}

function assToMs(t: string): number {
  const m = /(\d+):(\d{2}):(\d{2})[.:](\d{2,3})/.exec(t.trim());
  if (!m) return NaN;
  const cs = m[4].length === 2 ? Number(m[4]) * 10 : Number(m[4]);
  return Number(m[1]) * 3600000 + Number(m[2]) * 60000 + Number(m[3]) * 1000 + cs;
}

function parseSrtPayload(payload: string): { text: string; durMs: number }[] {
  const out: { text: string; durMs: number }[] = [];
  const chunks = payload.replace(/\r\n/g, '\n').split(/\n{2,}/);
  for (const ch of chunks) {
    const lines = ch.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    let i = 0;
    if (/^\d+$/.test(lines[0])) i = 1;
    let durMs = 0;
    if (i < lines.length && /-->/.test(lines[i])) {
      const m = /(\d{2,}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2,}:\d{2}:\d{2}[,.]\d{3})/.exec(lines[i]);
      if (m) {
        const p = (s: string) => {
          const a = /(\d+):(\d{2}):(\d{2})[,.](\d{3})/.exec(s)!;
          return Number(a[1]) * 3600000 + Number(a[2]) * 60000 + Number(a[3]) * 1000 + Number(a[4]);
        };
        durMs = Math.max(0, p(m[2]) - p(m[1]));
        i++;
      } else {
        i++;
      }
    }
    const text = cleanText(lines.slice(i).join('\n'));
    if (text) out.push({ text, durMs });
  }
  return out;
}

function parseAssPayload(payload: string): { text: string; durMs: number }[] {
  const out: { text: string; durMs: number }[] = [];
  for (const line of payload.replace(/\r\n/g, '\n').split('\n')) {
    const t = line.trim();
    if (!t.toLowerCase().startsWith('dialogue:')) continue;
    const body = t.slice('dialogue:'.length);
    const parts = body.split(',');
    if (parts.length < 10) continue;
    const durMs = assToMs(parts[2]) - assToMs(parts[1]);
    const text = cleanText(parts.slice(9).join(','));
    if (text) out.push({ text, durMs: isFinite(durMs) && durMs > 0 ? durMs : 0 });
  }
  return out;
}

/** Parse subtitle blocks from one cluster-range buffer. */
function parseClusterBuffer(
  buf: Uint8Array,
  trackNum: number,
  codec: string,
  scale: number,
  fromMs: number,
  untilMs: number
): { cues: SubCue[]; coveredUntilMs: number } {
  const r = new Reader(buf);
  const cues: SubCue[] = [];
  let coveredUntilMs = fromMs;
  let clusterTc = 0;
  let inCluster = false;

  const push = (blockMs: number, payload: string, blockDurMs: number) => {
    if (blockMs + 1 < fromMs || blockMs > untilMs + 30000) return;
    const start = blockMs / 1000;
    let items: { text: string; durMs: number }[];
    if (/ASS|SSA/i.test(codec)) items = parseAssPayload(payload);
    else if (/WEBVTT/i.test(codec)) {
      items = parseSrtPayload(payload.replace(/,/g, '.'));
    } else items = parseSrtPayload(payload);
    if (!items.length && payload.trim()) {
      const text = cleanText(payload);
      if (text) items = [{ text, durMs: blockDurMs }];
    }
    let cursor = start;
    for (const it of items) {
      const dur = it.durMs > 0 && it.durMs < 60000 ? it.durMs / 1000 : 4;
      cues.push({ start: cursor, end: cursor + dur, text: it.text });
      cursor += dur;
    }
    if (blockMs > coveredUntilMs) coveredUntilMs = blockMs;
  };

  const parseBlock = (dataPos: number, size: number) => {
    const b = new Reader(buf.subarray(dataPos, Math.min(buf.length, dataPos + size)));
    let track = 0;
    try {
      // track number vint
      const fb = b.u8();
      let len = 1;
      let mask = 0x80;
      while (len <= 4 && !(fb & mask)) {
        mask >>= 1;
        len++;
      }
      track = fb & (mask - 1);
      for (let i = 1; i < len; i++) track = track * 256 + b.u8();
    } catch {
      return;
    }
    if (track !== trackNum) return;
    let tc = 0;
    let flags = 0;
    try {
      tc = b.readInt(2);
      flags = b.u8();
    } catch {
      return;
    }
    const lacing = (flags & 0x06) >> 1;
    if (lacing !== 0) return; // subtitle tracks aren't laced in practice
    const payload = new TextDecoder().decode(buf.subarray(dataPos + b.pos, Math.min(buf.length, dataPos + size)));
    push(clusterTc + tc, payload, 0);
  };

  while (!r.eof()) {
    const elStart = r.pos;
    let id: number;
    try {
      id = r.readId();
    } catch {
      break;
    }
    if (id === ID.Cluster) {
      inCluster = true;
      try {
        r.readSize();
      } catch {
        break;
      }
      continue;
    }
    if (!inCluster) {
      // resync: step one byte (only used in proportional fallback)
      r.pos = elStart + 1;
      continue;
    }
    let size = 0;
    try {
      size = r.readSize();
    } catch {
      break;
    }
    const dataPos = r.pos;
    if (id === ID.Timecode) {
      try {
        clusterTc = r.readUint(size) * (scale / 1000000);
      } catch {}
    } else if (id === ID.SimpleBlock) {
      parseBlock(dataPos, size < 0 ? r.len - dataPos : size);
    } else if (id === ID.BlockGroup) {
      const end = size < 0 ? r.len : Math.min(r.len, dataPos + size);
      let durMs = 0;
      const sub = new Reader(buf.subarray(dataPos, end));
      // first pass: BlockDuration (needed before parsing the Block payload)
      walkChildren(sub, end - dataPos, (cid, csize, cpos) => {
        if (cid === ID.BlockDuration) {
          try {
            const dr = new Reader(buf.subarray(dataPos + cpos, dataPos + cpos + csize));
            durMs = dr.readUint(csize) * (scale / 1000000);
          } catch {}
        }
      });
      // second pass: parse the Block payload (duration now known)
      const sub2 = new Reader(buf.subarray(dataPos, end));
      walkChildren(sub2, end - dataPos, (cid, csize, cpos) => {
        if (cid === ID.Block) {
          const abs = dataPos + cpos;
          const bb = new Reader(buf.subarray(abs, Math.min(buf.length, abs + csize)));
          let track = 0;
          try {
            const fb = bb.u8();
            let len = 1;
            let mask = 0x80;
            while (len <= 4 && !(fb & mask)) {
              mask >>= 1;
              len++;
            }
            track = fb & (mask - 1);
            for (let i = 1; i < len; i++) track = track * 256 + bb.u8();
          } catch {
            return;
          }
          if (track !== trackNum) return;
          let tc = 0;
          try {
            tc = bb.readInt(2);
            const fl = bb.u8();
            if (((fl & 0x06) >> 1) !== 0) return;
          } catch {
            return;
          }
          const payload = new TextDecoder().decode(
            buf.subarray(abs + bb.pos, Math.min(buf.length, abs + csize))
          );
          const blockMs = clusterTc + tc;
          if (blockMs + 1 < fromMs || blockMs > untilMs + 30000) return;
          const start = blockMs / 1000;
          let items = /ASS|SSA/i.test(codec)
            ? parseAssPayload(payload)
            : parseSrtPayload(payload);
          if (!items.length && payload.trim()) {
            const text = cleanText(payload);
            if (text) items = [{ text, durMs }];
          }
          let cursor = start;
          for (const it of items) {
            const d = it.durMs > 0 ? it.durMs : durMs > 0 && durMs < 60000 ? durMs : 4000;
            const dur = Math.min(d / 1000, 30);
            cues.push({ start: cursor, end: cursor + dur, text: it.text });
            cursor += dur;
          }
          if (blockMs > coveredUntilMs) coveredUntilMs = blockMs;
        }
      });
    }
    if (size < 0) break;
    r.pos = Math.min(r.len, dataPos + size);
  }

  return { cues, coveredUntilMs };
}

export async function probeMkv(
  url: string,
  fetchFn: FetchFn = fetch
): Promise<MkvMeta> {
  const head = await fetchRange(fetchFn, url, 0, 2 * 1024 * 1024);
  const r = new Reader(head.buf);
  let segDataStart = 0;
  let timecodeScale = 1000000;
  let durationSec = 0;
  const tracks: MkvSubTrack[] = [];
  let cuesPos = -1;
  let haveTracks = false;

  const id = r.readId();
  if (id !== ID.EBML) throw new Error('not an EBML file');
  const ebmlSize = r.readSize();
  r.skip(ebmlSize < 0 ? 0 : ebmlSize);

  const segId = r.readId();
  if (segId !== ID.Segment) throw new Error('EBML without Segment');
  r.readSize(); // usually unknown
  segDataStart = r.pos;

  walkChildren(r, -1, (cid, csize, cpos) => {
    if (cid === ID.SeekHead && csize > 0) {
      const s = new Reader(head.buf.subarray(cpos, Math.min(head.buf.length, cpos + csize)));
      walkChildren(s, csize, (sid, ssize, spos) => {
        if (sid !== ID.Seek) return;
        let seekId = 0;
        let seekPos = -1;
        const e = new Reader(head.buf.subarray(cpos + spos, Math.min(head.buf.length, cpos + spos + ssize)));
        walkChildren(e, ssize, (eid, esize, epos) => {
          const er = new Reader(head.buf.subarray(cpos + spos + epos, cpos + spos + epos + esize));
          if (eid === ID.SeekID) {
            try {
              seekId = er.readId();
            } catch {}
          } else if (eid === ID.SeekPosition) {
            try {
              seekPos = er.readUint(esize);
            } catch {}
          }
        });
        if (seekId === ID.Cues && seekPos >= 0) cuesPos = seekPos;
      });
    } else if (cid === ID.Info && csize > 0) {
      const inf = new Reader(head.buf.subarray(cpos, Math.min(head.buf.length, cpos + csize)));
      walkChildren(inf, csize, (eid, esize, epos) => {
        const er = new Reader(head.buf.subarray(cpos + epos, cpos + epos + esize));
        try {
          if (eid === ID.TimecodeScale) timecodeScale = er.readUint(esize);
          else if (eid === ID.Duration) {
            const raw = er.readFloat(esize);
            durationSec = (raw * timecodeScale) / 1e9;
          }
        } catch {}
      });
    } else if (cid === ID.Tracks && csize > 0) {
      haveTracks = true;
      const tr = new Reader(head.buf.subarray(cpos, Math.min(head.buf.length, cpos + csize)));
      walkChildren(tr, csize, (eid, esize, epos) => {
        if (eid !== ID.TrackEntry) return;
        let num = 0;
        let type = 0;
        let codec = '';
        let lang = 'eng';
        let encoded = false;
        const te = new Reader(head.buf.subarray(cpos + epos, Math.min(head.buf.length, cpos + epos + esize)));
        walkChildren(te, esize, (fid, fsize, fpos) => {
          const fr = new Reader(head.buf.subarray(cpos + epos + fpos, cpos + epos + fpos + fsize));
          try {
            if (fid === ID.TrackNumber) num = fr.readUint(fsize);
            else if (fid === ID.TrackType) type = fr.readUint(fsize);
            else if (fid === ID.CodecID) codec = fr.readUtf8(fsize).replace(/\0/g, '');
            else if (fid === ID.Language) lang = fr.readUtf8(fsize).replace(/\0/g, '');
            else if (fid === ID.ContentEncodings) encoded = true;
          } catch {}
        });
        if (type === TRACK_TYPE_SUB && num > 0 && !encoded) {
          tracks.push({ num, codec, lang });
        }
      });
    }
  });

  // Cues index
  const cues: MkvMeta['cues'] = [];
  if (cuesPos >= 0) {
    try {
      const cr = await fetchRange(fetchFn, url, segDataStart + cuesPos, 1024 * 1024);
      const crr = new Reader(cr.buf);
      const cId = crr.readId();
      if (cId === ID.Cues) {
        crr.readSize();
        walkChildren(crr, -1, (eid, esize, epos) => {
          if (eid !== ID.CuePoint) return;
          let t = -1;
          let p = -1;
          const pr = new Reader(cr.buf.subarray(epos, Math.min(cr.buf.length, epos + esize)));
          walkChildren(pr, esize, (fid, fsize, fpos) => {
            const fr = new Reader(cr.buf.subarray(epos + fpos, epos + fpos + fsize));
            try {
              if (fid === ID.CueTime) t = fr.readUint(fsize) * (timecodeScale / 1000000);
              else if (fid === ID.CueTrackPositions) {
                const qr = new Reader(cr.buf.subarray(epos + fpos, Math.min(cr.buf.length, epos + fpos + fsize)));
                walkChildren(qr, fsize, (gid, gsize, gpos) => {
                  if (gid === ID.CueClusterPosition) {
                    const gr = new Reader(
                      cr.buf.subarray(epos + fpos + gpos, epos + fpos + gpos + gsize)
                    );
                    try {
                      p = gr.readUint(gsize);
                    } catch {}
                  }
                });
              }
            } catch {}
          });
          if (t >= 0 && p >= 0) cues.push({ timeMs: t, pos: p });
        });
        cues.sort((a, b) => a.timeMs - b.timeMs);
      }
    } catch {
      // no cues — proportional fallback will be used
    }
  }

  return {
    timecodeScale,
    durationSec,
    tracks,
    cues,
    segDataStart,
    totalSize: head.total,
    rangesOk: head.ranges,
  };
}

export interface WindowResult {
  cues: SubCue[];
  coveredUntilMs: number;
  track: MkvSubTrack;
}

const CLUSTER_FETCH = 3 * 1024 * 1024;

export async function fetchSubtitleWindow(
  url: string,
  meta: MkvMeta,
  trackNum: number,
  timeSec: number,
  windowSec = 180,
  fetchFn: FetchFn = fetch
): Promise<WindowResult> {
  const track = meta.tracks.find((t) => t.num === trackNum) || pickTrack(meta.tracks);
  if (!track) throw new Error('no subtitle track');
  const targetMs = timeSec * 1000;
  const untilMs = targetMs + windowSec * 1000;

  let startPos: number;
  if (meta.cues.length) {
    let lo = 0;
    let hi = meta.cues.length - 1;
    let best = meta.cues[0].pos;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (meta.cues[mid].timeMs <= targetMs) {
        best = meta.cues[mid].pos;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    startPos = meta.segDataStart + best;
  } else if (meta.durationSec > 0 && meta.totalSize > meta.segDataStart) {
    // proportional fallback + resync inside parser
    const frac = Math.min(0.99, Math.max(0, timeSec / meta.durationSec));
    startPos = Math.floor(meta.segDataStart + frac * (meta.totalSize - meta.segDataStart));
  } else {
    startPos = meta.segDataStart;
  }

  const { buf } = await fetchRange(fetchFn, url, startPos, CLUSTER_FETCH);
  const parsed = parseClusterBuffer(
    buf,
    track.num,
    track.codec,
    meta.timecodeScale,
    meta.cues.length ? targetMs - 5000 : 0,
    untilMs
  );
  return { cues: normalizeCues(parsed.cues), coveredUntilMs: parsed.coveredUntilMs, track };
}

/**
 * Post-pass: sort, drop empties, merge consecutive duplicates, clamp
 * overlaps and absurd durations. This is what keeps subs in sync.
 */
export function normalizeCues(input: SubCue[]): SubCue[] {
  const sorted = input
    .filter((c) => c.text && c.text.trim().length > 0)
    .sort((a, b) => a.start - b.start);
  const out: SubCue[] = [];
  for (const c of sorted) {
    const last = out[out.length - 1];
    if (
      last &&
      normSub(last.text) === normSub(c.text) &&
      c.start - last.start < 12
    ) {
      last.end = Math.max(last.end, Math.min(c.end, last.start + 12));
      continue;
    }
    let end = Math.min(c.end, c.start + 12);
    if (!(end > c.start)) end = c.start + 1;
    out.push({ start: c.start, end, text: c.text });
  }
  for (let i = 0; i < out.length - 1; i++) {
    if (out[i].end > out[i + 1].start) {
      out[i].end = Math.max(out[i].start + 0.4, out[i + 1].start - 0.08);
    }
  }
  return out;
}

/**
 * When several subtitle tracks exist without a Persian language tag,
 * sample each one and pick the track that actually contains Persian text.
 */
export async function pickBestTrack(
  url: string,
  meta: MkvMeta,
  fetchFn: FetchFn = fetch
): Promise<MkvSubTrack | null> {
  const direct = pickTrack(meta.tracks);
  if (direct && /^(per|fas|fa|fa-ir)$/i.test(direct.lang)) return direct;
  const cands = meta.tracks.slice(0, 3);
  if (cands.length <= 1) return direct;
  const t = meta.durationSec > 600 ? 300 : Math.max(60, meta.durationSec / 4);
  let best: MkvSubTrack | null = direct;
  let bestScore = -1;
  await Promise.all(
    cands.map(async (cand) => {
      try {
        const w = await fetchSubtitleWindow(url, meta, cand.num, t, 45, fetchFn);
        const txt = w.cues.slice(0, 12).map((c) => c.text).join(' ');
        const fa = (txt.match(/[\u0600-\u06FF]/g) || []).length;
        const score = fa * 2 + (txt.length > 0 ? 1 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = cand;
        }
      } catch {}
    })
  );
  return best;
}

export { pickTrack };

// ---- Native Android bridge (Zingo app) ----
// WebView blocks cross-origin http range-fetches (mixed content + CORS),
// so the app exposes a native fetcher (no WebView restrictions).
// Desktop browsers fall back to direct fetch, then the same-origin proxy.

declare global {
  interface Window {
    ZingoNative?: {
      fetchRange(url: string, start: number, len: number, cbId: number): void;
    };
    __zr?: (id: number, idx: number, total: number, chunk: string, size: number) => void;
  }
}

type BridgeEntry = {
  parts: string[];
  received: number;
  total: number;
  size: number;
  resolve: (v: { b64: string; size: number }) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

const bridgePending = new Map<number, BridgeEntry>();
let bridgeSeq = 1;

function setupBridgeGlobal() {
  if (typeof window === 'undefined' || window.__zr) return;
  window.__zr = (id, idx, total, chunk, size) => {
    const p = bridgePending.get(id);
    if (!p) return;
    if (idx < 0) {
      bridgePending.delete(id);
      clearTimeout(p.timer);
      p.reject(new Error('bridge-fail'));
      return;
    }
    if (!p.parts[idx]) {
      p.parts[idx] = chunk;
      p.received++;
    }
    p.total = total;
    if (size > 0) p.size = size;
    if (p.total > 0 && p.received >= p.total) {
      bridgePending.delete(id);
      clearTimeout(p.timer);
      const ordered: string[] = [];
      for (let i = 0; i < p.total; i++) ordered.push(p.parts[i] || '');
      p.resolve({ b64: ordered.join(''), size: p.size });
    }
  };
}

export function hasNativeBridge(): boolean {
  return typeof window !== 'undefined' && !!window.ZingoNative?.fetchRange;
}

export async function bridgeFetch(url: string, headers?: Record<string, string>): Promise<Response> {
  setupBridgeGlobal();
  const nat = window.ZingoNative;
  if (!nat?.fetchRange) throw new Error('no-bridge');
  const m = /bytes=(\d+)-(\d+)/.exec(headers?.Range || '');
  const start = m ? Number(m[1]) : 0;
  const len = m ? Number(m[2]) - Number(m[1]) + 1 : 2 * 1024 * 1024;
  const id = bridgeSeq++;
  const out = await new Promise<{ b64: string; size: number }>((resolve, reject) => {
    const timer = setTimeout(() => {
      bridgePending.delete(id);
      reject(new Error('bridge-timeout'));
    }, 45000);
    bridgePending.set(id, { parts: [], received: 0, total: -1, size: -1, resolve, reject, timer });
    try {
      nat.fetchRange(url, start, len, id);
    } catch (e) {
      clearTimeout(timer);
      bridgePending.delete(id);
      reject(e as Error);
    }
  });
  const bin = atob(out.b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const end = start + u8.length - 1;
  const cr = out.size > 0 ? `bytes ${start}-${end}/${out.size}` : `bytes ${start}-${end}/*`;
  return new Response(u8, {
    status: 206,
    headers: {
      'Content-Range': cr,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(u8.length),
    },
  });
}
