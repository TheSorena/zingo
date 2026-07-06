import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { movieRoutes } from './routes/movies';
import { seriesRoutes } from './routes/series';
import { genreRoutes } from './routes/genres';
import { userRoutes } from './routes/users';
import { favoriteRoutes } from './routes/favorites';
import { commentRoutes } from './routes/comments';
import { adRoutes } from './routes/ads';
import { adminRoutes } from './routes/admin';
import { scraperRoutes } from './routes/scraper';
import { errorHandler } from './middleware/errorHandler';
import './scheduler';

const prisma = new PrismaClient();
const app = express();

// ==================== Middleware ====================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, true);
  },
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================== Static Files ====================
app.use('/uploads', express.static('uploads'));

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scraper', scraperRoutes);

// ==================== Health Check ====================
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'Zingo API',
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// ==================== Root ====================
app.get('/', (_req, res) => {
  res.json({
    name: 'Zingo API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      movies: '/api/movies',
      series: '/api/series',
      genres: '/api/genres',
      auth: '/api/auth',
      scraper: '/scraper',
    },
  });
});

// ==================== Scraper Admin Panel ====================
let scraperRunning = false;

app.get('/scraper', async (_req, res) => {
  const movieCount = await prisma.movie.count();
  const seriesCount = await prisma.series.count();
  const genreCount = await prisma.genre.count();
  const logs = await prisma.scrapLog.findMany({ orderBy: { startedAt: 'desc' }, take: 5 });

  res.send(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zingo Scraper Panel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: #0f172a; color: #e2e8f0; min-height: 100vh; padding: 2rem; }
    .card { background: #1e293b; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #334155; }
    h1 { color: #f43f5e; margin-bottom: 1.5rem; }
    h2 { color: #94a3b8; font-size: 0.9rem; margin-bottom: 0.75rem; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat { text-align: center; }
    .stat .num { font-size: 2rem; font-weight: bold; color: #f43f5e; }
    .stat .label { color: #64748b; font-size: 0.85rem; }
    button { background: linear-gradient(135deg, #f43f5e, #fb923c); color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.75rem; font-size: 1rem; cursor: pointer; width: 100%; font-weight: bold; }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .status { padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.85rem; margin-top: 1rem; }
    .running { background: #166534; color: #86efac; }
    .idle { background: #1e3a5f; color: #93c5fd; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem; text-align: right; border-bottom: 1px solid #334155; font-size: 0.85rem; }
    th { color: #64748b; }
    .success { color: #4ade80; }
    .failed { color: #f87171; }
    #result { margin-top: 1rem; white-space: pre-wrap; font-family: monospace; font-size: 0.8rem; color: #94a3b8; max-height: 300px; overflow-y: auto; background: #0f172a; padding: 1rem; border-radius: 0.5rem; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Zingo Scraper Panel</h1>
    <div class="stats">
      <div class="stat"><div class="num">${movieCount}</div><div class="label">فیلم</div></div>
      <div class="stat"><div class="num">${seriesCount}</div><div class="label">سریال</div></div>
      <div class="stat"><div class="num">${genreCount}</div><div class="label">ژانر</div></div>
    </div>
    <button onclick="startScraper()" id="btn">شروع اسکرپ</button>
    <div class="status idle" id="status">آماده</div>
    <div id="result"></div>
  </div>
  <div class="card">
    <h2>آخرین لاگ‌ها</h2>
    <table>
      <tr><th>منبع</th><th>وضعیت</th><th>تعداد</th><th>زمان</th></tr>
      ${logs.map(l => '<tr><td>' + l.source + '</td><td class="' + (l.status === 'success' ? 'success' : 'failed') + '">' + l.status + '</td><td>' + l.itemsScraped + '</td><td>' + new Date(l.startedAt).toLocaleString('fa-IR') + '</td></tr>').join('')}
      ${logs.length === 0 ? '<tr><td colspan="4" style="color:#64748b">لاگی موجود نیست</td></tr>' : ''}
    </table>
  </div>
  <script>
    async function startScraper() {
      const btn = document.getElementById('btn');
      const status = document.getElementById('status');
      const result = document.getElementById('result');
      btn.disabled = true;
      status.textContent = 'در حال اجرا...';
      status.className = 'status running';
      result.style.display = 'block';
      result.textContent = 'شروع اسکرپ...\\n';
      try {
        const res = await fetch('/scraper/trigger', { method: 'POST' });
        const data = await res.json();
        result.textContent += JSON.stringify(data, null, 2) + '\\n';
        status.textContent = data.message || 'اسکرپر شروع شد';
        let checkCount = 0;
        const interval = setInterval(async () => {
          checkCount++;
          try {
            const r = await fetch('/scraper/status');
            const s = await r.json();
            result.textContent += new Date().toLocaleTimeString() + ' - فیلم‌ها: ' + s.movieCount + ' | سریال‌ها: ' + s.seriesCount + '\\n';
            result.scrollTop = result.scrollHeight;
            if (checkCount >= 30) { clearInterval(interval); btn.disabled = false; status.textContent = 'تمام شد'; status.className = 'status idle'; }
          } catch(e) {}
        }, 10000);
      } catch(e) {
        result.textContent += 'خطا: ' + e.message + '\\n';
        btn.disabled = false;
        status.textContent = 'خطا';
        status.className = 'status failed';
      }
    }
  </script>
</body>
</html>`);
});

app.post('/scraper/trigger', async (_req, res) => {
  if (scraperRunning) {
    return res.json({ success: false, message: 'اسکرپر در حال اجراست' });
  }
  scraperRunning = true;
  try {
    const { runScraper } = await import('./scrapers/ingestor');
    runScraper().finally(() => { scraperRunning = false; });
    res.json({ success: true, message: 'اسکرپر شروع شد! هر 10 ثانیه وضعیت آپدیت میشه.' });
  } catch (error) {
    scraperRunning = false;
    res.status(500).json({ success: false, message: 'خطا در شروع اسکرپر' });
  }
});

app.get('/api/scraper/status', async (_req, res) => {
  const movieCount = await prisma.movie.count();
  const seriesCount = await prisma.series.count();
  const genreCount = await prisma.genre.count();
  const lastLog = await prisma.scrapLog.findFirst({ orderBy: { startedAt: 'desc' } });
  res.json({ movieCount, seriesCount, genreCount, scraperRunning, lastLog });
});

// ==================== Error Handler ====================
app.use(errorHandler);

// ==================== Start Server ====================
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🎬 Zingo API Server Running      ║
  ║   🌐 http://localhost:${config.port}        ║
  ║   📊 Environment: ${config.nodeEnv.padEnd(17)}║
  ╚══════════════════════════════════════╝
  `);
});

export default app;
