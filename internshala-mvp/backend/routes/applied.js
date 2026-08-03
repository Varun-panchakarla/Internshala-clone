const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

// GET /api/applied — returns array of applied job_ids
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT job_id FROM applied_jobs WHERE user_id = $1 ORDER BY applied_at DESC',
      [req.user.userId]
    );
    res.json({ data: result.rows.map(r => r.job_id) });
  } catch (err) {
    console.error('[Applied] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch applied jobs.' });
  }
});

// GET /api/applied/details — returns array of detailed applied jobs
router.get('/details', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT job_id, status, applied_at FROM applied_jobs WHERE user_id = $1 ORDER BY applied_at DESC',
      [req.user.userId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error('[Applied] Details error:', err.message);
    res.status(500).json({ error: 'Failed to fetch applied job details.' });
  }
});

// POST /api/applied/:jobId
router.post('/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId || jobId.length > 100) {
      return res.status(400).json({ error: 'Invalid job ID.' });
    }

    await pool.query(
      'INSERT INTO applied_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.userId, jobId]
    );

    res.json({ message: 'Applied to job.' });
  } catch (err) {
    console.error('[Applied] Apply error:', err.message);
    res.status(500).json({ error: 'Failed to apply.' });
  }
});

// GET /api/applied/interviews — upcoming interviews scheduled for the candidate
router.get('/interviews', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.job_id, i.round, i.status, i.scheduled_at, j.title AS job_title, j.company
       FROM interviews i
       JOIN jobs j ON i.job_id = j.id
       WHERE i.user_id = $1
       ORDER BY i.scheduled_at ASC`,
      [req.user.userId]
    );

    const formatted = result.rows.map(row => ({
      id: row.id,
      jobId: row.job_id,
      round: row.round,
      status: row.status,
      jobTitle: row.job_title,
      company: row.company,
      scheduledAt: row.scheduled_at,
      date: new Date(row.scheduled_at).toISOString().slice(0, 10),
      time: new Date(row.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json({ interviews: formatted });
  } catch (err) {
    console.error('[Applied] Interviews error:', err.message);
    res.status(500).json({ error: 'Failed to fetch interviews.' });
  }
});

module.exports = router;
