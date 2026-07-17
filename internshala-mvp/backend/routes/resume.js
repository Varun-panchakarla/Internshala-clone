const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

// GET /api/resume
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT resume_info FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].resume_info) {
      return res.json({ data: null });
    }

    res.json({ data: result.rows[0].resume_info });
  } catch (err) {
    console.error('[Resume] Get error:', err.message);
    res.status(500).json({ error: 'Failed to fetch resume.' });
  }
});

// PUT /api/resume
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required.' });
    }

    await pool.query(
      `UPDATE profiles SET resume_info = $1, updated_at = NOW() WHERE user_id = $2`,
      [JSON.stringify(resumeData), req.user.userId]
    );

    res.json({ data: resumeData });
  } catch (err) {
    console.error('[Resume] Save error:', err.message);
    res.status(500).json({ error: 'Failed to save resume.' });
  }
});

module.exports = router;
