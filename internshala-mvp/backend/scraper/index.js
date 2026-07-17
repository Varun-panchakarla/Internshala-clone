const { fetchFromAdzuna } = require('./adzuna.js');
const { fetchMNCJobs } = require('./mncJobs.js');
const { fetchFromJobApi } = require('./jobApi.js');
const fs = require('fs');
const path = require('path');

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

  // Primary: Adzuna API — general broad searches
  console.log('[Scraper] Running Adzuna API...');
  const adzunaJobs = await fetchFromAdzuna();

  // MNC scraper — company-specific searches via Indeed + Adzuna
  console.log('[Scraper] Running MNC company scraper...');
  const mncJobs = await fetchMNCJobs();

  // Merge all sources
  let jobs = [...adzunaJobs, ...mncJobs];

  // Fallback: Indeed API if everything above returned nothing
  if (jobs.length === 0) {
    console.log('[Scraper] Primary sources returned 0 jobs. Falling back to Indeed API...');
    jobs = await fetchFromJobApi();
  }

  if (jobs.length === 0) {
    console.log('[Scraper] No jobs from any source. Writing empty array.');
    fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }

  const deduped = deduplicate(jobs);
  const finalJobs = shuffle(deduped);

  const withScore = finalJobs.map((j, idx) => ({
    ...j,
    id: j.id || `job-${Date.now()}-${idx}`,
    matchScore: 0,
  }));

  const json = JSON.stringify(withScore, null, 2);
  fs.writeFileSync(JOBS_FILE, json, 'utf-8');
  console.log(`[Scraper] Saved ${withScore.length} real jobs to ${JOBS_FILE}`);

  return withScore;
}

module.exports = { scrapeAll };
