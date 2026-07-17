const { fetchFromAdzuna } = require('./adzuna.js');
const { fetchMNCJobs } = require('./mncJobs.js');
const { fetchFromJobApi } = require('./jobApi.js');
const pool = require('../db/pool');

function deduplicate(jobs) {
  const seen = new Map();
  for (const job of jobs) {
    const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}|${(job.location || '').toLowerCase()}`;
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

async function insertJobs(jobs) {
  let inserted = 0;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const job of jobs) {
      try {
        await client.query(
          `INSERT INTO jobs (
            id, title, company, company_logo, logo_color, logo_text,
            location, salary, experience, employment_type, skills,
            description, responsibilities, benefits, posted_at,
            duration, match_score, source, redirect_url, created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            company = EXCLUDED.company,
            location = EXCLUDED.location,
            salary = EXCLUDED.salary,
            experience = EXCLUDED.experience,
            employment_type = EXCLUDED.employment_type,
            skills = EXCLUDED.skills,
            description = EXCLUDED.description,
            posted_at = EXCLUDED.posted_at,
            redirect_url = EXCLUDED.redirect_url`,
          [
            job.id, job.title, job.company, job.companyLogo || '',
            job.logoColor || null, job.logoText || null,
            job.location || null, job.salary || null,
            job.experience || null, job.employmentType || null,
            job.skills || [],
            job.description || null,
            JSON.stringify(job.responsibilities || []),
            JSON.stringify(job.benefits || []),
            job.postedAt || null, job.duration || null,
            job.matchScore || 0, job.source || null,
            job.redirect_url || null, new Date(),
          ]
        );
        inserted++;
      } catch (err) {
        console.error(`[Scraper] DB insert error for ${job.id}: ${err.message}`);
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Scraper] Transaction error:', err.message);
  } finally {
    client.release();
  }
  return inserted;
}

async function scrapeAll() {
  console.log('[Scraper] Starting job collection...');

  console.log('[Scraper] Running Adzuna API...');
  const adzunaJobs = await fetchFromAdzuna();

  console.log('[Scraper] Running MNC company scraper...');
  const mncJobs = await fetchMNCJobs();

  let jobs = [...adzunaJobs, ...mncJobs];

  if (jobs.length === 0) {
    console.log('[Scraper] Primary sources returned 0 jobs. Falling back to Indeed API...');
    jobs = await fetchFromJobApi();
  }

  if (jobs.length === 0) {
    console.log('[Scraper] No jobs from any source.');
    return [];
  }

  const deduped = deduplicate(jobs);
  const finalJobs = shuffle(deduped);

  const withScore = finalJobs.map((j, idx) => ({
    ...j,
    id: j.id || `job-${Date.now()}-${idx}`,
    matchScore: 0,
  }));

  const inserted = await insertJobs(withScore);
  console.log(`[Scraper] Inserted/updated ${inserted} jobs to PostgreSQL.`);

  return withScore;
}

module.exports = { scrapeAll };
