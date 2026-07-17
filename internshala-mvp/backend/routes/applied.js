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

module.exports = router;
