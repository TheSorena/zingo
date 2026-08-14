const JUNK_GENRES = ['موزیک', 'ورزشی', 'مسابقات ورزشی', 'رئالیتی شو'];

const JUNK_PATTERNS: RegExp[] = [
  /ملودی باکس/,
  /مووی باکس/,
  /هورتون/,
  /بروز رسانی/,
  /نسخه جدید/,
  /آموزش زبان/,
  /God of War/i,
  /Uncharted/i,
  /The Last of Us/i,
  /Ghost of Tsushima/i,
  /اجرای زنده/,
  /پخش زنده/,
  /تور جهانی/,
  /concert/i,
];

function isJunkContent(item: { title?: string; description?: string; genres?: { title: string }[] }): boolean {
  if (!item) return false;

  if (Array.isArray(item.genres)) {
    for (const genre of item.genres) {
      if (genre && JUNK_GENRES.includes(genre.title)) {
        return true;
      }
    }
  }

  const text = `${item.title || ''} ${item.description || ''}`;
  for (const pattern of JUNK_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

export function filterContent<T extends { title?: string; description?: string; genres?: { title: string }[] }>(
  items: T[] | null | undefined
): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => !isJunkContent(item));
}