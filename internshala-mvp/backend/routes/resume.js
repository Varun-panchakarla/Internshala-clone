const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

// GET /api/resume
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT resume_info FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ data: null });
    }

    if (!result.rows[0].resume_info) {
      return res.json({ data: null });
    }

    res.json({ data: result.rows[0].resume_info });
  } catch (err) {
    console.error(`[Resume Get Error] Failed for user_id: ${userId}:`, err);
    res.status(500).json({ error: `Failed to fetch resume: ${err.message}` });
  }
});

// PUT /api/resume
router.put('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      console.warn(`[Resume Save] Bad Request: resumeData is missing for user_id: ${userId}`);
      return res.status(400).json({ error: 'Resume data is required.' });
    }

    // Try updating first
    let result = await pool.query(
      `UPDATE profiles SET resume_info = $1, updated_at = NOW() WHERE user_id = $2`,
      [JSON.stringify(resumeData), userId]
    );

    // If no row was updated, it means the profile record does not exist yet. Perform upsert.
    if (result.rowCount === 0) {
      result = await pool.query(
        `INSERT INTO profiles (user_id, full_name, resume_info, updated_at)
         VALUES ($1, (SELECT name FROM users WHERE id = $1), $2, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET resume_info = EXCLUDED.resume_info, updated_at = NOW()`,
        [userId, JSON.stringify(resumeData)]
      );
    }

    res.json({ data: resumeData });
  } catch (err) {
    console.error(`[Resume Save Error] Failed for user_id: ${userId}:`, err);
    res.status(500).json({ error: `Failed to save resume: ${err.message}` });
  }
});

// GET /api/resume/templates
router.get('/templates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM resume_templates WHERE is_enabled = true ORDER BY created_at ASC'
    );
    res.json({ templates: result.rows });
  } catch (err) {
    console.error('[Resume Templates] Get error:', err.message);
    res.status(500).json({ error: 'Failed to fetch resume templates.' });
  }
});

module.exports = router;