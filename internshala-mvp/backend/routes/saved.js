const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

// GET /api/saved — returns array of saved job_ids
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT job_id FROM saved_jobs WHERE user_id = $1 ORDER BY saved_at DESC',
      [req.user.userId]
    );
    res.json({ data: result.rows.map(r => r.job_id) });
  } catch (err) {
    console.error('[Saved] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch saved jobs.' });
  }
});

// POST /api/saved/:jobId
router.post('/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId || jobId.length > 100) {
      return res.status(400).json({ error: 'Invalid job ID.' });
    }

    await pool.query(
      'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.userId, jobId]
    );

    res.json({ message: 'Job saved.' });
  } catch (err) {
    console.error('[Saved] Save error:', err.message);
    res.status(500).json({ error: 'Failed to save job.' });
  }
});

// DELETE /api/saved/:jobId
router.delete('/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    await pool.query(
      'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [req.user.userId, jobId]
    );
    res.json({ message: 'Job unsaved.' });
  } catch (err) {
    console.error('[Saved] Unsave error:', err.message);
    res.status(500).json({ error: 'Failed to unsave job.' });
  }
});

module.exports = router;
