const express = require('express');
const pool = require('../db/pool');
const { employerAuthMiddleware } = require('./employerAuth.js');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Helper to format dates relative to now (similar to "2 days ago")
function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// 1. GET /api/employer/dashboard/metrics
router.get('/metrics', employerAuthMiddleware, async (req, res) => {
  try {
    const employerId = req.employer.id;

    // Active Jobs count
    const jobsRes = await pool.query(
      "SELECT COUNT(*)::int FROM jobs WHERE employer_id = $1",
      [employerId]
    );
    const activeJobs = jobsRes.rows[0].count || 0;

    // Total Applicants count
    const appsRes = await pool.query(
      "SELECT COUNT(aj.id)::int FROM applied_jobs aj JOIN jobs j ON aj.job_id = j.id WHERE j.employer_id = $1",
      [employerId]
    );
    const totalApplicants = appsRes.rows[0].count || 0;

    // Shortlisted Matches count
    const shortlistRes = await pool.query(
      "SELECT COUNT(aj.id)::int FROM applied_jobs aj JOIN jobs j ON aj.job_id = j.id WHERE j.employer_id = $1 AND aj.status = 'Shortlisted'",
      [employerId]
    );
    const shortlistedMatches = shortlistRes.rows[0].count || 0;

    // Today's Interviews count
    const interviewsRes = await pool.query(
      "SELECT COUNT(*)::int FROM interviews WHERE employer_id = $1 AND DATE(scheduled_at) = CURRENT_DATE",
      [employerId]
    );
    const todayInterviews = interviewsRes.rows[0].count || 0;

    // Dynamic trend calculations for metrics
    res.json({
      activeJobs,
      totalApplicants,
      shortlistedMatches,
      todayInterviews,
      trends: {
        activeJobsTrend: '+0 this week',
        totalApplicantsTrend: `+${totalApplicants} total`,
        shortlistedMatchesTrend: `+${shortlistedMatches} matches`,
        todayInterviewsTrend: `${todayInterviews} scheduled today`
      }
    });
  } catch (err) {
    console.error('[Recruiter Metrics Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch recruiter dashboard metrics.' });
  }
});

// 2. GET /api/employer/dashboard/jobs
router.get('/jobs', employerAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, COUNT(aj.id)::int AS applicants_count 
       FROM jobs j 
       LEFT JOIN applied_jobs aj ON j.id = aj.job_id 
       WHERE j.employer_id = $1 
       GROUP BY j.id 
       ORDER BY j.created_at DESC`,
      [req.employer.id]
    );

    const formattedJobs = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      type: row.employment_type || 'Full-time',
      status: row.posted_at === 'Closed' ? 'Closed' : 'Active',
      applicants: row.applicants_count,
      views: row.match_score || 0, // using match_score for view simulation or default views
      date: formatTimeAgo(row.created_at),
      location: row.location,
      salary: row.salary || 'Undisclosed',
      experience: row.experience || 'Not specified',
      skills: Array.isArray(row.skills) ? row.skills.join(', ') : '',
      description: row.description
    }));

    res.json({ jobs: formattedJobs });
  } catch (err) {
    console.error('[Recruiter Jobs Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch recruiter job listings.' });
  }
});

// 3. POST /api/employer/dashboard/jobs
router.post('/jobs', employerAuthMiddleware, async (req, res) => {
  try {
    const { title, location, salaryRange, experienceRequired, employmentType, skills, description } = req.body;
    const employerId = req.employer.id;

    // Fetch company name to store in job listing
    const companyRes = await pool.query("SELECT company_name FROM employers WHERE id = $1", [employerId]);
    const companyName = companyRes.rows[0]?.company_name || 'Recruiter';

    const jobId = uuidv4();
    const skillsArray = skills ? skills.split(',').map(s => s.trim()) : [];

    const insertResult = await pool.query(
      `INSERT INTO jobs (
        id, title, company, location, salary, experience, employment_type, skills, description, employer_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
      [jobId, title, companyName, location, salaryRange, experienceRequired, employmentType, skillsArray, description, employerId]
    );

    res.json({ message: 'Job posted successfully!', job: insertResult.rows[0] });
  } catch (err) {
    console.error('[Recruiter Post Job Error]:', err.message);
    res.status(500).json({ error: 'Failed to post new job listing.' });
  }
});

// 4. PUT /api/employer/dashboard/jobs/:id
router.put('/jobs/:id', employerAuthMiddleware, async (req, res) => {
  try {
    const { title, location, salaryRange, experienceRequired, employmentType, skills, description } = req.body;
    const employerId = req.employer.id;
    const jobId = req.params.id;

    const skillsArray = skills ? skills.split(',').map(s => s.trim()) : [];

    const updateRes = await pool.query(
      `UPDATE jobs 
       SET title = $1, location = $2, salary = $3, experience = $4, employment_type = $5, skills = $6, description = $7
       WHERE id = $8 AND employer_id = $9 RETURNING *`,
      [title, location, salaryRange, experienceRequired, employmentType, skillsArray, description, jobId, employerId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Job listing not found or unauthorized.' });
    }

    res.json({ message: 'Job updated successfully!', job: updateRes.rows[0] });
  } catch (err) {
    console.error('[Recruiter Update Job Error]:', err.message);
    res.status(500).json({ error: 'Failed to update job listing.' });
  }
});

// 5. DELETE /api/employer/dashboard/jobs/:id
router.delete('/jobs/:id', employerAuthMiddleware, async (req, res) => {
  try {
    const employerId = req.employer.id;
    const jobId = req.params.id;

    const deleteRes = await pool.query(
      "DELETE FROM jobs WHERE id = $1 AND employer_id = $2 RETURNING id",
      [jobId, employerId]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Job listing not found or unauthorized.' });
    }

    res.json({ message: 'Job deleted successfully!' });
  } catch (err) {
    console.error('[Recruiter Delete Job Error]:', err.message);
    res.status(500).json({ error: 'Failed to delete job listing.' });
  }
});

// 6. GET /api/employer/dashboard/applicants/:jobId
router.get('/applicants/:jobId', employerAuthMiddleware, async (req, res) => {
  try {
    const employerId = req.employer.id;
    const jobId = req.params.id || req.query.jobId || req.params.jobId;

    const result = await pool.query(
      `SELECT aj.id AS application_id, aj.status, aj.applied_at, 
              u.id AS user_id, u.name AS candidate_name, u.email AS candidate_email,
              p.experience, p.skills, p.college, p.degree, p.resume_info, p.contact_number, p.current_city
       FROM applied_jobs aj
       JOIN jobs j ON aj.job_id = j.id
       JOIN users u ON aj.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE j.id = $1 AND j.employer_id = $2
       ORDER BY aj.applied_at DESC`,
      [jobId, employerId]
    );

    const formattedApplicants = result.rows.map(row => ({
      applicationId: row.application_id,
      name: row.candidate_name,
      email: row.candidate_email,
      phone: row.contact_number || '+91 9999999999',
      location: row.current_city || 'Remote, India',
      experience: row.experience || 'Fresher',
      skills: Array.isArray(row.skills) ? row.skills.join(', ') : '',
      education: `${row.degree || 'Degree'} at ${row.college || 'College'}`,
      status: row.status,
      timeAgo: formatTimeAgo(row.applied_at),
      resumeUrl: row.resume_info?.fileName || 'resume.pdf'
    }));

    res.json({ applicants: formattedApplicants });
  } catch (err) {
    console.error('[Recruiter Applicants List Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch applicants list.' });
  }
});

// 7. POST /api/employer/dashboard/applications/:applicationId/status
router.post('/applications/:applicationId/status', employerAuthMiddleware, async (req, res) => {
  try {
    const employerId = req.employer.id;
    const applicationId = req.params.applicationId;
    const { status } = req.body; // 'Shortlisted', 'Rejected', etc.

    // Verify ownership of the job this application belongs to
    const checkRes = await pool.query(
      `SELECT aj.id, aj.user_id, j.title AS job_title 
       FROM applied_jobs aj 
       JOIN jobs j ON aj.job_id = j.id 
       WHERE aj.id = $1 AND j.employer_id = $2`,
      [applicationId, employerId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or unauthorized.' });
    }

    const { user_id, job_title } = checkRes.rows[0];

    // Update status
    const updateRes = await pool.query(
      "UPDATE applied_jobs SET status = $1 WHERE id = $2 RETURNING *",
      [status, applicationId]
    );

    // If status is shortlisted, insert notifications
    if (status === 'Shortlisted') {
      await pool.query(
        "INSERT INTO employer_notifications (employer_id, type, message) VALUES ($1, $2, $3)",
        [employerId, 'shortlist', `Candidate has been successfully shortlisted for ${job_title}`]
      );
    }

    res.json({ message: `Application status updated to ${status}.`, application: updateRes.rows[0] });
  } catch (err) {
    console.error('[Recruiter Decision Error]:', err.message);
    res.status(500).json({ error: 'Failed to update candidate status.' });
  }
});

// 8. POST /api/employer/dashboard/interviews/schedule
router.post('/interviews/schedule', employerAuthMiddleware, async (req, res) => {
  try {
    const employerId = req.employer.id;
    const { candidateEmail, jobId, scheduledAt, round } = req.body;

    // Fetch user_id from email
    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [candidateEmail]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found with this email.' });
    }
    const userId = userRes.rows[0].id;

    // Schedule interview
    const insertRes = await pool.query(
      `INSERT INTO interviews (employer_id, user_id, job_id, scheduled_at, round, status)
       VALUES ($1, $2, $3, $4, $5, 'Scheduled') RETURNING *`,
      [employerId, userId, jobId, scheduledAt, round]
    );

    // Insert reminder notification
    await pool.query(
      "INSERT INTO employer_notifications (employer_id, type, message) VALUES ($1, $2, $3)",
      [employerId, 'interview', `Interview scheduled on ${new Date(scheduledAt).toLocaleString()} for round: ${round}`]
    );

    res.json({ message: 'Interview scheduled successfully!', interview: insertRes.rows[0] });
  } catch (err) {
    console.error('[Recruiter Interview Schedule Error]:', err.message);
    res.status(500).json({ error: 'Failed to schedule candidate interview.' });
  }
});

// 9. GET /api/employer/dashboard/recent-applications
router.get('/recent-applications', employerAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT aj.id AS application_id, aj.status, aj.applied_at, 
              u.name AS candidate_name, j.title AS job_title
       FROM applied_jobs aj
       JOIN jobs j ON aj.job_id = j.id
       JOIN users u ON aj.user_id = u.id
       WHERE j.employer_id = $1
       ORDER BY aj.applied_at DESC
       LIMIT 10`,
      [req.employer.id]
    );

    const formattedApps = result.rows.map(row => ({
      name: row.candidate_name,
      role: row.job_title,
      time: formatTimeAgo(row.applied_at),
      status: row.status
    }));

    res.json({ applications: formattedApps });
  } catch (err) {
    console.error('[Recruiter Recent Apps Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch recent applications.' });
  }
});

// 10. GET /api/employer/dashboard/notifications
router.get('/notifications', employerAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM employer_notifications 
       WHERE employer_id = $1 
       ORDER BY created_at DESC 
       LIMIT 15`,
      [req.employer.id]
    );

    res.json({ notifications: result.rows });
  } catch (err) {
    console.error('[Recruiter Notifications Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch recruiter notifications.' });
  }
});

// 11. GET /api/employer/dashboard/company
router.get('/company', employerAuthMiddleware, async (req, res) => {
  try {
    const employerId = req.employer.id;
    const result = await pool.query(
      `SELECT e.company_name, e.recruiter_name, ep.*, 
              (SELECT COUNT(*)::int FROM jobs WHERE employer_id = $1) AS total_jobs,
              (SELECT COUNT(aj.id)::int FROM applied_jobs aj JOIN jobs j ON aj.job_id = j.id WHERE j.employer_id = $1) AS total_applicants
       FROM employers e
       LEFT JOIN employer_profiles ep ON e.id = ep.employer_id
       WHERE e.id = $1`,
      [employerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company details not found.' });
    }

    res.json({ company: result.rows[0] });
  } catch (err) {
    console.error('[Recruiter Company Info Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch recruiter company info.' });
  }
});

// 12. GET /api/employer/dashboard/analytics
router.get('/analytics', employerAuthMiddleware, async (req, res) => {
  try {
    const employerId = req.employer.id;

    // A. Job-wise applicant count
    const jobStats = await pool.query(
      `SELECT j.title, COUNT(aj.id)::int AS count 
       FROM jobs j 
       LEFT JOIN applied_jobs aj ON j.id = aj.job_id 
       WHERE j.employer_id = $1 
       GROUP BY j.id, j.title 
       ORDER BY count DESC`,
      [employerId]
    );

    // B. Daily applications graph (last 30 days)
    const dailyApps = await pool.query(
      `SELECT TO_CHAR(d.day, 'YYYY-MM-DD') AS date_key, 
              TO_CHAR(d.day, 'DD Mon') AS date_label, 
              COALESCE(COUNT(aj.id), 0)::int AS count
       FROM generate_series(
         CURRENT_DATE - INTERVAL '29 days',
         CURRENT_DATE,
         '1 day'::interval
       ) d(day)
       LEFT JOIN (applied_jobs aj JOIN jobs j ON aj.job_id = j.id AND j.employer_id = $1) 
         ON DATE(aj.applied_at) = DATE(d.day)
       GROUP BY d.day
       ORDER BY d.day ASC`,
      [employerId]
    );

    // C. Monthly job postings graph (last 12 months)
    const monthlyJobs = await pool.query(
      `SELECT TO_CHAR(d.month, 'YYYY-MM') AS month_key, 
              TO_CHAR(d.month, 'Mon') AS month_label, 
              COALESCE(COUNT(j.id), 0)::int AS count
       FROM generate_series(
         DATE_TRUNC('year', CURRENT_DATE),
         DATE_TRUNC('month', CURRENT_DATE),
         '1 month'::interval
       ) d(month)
       LEFT JOIN jobs j ON DATE_TRUNC('month', j.created_at) = DATE_TRUNC('month', d.month) AND j.employer_id = $1
       GROUP BY d.month
       ORDER BY d.month ASC`,
      [employerId]
    );

    // D. Hiring pipeline states (Applied -> Shortlisted -> Interview -> Selected -> Rejected)
    const pipelineRes = await pool.query(
      `SELECT aj.status, COUNT(*)::int AS count 
       FROM applied_jobs aj 
       JOIN jobs j ON aj.job_id = j.id 
       WHERE j.employer_id = $1 
       GROUP BY aj.status`,
      [employerId]
    );

    const stages = ['Pending', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
    const hiringPipeline = stages.map(stage => {
      const existing = pipelineRes.rows.find(r => r.status === stage);
      return {
        stage: stage === 'Pending' ? 'Applied' : stage,
        count: existing ? existing.count : 0
      };
    });

    res.json({
      jobWiseApplicants: jobStats.rows,
      dailyTrend: dailyApps.rows.map(r => ({ label: r.date_label, count: r.count })),
      monthlyTrend: monthlyJobs.rows.map(r => ({ label: r.month_label, count: r.count })),
      hiringPipeline
    });
  } catch (err) {
    console.error('[Recruiter Analytics Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics datasets.' });
  }
});

// 13. GET /api/employer/dashboard/interviews
router.get('/interviews', employerAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name AS candidate_name, u.email AS candidate_email, j.title AS job_title
       FROM interviews i
       JOIN users u ON i.user_id = u.id
       JOIN jobs j ON i.job_id = j.id
       WHERE i.employer_id = $1 AND DATE(i.scheduled_at) = CURRENT_DATE
       ORDER BY i.scheduled_at ASC`,
      [req.employer.id]
    );

    const formatted = result.rows.map(row => ({
      candidate: row.candidate_name,
      email: row.candidate_email,
      round: row.round,
      time: new Date(row.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json({ interviews: formatted });
  } catch (err) {
    console.error('[Recruiter Interviews Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch scheduled interviews.' });
  }
});

module.exports = router;
