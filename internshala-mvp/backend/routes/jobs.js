const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/jobs — filtered + paginated
router.get('/', async (req, res) => {
  try {
    const {
      search, location, experience, employmentType,
      role, skills, company, salaryRange, datePosted,
      page = '1', limit = '50',
    } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      conditions.push(`(
        LOWER(title) LIKE $${idx} OR
        LOWER(company) LIKE $${idx} OR
        EXISTS (SELECT 1 FROM unnest(skills) s WHERE LOWER(s) LIKE $${idx})
      )`);
      params.push(q);
      idx++;
    }

    if (location) {
      const l = location.toLowerCase();
      if (l === 'remote') {
        conditions.push(`LOWER(location) LIKE '%remote%'`);
      } else {
        conditions.push(`LOWER(location) LIKE $${idx} AND LOWER(location) NOT LIKE '%remote%'`);
        params.push(`%${l}%`);
        idx++;
      }
    }

    if (experience) {
      conditions.push(`LOWER(experience) LIKE $${idx}`);
      params.push(`%${experience.toLowerCase()}%`);
      idx++;
    }

    if (employmentType) {
      conditions.push(`LOWER(employment_type) = $${idx}`);
      params.push(employmentType.toLowerCase());
      idx++;
    }

    if (role) {
      conditions.push(`LOWER(title) LIKE $${idx}`);
      params.push(`%${role.toLowerCase()}%`);
      idx++;
    }

    if (skills) {
      const skillList = skills.split(',').map(s => s.trim().toLowerCase());
      for (const skill of skillList) {
        conditions.push(`$${idx} = ANY(skills)`);
        params.push(skill);
        idx++;
      }
    }

    if (company) {
      conditions.push(`LOWER(company) LIKE $${idx}`);
      params.push(`%${company.toLowerCase()}%`);
      idx++;
    }

    if (salaryRange) {
      conditions.push(`salary IS NOT NULL AND salary != 'Undisclosed'`);
      switch (salaryRange) {
        case 'below-3':
          conditions.push(`CAST(SPLIT_PART(REGEXP_REPLACE(salary, '.*₹(\\d+\\.?\\d*)L.*', '\\1'), ' ', 1) AS NUMERIC) < 3`);
          break;
        case '3-6':
          conditions.push(`CAST(SPLIT_PART(REGEXP_REPLACE(salary, '.*₹(\\d+\\.?\\d*)L.*', '\\1'), ' ', 1) AS NUMERIC) >= 3`);
          conditions.push(`CAST(SPLIT_PART(REGEXP_REPLACE(salary, '.*₹(\\d+\\.?\\d*)L.*', '\\1'), ' ', 1) AS NUMERIC) <= 6`);
          break;
        case '6-12':
          conditions.push(`CAST(SPLIT_PART(REGEXP_REPLACE(salary, '.*₹(\\d+\\.?\\d*)L.*', '\\1'), ' ', 1) AS NUMERIC) > 6`);
          conditions.push(`CAST(SPLIT_PART(REGEXP_REPLACE(salary, '.*₹(\\d+\\.?\\d*)L.*', '\\1'), ' ', 1) AS NUMERIC) <= 12`);
          break;
        case 'above-12':
          conditions.push(`CAST(SPLIT_PART(REGEXP_REPLACE(salary, '.*₹(\\d+\\.?\\d*)L.*', '\\1'), ' ', 1) AS NUMERIC) > 12`);
          break;
      }
    }

    if (datePosted) {
      const dateConds = [];
      if (datePosted === 'today') {
        dateConds.push(`posted_at ILIKE 'Today' OR posted_at ILIKE 'Just now'`);
      } else if (datePosted === 'week') {
        dateConds.push(`(
          posted_at ILIKE 'Today' OR posted_at ILIKE 'Just now' OR
          posted_at ILIKE 'Yesterday' OR
          posted_at ~ '^[A-Z][a-z]{2}\\s+\\d{1,2}$'
        )`);
      } else if (datePosted === 'month') {
        dateConds.push(`(
          posted_at ILIKE 'Today' OR posted_at ILIKE 'Just now' OR
          posted_at ILIKE 'Yesterday' OR
          posted_at ~ '^[A-Z][a-z]{2}\\s+\\d{1,2}$' OR
          posted_at ~ '^[A-Z][a-z]{2}\\s+\\d{1,2}$'
        )`);
      }
      if (dateConds.length > 0) {
        conditions.push(`(${dateConds.join(' OR ')})`);
      }
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await pool.query(`SELECT COUNT(*) FROM jobs ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT * FROM jobs ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limitNum, offset]
    );

    const jobs = dataResult.rows.map(mapJob);

    res.json({ data: jobs, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error('[Jobs] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    res.json({ data: mapJob(result.rows[0]) });
  } catch (err) {
    console.error('[Jobs] Get error:', err.message);
    res.status(500).json({ error: 'Failed to fetch job.' });
  }
});

function mapJob(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    companyLogo: row.company_logo || '',
    logoColor: row.logo_color,
    logoText: row.logo_text,
    location: row.location,
    salary: row.salary,
    experience: row.experience,
    employmentType: row.employment_type,
    skills: row.skills || [],
    description: row.description,
    responsibilities: row.responsibilities || [],
    benefits: row.benefits || [],
    postedAt: row.posted_at,
    duration: row.duration,
    matchScore: row.match_score || 0,
    source: row.source,
    redirect_url: row.redirect_url,
  };
}

module.exports = router;
