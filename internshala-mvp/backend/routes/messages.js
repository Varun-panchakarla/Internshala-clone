const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');
const { employerAuthMiddleware } = require('./employerAuth');

const router = express.Router();

// ---------- Candidate (user) message routes ----------

// GET /api/messages/conversations — candidate's conversations with employers
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id AS employer_id, e.company_name, e.recruiter_name,
              (SELECT content FROM messages m2
               WHERE m2.employer_id = e.id AND m2.user_id = $1
               ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages m3
               WHERE m3.employer_id = e.id AND m3.user_id = $1
               ORDER BY m3.created_at DESC LIMIT 1) AS last_message_at,
              (SELECT COUNT(*) FROM messages m4
               WHERE m4.employer_id = e.id AND m4.user_id = $1 AND m4.sender = 'employer' AND m4.is_read = false) AS unread
       FROM employers e
       WHERE EXISTS (SELECT 1 FROM messages m WHERE m.employer_id = e.id AND m.user_id = $1)
          OR EXISTS (SELECT 1 FROM applied_jobs aj JOIN jobs j ON aj.job_id = j.id WHERE j.employer_id = e.id AND aj.user_id = $1 AND aj.status IN ('Shortlisted', 'Interview', 'Offer', 'Selected'))
       ORDER BY last_message_at DESC NULLS LAST`,
      [req.user.userId]
    );

    const conversations = result.rows.map(row => ({
      employerId: row.employer_id,
      companyName: row.company_name || 'Company',
      recruiterName: row.recruiter_name || 'Recruiter',
      lastMessage: row.last_message || '',
      lastMessageAt: row.last_message_at,
      unread: Number(row.unread) || 0
    }));

    res.json({ conversations });
  } catch (err) {
    console.error('[Messages] Candidate conversations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

// GET /api/messages/employer/:employerId — full thread between candidate and employer
router.get('/employer/:employerId', authMiddleware, async (req, res) => {
  try {
    const employerId = req.params.employerId;
    const userId = req.user.userId;

    const employerRes = await pool.query(
      'SELECT id, company_name, recruiter_name FROM employers WHERE id = $1',
      [employerId]
    );
    if (employerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Employer not found.' });
    }

    await pool.query(
      `UPDATE messages SET is_read = true
       WHERE employer_id = $1 AND user_id = $2 AND sender = 'employer' AND is_read = false`,
      [employerId, userId]
    );

    const threadRes = await pool.query(
      `SELECT id, sender, content, is_read, created_at
       FROM messages
       WHERE employer_id = $1 AND user_id = $2
       ORDER BY created_at ASC`,
      [employerId, userId]
    );

    res.json({
      employer: {
        id: employerRes.rows[0].id,
        companyName: employerRes.rows[0].company_name || 'Company',
        recruiterName: employerRes.rows[0].recruiter_name || 'Recruiter'
      },
      messages: threadRes.rows.map(m => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        createdAt: m.created_at
      }))
    });
  } catch (err) {
    console.error('[Messages] Candidate thread error:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// POST /api/messages/employer/:employerId — candidate sends a message
router.post('/employer/:employerId', authMiddleware, async (req, res) => {
  try {
    const employerId = req.params.employerId;
    const userId = req.user.userId;
    const content = typeof req.body.content === 'string' ? req.body.content.trim().slice(0, 2000) : '';

    if (!content) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const result = await pool.query(
      `INSERT INTO messages (employer_id, user_id, sender, content)
       VALUES ($1, $2, 'user', $3) RETURNING id, sender, content, created_at`,
      [employerId, userId, content]
    );

    res.json({ message: result.rows[0] });
  } catch (err) {
    console.error('[Messages] Candidate send error:', err.message);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// GET /api/messages/unread — candidate total unread count
router.get('/unread', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count FROM messages
       WHERE user_id = $1 AND sender = 'employer' AND is_read = false`,
      [req.user.userId]
    );
    res.json({ count: Number(result.rows[0].count) || 0 });
  } catch (err) {
    console.error('[Messages] Candidate unread error:', err.message);
    res.status(500).json({ error: 'Failed to fetch unread count.' });
  }
});

// ---------- Employer message routes ----------

// GET /api/messages/employer-conversations — employer's conversations with candidates
router.get('/employer-conversations', employerAuthMiddleware, async (req, res) => {
  try {
    const employerId = req.employer.id;

    const result = await pool.query(
      `SELECT u.id AS user_id, u.name AS candidate_name, u.email AS candidate_email,
              (SELECT content FROM messages m2
               WHERE m2.employer_id = $1 AND m2.user_id = u.id
               ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages m3
               WHERE m3.employer_id = $1 AND m3.user_id = u.id
               ORDER BY m3.created_at DESC LIMIT 1) AS last_message_at,
              (SELECT COUNT(*) FROM messages m4
               WHERE m4.employer_id = $1 AND m4.user_id = u.id AND m4.sender = 'user' AND m4.is_read = false) AS unread
       FROM users u
       WHERE EXISTS (SELECT 1 FROM messages m WHERE m.employer_id = $1 AND m.user_id = u.id)
          OR EXISTS (SELECT 1 FROM applied_jobs aj JOIN jobs j ON aj.job_id = j.id WHERE j.employer_id = $1 AND aj.user_id = u.id AND aj.status IN ('Shortlisted', 'Interview', 'Offer', 'Selected'))
       ORDER BY last_message_at DESC NULLS LAST`,
      [employerId]
    );

    const conversations = result.rows.map(row => ({
      userId: row.user_id,
      candidateName: row.candidate_name || 'Candidate',
      candidateEmail: row.candidate_email || '',
      lastMessage: row.last_message || '',
      lastMessageAt: row.last_message_at,
      unread: Number(row.unread) || 0
    }));

    res.json({ conversations });
  } catch (err) {
    console.error('[Messages] Employer conversations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

// GET /api/messages/employer/:userId — full thread between employer and candidate
router.get('/employer-thread/:userId', employerAuthMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const employerId = req.employer.id;

    const userRes = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    await pool.query(
      `UPDATE messages SET is_read = true
       WHERE employer_id = $1 AND user_id = $2 AND sender = 'user' AND is_read = false`,
      [employerId, userId]
    );

    const threadRes = await pool.query(
      `SELECT id, sender, content, is_read, created_at
       FROM messages
       WHERE employer_id = $1 AND user_id = $2
       ORDER BY created_at ASC`,
      [employerId, userId]
    );

    res.json({
      candidate: {
        id: userRes.rows[0].id,
        name: userRes.rows[0].name || 'Candidate',
        email: userRes.rows[0].email || ''
      },
      messages: threadRes.rows.map(m => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        createdAt: m.created_at
      }))
    });
  } catch (err) {
    console.error('[Messages] Employer thread error:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// POST /api/messages/employer-send/:userId — employer sends a message to candidate
router.post('/employer-send/:userId', employerAuthMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const employerId = req.employer.id;
    const content = typeof req.body.content === 'string' ? req.body.content.trim().slice(0, 2000) : '';

    if (!content) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const result = await pool.query(
      `INSERT INTO messages (employer_id, user_id, sender, content)
       VALUES ($1, $2, 'employer', $3) RETURNING id, sender, content, created_at`,
      [employerId, userId, content]
    );

    res.json({ message: result.rows[0] });
  } catch (err) {
    console.error('[Messages] Employer send error:', err.message);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// GET /api/messages/employer-unread — employer total unread count
router.get('/employer-unread', employerAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count FROM messages
       WHERE employer_id = $1 AND sender = 'user' AND is_read = false`,
      [req.employer.id]
    );
    res.json({ count: Number(result.rows[0].count) || 0 });
  } catch (err) {
    console.error('[Messages] Employer unread error:', err.message);
    res.status(500).json({ error: 'Failed to fetch unread count.' });
  }
});

module.exports = router;
