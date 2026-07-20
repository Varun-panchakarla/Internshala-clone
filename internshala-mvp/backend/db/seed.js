const pool = require('./pool');
const fs = require('fs');
const path = require('path');

const JOBS_FILE = path.resolve(__dirname, '..', 'jobs.json');

async function seedJobs() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM jobs');
    const count = parseInt(rows[0].count);
    if (count > 0) {
      console.log(`[Seed] Jobs table already has ${count} rows — skipping seed.`);
      return false;
    }

    if (!fs.existsSync(JOBS_FILE)) {
      console.log('[Seed] jobs.json not found — skipping.');
      return false;
    }

    const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
    const jobs = JSON.parse(raw);
    if (!Array.isArray(jobs) || jobs.length === 0) {
      console.log('[Seed] jobs.json is empty — skipping.');
      return false;
    }

    console.log(`[Seed] Inserting ${jobs.length} jobs...`);

    // Batch insert using multiple rows per INSERT (faster than one-by-one)
    const BATCH_SIZE = 100;
    let totalInserted = 0;

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const values = [];
      const params = [];
      let p = 1;

      for (const job of batch) {
        values.push(`($${p},$${p+1},$${p+2},$${p+3},$${p+4},$${p+5},$${p+6},$${p+7},$${p+8},$${p+9},$${p+10},$${p+11},$${p+12},$${p+13},$${p+14},$${p+15},$${p+16},$${p+17},$${p+18},$${p+19})`);
        params.push(
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
          job.redirect_url || null, new Date()
        );
        p += 20;
      }

      const sql = `INSERT INTO jobs (
        id, title, company, company_logo, logo_color, logo_text,
        location, salary, experience, employment_type, skills,
        description, responsibilities, benefits, posted_at,
        duration, match_score, source, redirect_url, created_at
      ) VALUES ${values.join(',')} ON CONFLICT (id) DO NOTHING`;

      const result = await pool.query(sql, params);
      totalInserted += result.rowCount;
    }

    console.log(`[Seed] Inserted ${totalInserted} jobs into PostgreSQL.`);
    return true;
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    return false;
  }
}

module.exports = { seedJobs };
