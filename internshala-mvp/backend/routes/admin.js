const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();
const SALT_ROUNDS = 12;

// Admin Verification Middleware
async function adminMiddleware(req, res, next) {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0 || !['admin', 'super_admin'].includes(result.rows[0].role)) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    req.user.role = result.rows[0].role;
    next();
  } catch (err) {
    console.error('[Admin Middleware] Verification error:', err.message);
    res.status(500).json({ error: 'Failed to verify administrator status.' });
  }
}

// Attach authentication and admin checks to all routes below
router.use(authMiddleware);
router.use(adminMiddleware);

// ── 1. DASHBOARD STATISTICS & CHARTS ───────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    // KPI Counts
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const candidatesCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'candidate'");
    const recruitersCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'recruiter'");
    const jobsCount = await pool.query('SELECT COUNT(*) FROM jobs');
    const appsCount = await pool.query('SELECT COUNT(*) FROM applied_jobs');
    const companiesCount = await pool.query('SELECT COUNT(DISTINCT company) FROM jobs');

    // Recent user registrations
    const recentRegs = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    // Recent job postings
    const recentJobs = await pool.query(
      'SELECT id, title, company, location, employment_type, created_at FROM jobs ORDER BY created_at DESC LIMIT 5'
    );

    // Pending applications review count
    const pendingApps = await pool.query(
      "SELECT COUNT(*) FROM applied_jobs WHERE status = 'Pending'"
    );

    // Mock analytical growth data for chart visualizations
    const growthData = [
      { month: 'Feb', users: 15, jobs: 120, applications: 45 },
      { month: 'Mar', users: 32, jobs: 240, applications: 98 },
      { month: 'Apr', users: 58, jobs: 380, applications: 180 },
      { month: 'May', users: 89, jobs: 510, applications: 310 },
      { month: 'Jun', users: 124, jobs: 780, applications: 450 },
      { month: 'Jul', users: 185, jobs: 1331, applications: 672 }
    ];

    res.json({
      stats: {
        totalUsers: parseInt(usersCount.rows[0].count),
        candidates: parseInt(candidatesCount.rows[0].count),
        recruiters: parseInt(recruitersCount.rows[0].count),
        activeJobs: parseInt(jobsCount.rows[0].count),
        totalApplications: parseInt(appsCount.rows[0].count),
        companies: parseInt(companiesCount.rows[0].count),
        pendingApplications: parseInt(pendingApps.rows[0].count),
        revenue: parseInt(jobsCount.rows[0].count) * 25 + parseInt(recruitersCount.rows[0].count) * 150 // Mock revenue model ($25/job, $150/recruiter)
      },
      growthData,
      recentRegistrations: recentRegs.rows,
      recentJobs: recentJobs.rows
    });
  } catch (err) {
    console.error('[Admin Stats] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// ── 2. USERS & RECRUITERS CRUD ──────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(LOWER(name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex})`);
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (role) {
      conditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countRes = await pool.query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].count);

    const usersQuery = `
      SELECT u.id, u.email, u.name, u.role, u.created_at, p.college, p.degree, p.experience, p.skills
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataRes = await pool.query(usersQuery, [...params, parseInt(limit), offset]);

    res.json({ users: dataRes.rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Admin Users List] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const selectedRole = ['candidate', 'recruiter', 'admin', 'super_admin'].includes(role) ? role : 'candidate';

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const userResult = await pool.query(
      'INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at',
      [cleanEmail, cleanName, hash, selectedRole]
    );
    const user = userResult.rows[0];

    // Create profile stub
    await pool.query(
      "INSERT INTO profiles (user_id, full_name, experience, employment_type) VALUES ($1, $2, 'Fresher', 'Full-time')",
      [user.id, cleanName]
    );

    res.status(201).json({ user });
  } catch (err) {
    console.error('[Admin User Create] Error:', err.message);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = parseInt(req.params.id);

    if (userId === req.user.userId && role && role !== req.user.role) {
      return res.status(400).json({ error: 'You cannot change your own administrator privileges.' });
    }

    const updateRes = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role), updated_at = NOW() WHERE id = $4 RETURNING id, email, name, role',
      [name?.trim() || null, email?.trim().toLowerCase() || null, role || null, userId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Keep profile full_name synced
    if (name) {
      await pool.query('UPDATE profiles SET full_name = $1 WHERE user_id = $2', [name.trim(), userId]);
    }

    res.json({ user: updateRes.rows[0] });
  } catch (err) {
    console.error('[Admin User Update] Error:', err.message);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('[Admin User Delete] Error:', err.message);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// ── 3. JOBS CRUD ────────────────────────────────────────────────────────────
router.get('/jobs', async (req, res) => {
  try {
    const { search, company, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(LOWER(title) LIKE $${paramIndex} OR LOWER(company) LIKE $${paramIndex})`);
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (company) {
      conditions.push(`company = $${paramIndex}`);
      params.push(company);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countRes = await pool.query(`SELECT COUNT(*) FROM jobs ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].count);

    const jobsQuery = `
      SELECT * FROM jobs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataRes = await pool.query(jobsQuery, [...params, parseInt(limit), offset]);

    res.json({ jobs: dataRes.rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Admin Jobs List] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const { title, company, location, salary, experience, employmentType, skills, description } = req.body;
    if (!title || !company) {
      return res.status(400).json({ error: 'Title and company are required.' });
    }

    const id = `job_${Date.now()}`;
    const skillsArray = Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : [];

    const result = await pool.query(
      `INSERT INTO jobs (
        id, title, company, location, salary, experience, employment_type, skills, description, posted_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Just now', NOW()) RETURNING *`,
      [id, title, company, location || 'Remote', salary || 'Undisclosed', experience || '0-1 years', employmentType || 'Full-time', skillsArray, description || '']
    );

    res.status(201).json({ job: result.rows[0] });
  } catch (err) {
    console.error('[Admin Job Create] Error:', err.message);
    res.status(500).json({ error: 'Failed to create job.' });
  }
});

router.put('/jobs/:id', async (req, res) => {
  try {
    const { title, company, location, salary, experience, employmentType, skills, description } = req.body;
    const jobId = req.params.id;

    const skillsArray = Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : undefined;

    const result = await pool.query(
      `UPDATE jobs SET
        title = COALESCE($1, title),
        company = COALESCE($2, company),
        location = COALESCE($3, location),
        salary = COALESCE($4, salary),
        experience = COALESCE($5, experience),
        employment_type = COALESCE($6, employment_type),
        skills = COALESCE($7, skills),
        description = COALESCE($8, description)
      WHERE id = $9 RETURNING *`,
      [title || null, company || null, location || null, salary || null, experience || null, employmentType || null, skillsArray || null, description || null, jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    res.json({ job: result.rows[0] });
  } catch (err) {
    console.error('[Admin Job Update] Error:', err.message);
    res.status(500).json({ error: 'Failed to update job.' });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING id', [jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    console.error('[Admin Job Delete] Error:', err.message);
    res.status(500).json({ error: 'Failed to delete job.' });
  }
});

// ── 4. APPLICATIONS CRUD ────────────────────────────────────────────────────
router.get('/applications', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(LOWER(u.name) LIKE $${paramIndex} OR LOWER(j.title) LIKE $${paramIndex} OR LOWER(j.company) LIKE $${paramIndex})`);
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`aj.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM applied_jobs aj
       JOIN users u ON aj.user_id = u.id
       JOIN jobs j ON aj.job_id = j.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    const appsQuery = `
      SELECT aj.id, aj.user_id, aj.job_id, aj.status, aj.applied_at,
             u.name AS candidate_name, u.email AS candidate_email,
             j.title AS job_title, j.company AS job_company
      FROM applied_jobs aj
      JOIN users u ON aj.user_id = u.id
      JOIN jobs j ON aj.job_id = j.id
      ${whereClause}
      ORDER BY aj.applied_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataRes = await pool.query(appsQuery, [...params, parseInt(limit), offset]);

    res.json({ applications: dataRes.rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Admin Applications List] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

router.put('/applications/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const appId = parseInt(req.params.id);

    if (!['Pending', 'Reviewed', 'Shortlisted', 'Interviewing', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid application status.' });
    }

    const result = await pool.query(
      'UPDATE applied_jobs SET status = $1 WHERE id = $2 RETURNING *',
      [status, appId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json({ application: result.rows[0] });
  } catch (err) {
    console.error('[Admin Application Update] Error:', err.message);
    res.status(500).json({ error: 'Failed to update application.' });
  }
});

router.delete('/applications/:id', async (req, res) => {
  try {
    const appId = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM applied_jobs WHERE id = $1 RETURNING id', [appId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json({ message: 'Application deleted successfully.' });
  } catch (err) {
    console.error('[Admin Application Delete] Error:', err.message);
    res.status(500).json({ error: 'Failed to delete application.' });
  }
});

// ── 5. COMPANIES & TEMPLATES UTILS ─────────────────────────────────────────
router.get('/companies', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT company, company_logo, logo_color FROM jobs WHERE company IS NOT NULL'
    );
    res.json({ companies: result.rows });
  } catch (err) {
    console.error('[Admin Companies] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch companies.' });
  }
});

module.exports = router;
