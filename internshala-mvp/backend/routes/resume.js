const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

// GET /api/resume
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  console.log(`[Resume Get] Fetching resume for user_id: ${userId}`);
  try {
    const result = await pool.query(
      'SELECT resume_info FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log(`[Resume Get] No profile record exists for user_id: ${userId}. Returning data: null.`);
      return res.json({ data: null });
    }

    if (!result.rows[0].resume_info) {
      console.log(`[Resume Get] Profile record exists but resume_info is null/empty for user_id: ${userId}. Returning data: null.`);
      return res.json({ data: null });
    }

    console.log(`[Resume Get] Successfully retrieved resume for user_id: ${userId}. Size: ${JSON.stringify(result.rows[0].resume_info).length} characters`);
    res.json({ data: result.rows[0].resume_info });
  } catch (err) {
    console.error(`[Resume Get Error] Failed for user_id: ${userId}:`, err);
    res.status(500).json({ error: `Failed to fetch resume: ${err.message}` });
  }
});

// PUT /api/resume
router.put('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  console.log(`[Resume Save] Start save request for user_id: ${userId}`);
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      console.warn(`[Resume Save] Bad Request: resumeData is missing for user_id: ${userId}`);
      return res.status(400).json({ error: 'Resume data is required.' });
    }

    console.log(`[Resume Save] Received payload size: ${JSON.stringify(resumeData).length} characters`);

    // Try updating first
    let result = await pool.query(
      `UPDATE profiles SET resume_info = $1, updated_at = NOW() WHERE user_id = $2`,
      [JSON.stringify(resumeData), userId]
    );

    console.log(`[Resume Save] UPDATE rowCount: ${result.rowCount} for user_id: ${userId}`);

    // If no row was updated, it means the profile record does not exist yet. Perform upsert.
    if (result.rowCount === 0) {
      console.log(`[Resume Save] Profile record missing for user_id: ${userId}. Performing upsert...`);
      result = await pool.query(
        `INSERT INTO profiles (user_id, full_name, resume_info, updated_at)
         VALUES ($1, (SELECT name FROM users WHERE id = $1), $2, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET resume_info = EXCLUDED.resume_info, updated_at = NOW()`,
        [userId, JSON.stringify(resumeData)]
      );
      console.log(`[Resume Save] Upsert complete. rowCount: ${result.rowCount} for user_id: ${userId}`);
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