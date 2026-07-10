const { scrapeInternshala } = require('./internshala.js');
const { scrapeNaukri } = require('./naukri.js');
const { scrapeIndeed } = require('./indeed.js');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const JOBS_FILE = path.resolve(__dirname, '..', 'jobs.json');

function deduplicate(jobs) {
  const seen = new Map();
  for (const job of jobs) {
    const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}|${job.location.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.set(key, job);
    }
  }
  return Array.from(seen.values());
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function scrapeAll() {
  console.log('[Scraper] Starting job collection...');

  const results = await Promise.allSettled([
    scrapeInternshala(),
    scrapeNaukri(),
    scrapeIndeed()
  ]);

  let allJobs = [];

  const SOURCES = ['internshala', 'naukri', 'indeed'];
  results.forEach((res, i) => {
    if (res.status === 'fulfilled' && Array.isArray(res.value) && res.value.length > 0) {
      console.log(`[Scraper] ${SOURCES[i]}: ${res.value.length} jobs`);
      allJobs = allJobs.concat(res.value);
    } else {
      console.log(`[Scraper] ${SOURCES[i]}: 0 jobs (failed or empty)`);
    }
  });

  if (allJobs.length === 0) {
    console.log('[Scraper] No jobs from any source! Writing fallback seed data.');
    const fallbackJobs = require('./seed.js');
    allJobs = fallbackJobs();
  }

  const deduped = deduplicate(allJobs);
  const finalJobs = shuffle(deduped);

  // Add matchScore = 0 to all
  const withScore = finalJobs.map((j, idx) => ({
    ...j,
    id: j.id || `job-${Date.now()}-${idx}`,
    matchScore: 0
  }));

  const json = JSON.stringify(withScore, null, 2);
  fs.writeFileSync(JOBS_FILE, json, 'utf-8');
  console.log(`[Scraper] Saved ${withScore.length} jobs to ${JOBS_FILE}`);

  return withScore;
}

module.exports = { scrapeAll };
