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
  console.log('[Admin Stats API] Request received.');
  
  // 1. PostgreSQL KPI counts with separate try-catch blocks
  let totalUsers = 0;
  try {
    const r = await pool.query('SELECT COUNT(*) FROM users');
    totalUsers = parseInt(r.rows[0].count);
  } catch (err) {
    console.error('[Admin Stats Detail Error] SELECT COUNT(*) FROM users failed:', err.message);
  }

  let candidates = 0;
  try {
    const r = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'candidate'");
    candidates = parseInt(r.rows[0].count);
  } catch (err) {
    console.error("[Admin Stats Detail Error] SELECT COUNT(*) FROM users WHERE role = 'candidate' failed:", err.message);
  }

  let recruiters = 0;
  try {
    const r = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'recruiter'");
    recruiters = parseInt(r.rows[0].count);
  } catch (err) {
    console.error("[Admin Stats Detail Error] SELECT COUNT(*) FROM users WHERE role = 'recruiter' failed:", err.message);
  }

  let activeJobs = 0;
  try {
    const r = await pool.query('SELECT COUNT(*) FROM jobs');
    activeJobs = parseInt(r.rows[0].count);
  } catch (err) {
    console.error('[Admin Stats Detail Error] SELECT COUNT(*) FROM jobs failed:', err.message);
  }

  let pgAppsCount = 0;
  try {
    const r = await pool.query('SELECT COUNT(*) FROM applied_jobs');
    pgAppsCount = parseInt(r.rows[0].count);
  } catch (err) {
    console.error('[Admin Stats Detail Error] SELECT COUNT(*) FROM applied_jobs failed:', err.message);
  }

  let companies = 0;
  try {
    const r = await pool.query('SELECT COUNT(DISTINCT company) FROM jobs');
    companies = parseInt(r.rows[0].count);
  } catch (err) {
    console.error('[Admin Stats Detail Error] SELECT COUNT(DISTINCT company) FROM jobs failed:', err.message);
  }

  let recentRegistrations = [];
  try {
    const r = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );
    recentRegistrations = r.rows;
  } catch (err) {
    console.error('[Admin Stats Detail Error] SELECT users ORDER BY created_at DESC LIMIT 5 failed:', err.message);
  }

    // Recent job postings
    const recentJobs = await pool.query(
      'SELECT id, title, company, location, employment_type, company_logo as "companyLogo", created_at FROM jobs ORDER BY created_at DESC LIMIT 5'
    );
    recentJobsList = r.rows;
  } catch (err) {
    console.error('[Admin Stats Detail Error] SELECT jobs ORDER BY created_at DESC LIMIT 5 failed:', err.message);
  }

  let pendingApplications = 0;
  try {
    const r = await pool.query("SELECT COUNT(*) FROM applied_jobs WHERE status = 'Pending'");
    pendingApplications = parseInt(r.rows[0].count);
  } catch (err) {
    console.error("[Admin Stats Detail Error] SELECT COUNT(*) FROM applied_jobs WHERE status = 'Pending' failed:", err.message);
  }

  // 2. Connect to MongoDB to query application counts
  let totalApps = 0;
  let appCounts = {};
  let mongoClient;
  try {
    const { MongoClient } = require('mongodb');
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/internshala';
    mongoClient = new MongoClient(mongoUri, { 
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000 
    });
    
    await mongoClient.connect();
    const db = mongoClient.db();
    
    // Dynamically query available collections to resolve collection name issues
    const collections = await db.listCollections().toArray();
    const colNames = collections.map(c => c.name);
    console.log('[Admin Stats Mongo Info] Available collections:', colNames);
    
    let collectionName = 'applications';
    if (colNames.includes('applications')) {
      collectionName = 'applications';
    } else if (colNames.includes('applied_jobs')) {
      collectionName = 'applied_jobs';
    } else if (colNames.includes('job_applications')) {
      collectionName = 'job_applications';
    } else if (colNames.includes('applies')) {
      collectionName = 'applies';
    } else if (colNames.length > 0) {
      collectionName = colNames[0];
    }
    
    console.log(`[Admin Stats Mongo Info] Using MongoDB collection: "${collectionName}"`);
    const collection = db.collection(collectionName);
    totalApps = await collection.countDocuments();
    
    // Aggregation pipeline to group job applications by month (resilient date fields)
    const pipeline = [
      {
        $project: {
          dateField: { 
            $ifNull: [
              "$createdAt", 
              { $ifNull: ["$appliedAt", { $ifNull: ["$date", "$applied_at"] }] }
            ] 
          }
        }
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: "%Y-%m",
              date: { $toDate: "$dateField" }
            }
          }
        }
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 }
        }
      }
    ];
    
    const results = await collection.aggregate(pipeline).toArray();
    results.forEach(r => {
      if (r._id) {
        appCounts[r._id] = r.count;
      }
    });
    console.log('[Admin Stats Mongo Success] Retrieved monthly applications:', appCounts);
  } catch (mongoErr) {
    console.error('[Admin Stats Mongo Error] Failed to connect or query MongoDB:', mongoErr.message);
  } finally {
    if (mongoClient) {
      try {
        await mongoClient.close();
      } catch (closeErr) {
        console.error('[Admin Stats Mongo Error] Failed to close client:', closeErr.message);
      }
    }
  }

  // 3. PostgreSQL grouped users query
  const userCounts = {};
  try {
    const usersResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS month_key,
        COUNT(*)::int AS count
      FROM users
      WHERE role = 'candidate'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    `);
    usersResult.rows.forEach(row => {
      userCounts[row.month_key] = row.count;
    });
    console.log('[Admin Stats PG Success] Grouped user registrations count:', userCounts);
  } catch (pgErr) {
    console.error('[Admin Stats PG Error] Grouped users query failed:', pgErr.message);
  }

  // 4. Build growthData for the last 6 months dynamically (showing 0 if no records exist for a month)
  let growthData = [];
  if (candidates > 0 || totalApps > 0 || pgAppsCount > 0) {
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().slice(0, 7); // '2026-07'
      const monthLabel = d.toLocaleString('default', { month: 'short' }); // 'Jul'
      
      growthData.push({
        month: monthLabel,
        users: userCounts[monthKey] || 0,
        applications: appCounts[monthKey] || (pgAppsCount > 0 ? Math.round(pgAppsCount / 6) : 0) // Fallback estimates if MongoDB application collection has no items
      });
    }
  }

  // Return HTTP 200 with Stats and Growth Data using real database data
  console.log('[Admin Stats API Success] Returning stats and growthData. Length:', growthData.length);
  return res.status(200).json({
    stats: {
      totalUsers,
      candidates,
      recruiters,
      activeJobs,
      totalApplications: pgAppsCount || totalApps,
      companies,
      pendingApplications,
      revenue: activeJobs * 25 + recruiters * 150
    },
    growthData,
    recentRegistrations,
    recentJobs: recentJobsList
  });
});

// GET /api/admin/analytics - Real-time candidate sign-ups growth grouped by month
router.get('/analytics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS month_key,
        TO_CHAR(created_at, 'Mon') AS month_label,
        COUNT(*)::int AS count
      FROM users
      WHERE role = 'candidate'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM'), TO_CHAR(created_at, 'Mon')
      ORDER BY month_key ASC
    `);
    
    if (result.rows.length === 0) {
      return res.json({ signups: [] });
    }

    const rows = result.rows;
    const signups = [];
    
    const minDateStr = rows[0].month_key + '-01';
    const maxDateStr = rows[rows.length - 1].month_key + '-01';
    
    let currentDate = new Date(minDateStr);
    const maxDate = new Date(maxDateStr);
    
    while (currentDate <= maxDate) {
      const year = currentDate.getFullYear();
      const monthNum = String(currentDate.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;
      
      const label = currentDate.toLocaleString('default', { month: 'short' });
      const existingRow = rows.find(r => r.month_key === key);
      
      signups.push({
        monthKey: key,
        month: label,
        count: existingRow ? existingRow.count : 0
      });
      
      // Safe increment to avoid timezone overflow issues
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    res.json({ signups });
  } catch (err) {
    console.error('[Admin Analytics Route] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics data.' });
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
      SELECT id, title, company, location, employment_type, experience,
             salary_min, salary_max, description, skills, source,
             company_logo as "companyLogo", logo_color as "logoColor", logo_text as "logoText",
             match_score as "matchScore", is_featured as "isFeatured",
             created_at, updated_at
      FROM jobs
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
      'SELECT DISTINCT company, company_logo as "companyLogo", logo_color as "logoColor" FROM jobs WHERE company IS NOT NULL'
    );
    res.json({ companies: result.rows });
  } catch (err) {
    console.error('[Admin Companies] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch companies.' });
  }
});

// ── 6. ISSUE REPORTS MANAGEMENT ─────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const { search, status, priority, category, sort = 'newest', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      let idSearchCond = '';
      if (/^\d+$/.test(search)) {
        idSearchCond = `OR id = $${paramIndex}`;
      }
      conditions.push(`(LOWER(full_name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex} OR LOWER(subject) LIKE $${paramIndex} ${idSearchCond})`);
      params.push(searchLower);
      paramIndex++;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      conditions.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    let orderBy = 'created_at DESC';
    if (sort === 'oldest') {
      orderBy = 'created_at ASC';
    } else if (sort === 'priority') {
      orderBy = `
        CASE priority 
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Normal' THEN 3
          WHEN 'Medium' THEN 4
          WHEN 'Low' THEN 5
          ELSE 6
        END ASC, created_at DESC
      `;
    } else if (sort === 'status') {
      orderBy = `
        CASE status 
          WHEN 'Open' THEN 1
          WHEN 'In Progress' THEN 2
          WHEN 'Resolved' THEN 3
          WHEN 'Closed' THEN 4
          ELSE 5
        END ASC, created_at DESC
      `;
    }

    const openCount = await pool.query("SELECT COUNT(*)::int FROM issue_reports WHERE status = 'Open'");
    const progressCount = await pool.query("SELECT COUNT(*)::int FROM issue_reports WHERE status = 'In Progress'");
    const resolvedCount = await pool.query("SELECT COUNT(*)::int FROM issue_reports WHERE status = 'Resolved'");
    const closedCount = await pool.query("SELECT COUNT(*)::int FROM issue_reports WHERE status = 'Closed'");

    const countRes = await pool.query(`SELECT COUNT(*) FROM issue_reports ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].count);

    const reportsQuery = `
      SELECT * FROM issue_reports
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataRes = await pool.query(reportsQuery, [...params, parseInt(limit), offset]);

    res.json({
      reports: dataRes.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      counts: {
        open: openCount.rows[0].count,
        inProgress: progressCount.rows[0].count,
        resolved: resolvedCount.rows[0].count,
        closed: closedCount.rows[0].count,
        totalReports: openCount.rows[0].count + progressCount.rows[0].count + resolvedCount.rows[0].count + closedCount.rows[0].count
      }
    });
  } catch (err) {
    console.error('[Admin Reports List] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch issue reports.' });
  }
});

router.put('/reports/:id', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const { status, priority, adminNotes } = req.body;

    if (status && !['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid report status.' });
    }
    if (priority && !['Low', 'Normal', 'Medium', 'High', 'Critical'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid report priority.' });
    }

    const result = await pool.query(
      `UPDATE issue_reports SET
        status = COALESCE($1, status),
        priority = COALESCE($2, priority),
        admin_notes = COALESCE($3, admin_notes),
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status || null, priority || null, adminNotes !== undefined ? adminNotes : null, reportId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const updatedReport = result.rows[0];

    // If updated to Resolved, trigger resolution email
    if (status === 'Resolved') {
      try {
        const { sendIssueResolvedEmail } = require('../utils/email');
        sendIssueResolvedEmail(
          updatedReport.email,
          updatedReport.full_name,
          updatedReport.subject,
          updatedReport.admin_notes || adminNotes || ''
        );
      } catch (mailErr) {
        console.error('[Admin Router] Issue resolved email failed to send:', mailErr.message);
      }
    }

    res.json({ message: 'Report updated successfully.', report: updatedReport });
  } catch (err) {
    console.error('[Admin Report Update] Error:', err.message);
    res.status(500).json({ error: 'Failed to update report.' });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM issue_reports WHERE id = $1 RETURNING id', [reportId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    res.json({ message: 'Report deleted successfully.' });
  } catch (err) {
    console.error('[Admin Report Delete] Error:', err.message);
    res.status(500).json({ error: 'Failed to delete report.' });
  }
});

// ─── ADMIN: RESUME TEMPLATES CRUD ───────────────────────────────────────────

router.get('/templates', adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resume_templates ORDER BY created_at DESC');
    res.json({ templates: result.rows });
  } catch (err) {
    console.error('[Admin Templates Get] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch templates.' });
  }
});

router.post('/templates', adminMiddleware, async (req, res) => {
  try {
    const { id, name, description, category, isAts, isPopular, isTrending, isBestAts, tags, accent, preview, thumbnail, isEnabled } = req.body;
    
    if (!id || !name || !preview) {
      return res.status(400).json({ error: 'ID, Name, and Preview Layout settings are required.' });
    }
    
    const checkResult = await pool.query('SELECT id FROM resume_templates WHERE id = $1', [id]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'A template with this ID already exists.' });
    }
    
    const result = await pool.query(
      `INSERT INTO resume_templates (id, name, description, category, is_ats, is_popular, is_trending, is_best_ats, tags, accent, preview, thumbnail, is_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id.toLowerCase().trim(),
        name,
        description || '',
        category || 'Classic',
        isAts !== undefined ? isAts : true,
        isPopular !== undefined ? isPopular : false,
        isTrending !== undefined ? isTrending : false,
        isBestAts !== undefined ? isBestAts : false,
        JSON.stringify(tags || []),
        accent || '#1e293b',
        JSON.stringify(preview),
        thumbnail || null,
        isEnabled !== undefined ? isEnabled : true
      ]
    );
    
    res.status(201).json({ message: 'Template created successfully.', template: result.rows[0] });
  } catch (err) {
    console.error('[Admin Template Create] Error:', err.message);
    res.status(500).json({ error: 'Failed to create template.' });
  }
});

router.put('/templates/:id', adminMiddleware, async (req, res) => {
  try {
    const templateId = req.params.id;
    const { name, description, category, isAts, isPopular, isTrending, isBestAts, tags, accent, preview, thumbnail, isEnabled } = req.body;
    
    if (!name || !preview) {
      return res.status(400).json({ error: 'Name and Preview Layout settings are required.' });
    }
    
    const result = await pool.query(
      `UPDATE resume_templates SET
        name = $1,
        description = $2,
        category = $3,
        is_ats = $4,
        is_popular = $5,
        is_trending = $6,
        is_best_ats = $7,
        tags = $8,
        accent = $9,
        preview = $10,
        thumbnail = COALESCE($11, thumbnail),
        is_enabled = $12,
        updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        name,
        description || '',
        category || 'Classic',
        isAts !== undefined ? isAts : true,
        isPopular !== undefined ? isPopular : false,
        isTrending !== undefined ? isTrending : false,
        isBestAts !== undefined ? isBestAts : false,
        JSON.stringify(tags || []),
        accent || '#1e293b',
        JSON.stringify(preview),
        thumbnail || null,
        isEnabled !== undefined ? isEnabled : true,
        templateId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found.' });
    }
    
    res.json({ message: 'Template updated successfully.', template: result.rows[0] });
  } catch (err) {
    console.error('[Admin Template Update] Error:', err.message);
    res.status(500).json({ error: 'Failed to update template.' });
  }
});

router.delete('/templates/:id', adminMiddleware, async (req, res) => {
  try {
    const templateId = req.params.id;
    const result = await pool.query('DELETE FROM resume_templates WHERE id = $1 RETURNING id', [templateId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found.' });
    }
    
    res.json({ message: 'Template deleted successfully.' });
  } catch (err) {
    console.error('[Admin Template Delete] Error:', err.message);
    res.status(500).json({ error: 'Failed to delete template.' });
  }
});

module.exports = router;
