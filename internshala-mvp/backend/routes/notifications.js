const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

// GET /api/notifications — list candidate notifications + unread count
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const listRes = await pool.query(
      `SELECT id, type, title, message, read, created_at
       FROM user_notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    );
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM user_notifications
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );

    res.json({
      notifications: listRes.rows.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.created_at
      })),
      unread: Number(countRes.rows[0].count) || 0
    });
  } catch (err) {
    console.error('[Notifications] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// POST /api/notifications/read — mark all as read
router.post('/read', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE user_notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
      [req.user.userId]
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('[Notifications] Read-all error:', err.message);
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

// POST /api/notifications/:id/read — mark a single notification as read
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE user_notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('[Notifications] Read-one error:', err.message);
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

module.exports = router;
