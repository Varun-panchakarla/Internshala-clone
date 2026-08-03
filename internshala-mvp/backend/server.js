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

// Serve built frontend in production
const distPath = path.resolve(__dirname, '..', 'dist');
const indexPath = path.resolve(distPath, 'index.html');

// If the frontend build is missing (e.g., Render's build phase didn't produce it),
// build it in the background so the API server still comes up immediately and the
// frontend becomes available as soon as the build finishes. This avoids blocking
// app.listen and tripping Render's health check, which would restart the service.
function autoBuildFrontend() {
  console.log(`[Server] Frontend build missing at: ${indexPath}. Building in the background...`);
  const { exec } = require('child_process');
  const projectRoot = path.resolve(__dirname, '..');
  const run = (cmd) => new Promise((resolve, reject) => {
    exec(cmd, { cwd: projectRoot, timeout: 600000 }, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (err) reject(err);
      else resolve();
    });
  });
  (async () => {
    try {
      // Render sets NODE_ENV=production, which makes npm skip devDependencies,
      // so vite is never installed and the build would fail. Force dev deps in.
      console.log('[Server] Installing dependencies (including dev)...');
      await run('npm install --include=dev --no-audit --no-fund');
      console.log('[Server] Building frontend...');
      // Use vite directly instead of "npm run build" to skip the redundant
      // "npm install --prefix backend" step.
      await run('npx vite build');
      console.log(`[Server] Frontend build complete: ${distPath}`);
    } catch (buildErr) {
      console.error('[Server] Auto-build failed:', buildErr.message);
    }
  })();
}

if (!fs.existsSync(indexPath)) {
  autoBuildFrontend();
} else {
  console.log(`[Server] Serving frontend from: ${distPath}`);
}
app.use(express.static(distPath));

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
const { router: employerAuthRouter } = require('./routes/employerAuth.js');
const employerDashboardRouter = require('./routes/employerDashboard.js');
const messagesRouter = require('./routes/messages.js');
const notificationsRouter = require('./routes/notifications.js');

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/saved', savedRouter);
app.use('/api/applied', appliedRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/employer', employerAuthRouter);
app.use('/api/employer/dashboard', employerDashboardRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);

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

// SPA catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`[SPA Error] index.html not found at: ${indexPath}`);
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
    `CREATE TABLE IF NOT EXISTS employers (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      recruiter_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      website VARCHAR(255),
      password_hash VARCHAR(255) NOT NULL,
      email_verified BOOLEAN DEFAULT false,
      otp_code VARCHAR(255),
      otp_expires_at TIMESTAMPTZ,
      otp_attempts INTEGER DEFAULT 0,
      last_otp_sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS employer_profiles (
      id SERIAL PRIMARY KEY,
      employer_id INTEGER UNIQUE REFERENCES employers(id) ON DELETE CASCADE,
      company_logo TEXT,
      industry VARCHAR(255),
      company_size VARCHAR(100),
      founded_year VARCHAR(10),
      website VARCHAR(255),
      linkedin VARCHAR(255),
      description TEXT,
      headquarters VARCHAR(255),
      office_locations TEXT,
      hiring_locations TEXT,
      work_mode VARCHAR(100),
      designation VARCHAR(255),
      department VARCHAR(255),
      official_phone VARCHAR(20),
      onboarding_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS employer_password_resets (
      id SERIAL PRIMARY KEY,
      employer_id INTEGER REFERENCES employers(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employer_id INTEGER REFERENCES employers(id) ON DELETE SET NULL",
    `CREATE TABLE IF NOT EXISTS interviews (
      id SERIAL PRIMARY KEY,
      employer_id INTEGER REFERENCES employers(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      job_id VARCHAR(100) REFERENCES jobs(id) ON DELETE CASCADE,
      scheduled_at TIMESTAMPTZ NOT NULL,
      round VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Scheduled',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS employer_notifications (
      id SERIAL PRIMARY KEY,
      employer_id INTEGER REFERENCES employers(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_date_to_apply DATE",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true",
    `CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      employer_id INTEGER REFERENCES employers(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      sender VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages (employer_id, user_id, created_at)`,
    "ALTER TABLE employer_notifications ADD COLUMN IF NOT EXISTS reference_id VARCHAR(255)",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_employer_notif_ref ON employer_notifications (employer_id, reference_id)",
    `CREATE TABLE IF NOT EXISTS user_notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    "CREATE INDEX IF NOT EXISTS idx_user_notifications ON user_notifications (user_id, read, created_at DESC)",
    `DELETE FROM interviews a USING interviews b
     WHERE a.employer_id = b.employer_id
       AND a.user_id = b.user_id
       AND a.job_id = b.job_id
       AND a.id < b.id`,
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_interviews_uniq ON interviews (employer_id, user_id, job_id)"
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
    ['email_log_id_seq', 'email_log'],
    ['interviews_id_seq', 'interviews'],
    ['employer_notifications_id_seq', 'employer_notifications'],
    ['user_notifications_id_seq', 'user_notifications']
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