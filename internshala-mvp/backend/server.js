const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const { scrapeAll } = require('./scraper/index.js');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const jobsRouter = require('./routes/jobs.js');
const resumeRouter = require('./routes/resume.js');
app.use('/api/jobs', jobsRouter);
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

// Initialize jobs on startup
async function initJobs() {
  const JOBS_FILE = path.resolve(__dirname, 'jobs.json');

  if (!fs.existsSync(JOBS_FILE) || fs.statSync(JOBS_FILE).size < 10) {
    console.log('[Server] No jobs.json found. Running initial scrape...');
    try {
      await scrapeAll();
    } catch (err) {
      console.error('[Server] Initial scrape failed:', err.message);
      console.log('[Server] No seed data fallback — only real jobs will be shown.');
      fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } else {
    console.log(`[Server] jobs.json exists with ${JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8')).length} jobs.`);
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
  await initJobs();
});
