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
const { notifyNewJobs, sendDailyJobReminders, sendResumeReminders } = require('./utils/notifications');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL || 'https://incuxai-careers.onrender.com',
        'https://incuxai-careers-2tv2.onrender.com'
      ]
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Serve built frontend in production with robust fallback paths
const possibleDistPaths = [
  path.resolve(__dirname, '..', 'dist'), // Standard: backend/../dist
  path.resolve(__dirname, '..', '..', 'dist'), // Nested: backend/../../dist
  path.resolve(process.cwd(), 'dist'), // Cwd-based check
  path.resolve(process.cwd(), 'internshala-mvp', 'dist'), // Root-based check
];

// Register express.static for all possible dist paths
possibleDistPaths.forEach(p => {
  app.use(express.static(p));
});

// Determine distPath for the catch-all SPA route
let distPath = possibleDistPaths[0];
for (const p of possibleDistPaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    distPath = p;
    console.log(`[Server] Found valid frontend build assets at: ${distPath}`);
    break;
  }
}
if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.warn(`[Server Warning] Static files directory or index.html not found. Checked paths: ${JSON.stringify(possibleDistPaths)}`);
}

// Routes
const { router: authRouter } = require('./routes/auth.js');
const profileRouter = require('./routes/profile.js');
const jobsRouter = require('./routes/jobs.js');
const savedRouter = require('./routes/saved.js');
const appliedRouter = require('./routes/applied.js');
const resumeRouter = require('./routes/resume.js');
const adminRouter = require('./routes/admin.js');
const issuesRouter = require('./routes/issues.js');
const onboardingRouter = require('./routes/onboarding.js');

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/saved', savedRouter);
app.use('/api/applied', appliedRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/onboarding', onboardingRouter);

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

// SPA catch-all: serve index.html for any non-API route (client-side routing)
app.get('*', (req, res) => {
  // Find which path contains index.html dynamically on request
  let activeDistPath = possibleDistPaths[0];
  for (const p of possibleDistPaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      activeDistPath = p;
      break;
    }
  }
  const indexPath = path.resolve(activeDistPath, 'index.html');
  console.log(`[SPA Catch-all] Request URL: ${req.originalUrl || req.url}. Serving index.html from: ${indexPath}`);
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`[SPA Catch-all Error] index.html not found at: ${indexPath}`);
    res.status(404).json({ error: 'Frontend not built. Run "npm run build" first.' });
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
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'candidate'",
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
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_city VARCHAR(255)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(50)',
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}'",
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_status VARCHAR(100)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course VARCHAR(255)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stream VARCHAR(255)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS start_year VARCHAR(10)',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS end_year VARCHAR(10)',
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}'",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT '{}'",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_modes TEXT[] DEFAULT '{}'",
    "ALTER TABLE applied_jobs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending'",
    `CREATE TABLE IF NOT EXISTS email_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      email_type VARCHAR(50) NOT NULL,
      sent_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, email_type, DATE(sent_at))
    )`,
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_attempts INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_otp_sent_at TIMESTAMPTZ",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT true",
    `CREATE TABLE IF NOT EXISTS phone_otps (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      phone_number VARCHAR(20) NOT NULL,
      otp_code VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER DEFAULT 0,
      last_sent_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
  ];
  for (const sql of migrations) {
    try { await pool.query(sql); } catch { /* column may already exist */ }
  }
  try { await seedJobs(); } catch (err) { console.error('[DB] Seed error:', err.message); }
  // Reset sequences to match current max IDs (fixes gaps after DELETE or TRUNCATE)
  const seqReset = [
    ['users_id_seq', 'users'],
    ['profiles_id_seq', 'profiles'],
    ['saved_jobs_id_seq', 'saved_jobs'],
    ['applied_jobs_id_seq', 'applied_jobs'],
    ['issue_reports_id_seq', 'issue_reports'],
    ['password_resets_id_seq', 'password_resets'],
    ['email_log_id_seq', 'email_log']
  ];
  for (const [seq, tbl] of seqReset) {
    try {
      await pool.query(`SELECT setval('${seq}', COALESCE((SELECT MAX(id) FROM ${tbl}), 0) + 1, false)`);
    } catch {
      // Ignore if table/sequence doesn't exist
    }
  }
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
    await notifyNewJobs(jobs);
  } catch (err) {
    console.error('[Cron] Scrape failed:', err.message);
  }
});

// Schedule: daily job reminder at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('[Cron] Running daily job reminders...');
  await sendDailyJobReminders();
});

// Schedule: weekly resume builder reminder every Monday at 10:00 AM
cron.schedule('0 10 * * 1', async () => {
  console.log('[Cron] Running weekly resume reminders...');
  await sendResumeReminders();
});

app.listen(PORT, async () => {
  console.log(`[Server] Job Portal API running on http://localhost:${PORT}`);
  await initDb();
  await ensureJobs();
});