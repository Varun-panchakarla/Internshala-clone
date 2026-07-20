const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const fs = require('fs');
const { scrapeAll } = require('./scraper/index.js');
const pool = require('./db/pool');
const { seedJobs } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
const { router: authRouter } = require('./routes/auth.js');
const profileRouter = require('./routes/profile.js');
const jobsRouter = require('./routes/jobs.js');
const savedRouter = require('./routes/saved.js');
const appliedRouter = require('./routes/applied.js');
const resumeRouter = require('./routes/resume.js');

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/saved', savedRouter);
app.use('/api/applied', appliedRouter);
app.use('/api/resume', resumeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime().toFixed(0) + 's' });
});

// Trigger manual scrape
app.post('/api/scrape', async (req, res) => {
  try {
    const jobs = await scrapeAll();
    res.json({ message: 'Scraping complete', count: jobs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize DB schema + seed on startup
async function initDb() {
  try {
    const schemaSql = fs.readFileSync(path.resolve(__dirname, 'db', 'init.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('[DB] Schema initialized.');
  } catch (err) {
    console.error('[DB] Schema init error:', err.message);
  }
  // Run migrations separately (ignore errors for existing columns)
  const migrations = [
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id INTEGER',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photo TEXT',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college VARCHAR(255)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS degree VARCHAR(255)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_role VARCHAR(255)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(255)',
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'Full-time'",
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_info JSONB',
    'ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS uq_profiles_user UNIQUE (user_id)',
  ];
  for (const sql of migrations) {
    try { await pool.query(sql); } catch { /* column may already exist */ }
  }
  try { await seedJobs(); } catch (err) { console.error('[DB] Seed error:', err.message); }
}

// Check if jobs table is empty -> trigger scrape
async function ensureJobs() {
  try {
    const result = await pool.query('SELECT COUNT(*) AS count FROM jobs');
    const count = parseInt(result.rows[0].count);
    if (count === 0) {
      console.log('[Server] Jobs table is empty. Running initial scrape...');
      await scrapeAll();
    } else {
      console.log(`[Server] Jobs table has ${count} jobs.`);
    }
  } catch (err) {
    console.error('[Server] Jobs check error:', err.message);
  }
}

// Schedule: scrape every 12 hours (at midnight and noon)
cron.schedule('0 */12 * * *', async () => {
  console.log('[Cron] Running scheduled scrape...');
  try {
    const jobs = await scrapeAll();
    console.log(`[Cron] Scrape complete: ${jobs.length} jobs`);
  } catch (err) {
    console.error('[Cron] Scrape failed:', err.message);
  }
});

app.listen(PORT, async () => {
  console.log(`[Server] Job Portal API running on http://localhost:${PORT}`);
  await initDb();
  await ensureJobs();
});