const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// POST /api/issues - Submit a user issue/complaint
router.post('/', async (req, res) => {
  try {
    const { fullName, email, contactNumber, category, subject, description, screenshot } = req.body;
    
    // Validate inputs
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Area of concern/category is required.' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    // Try to associate with authenticated user via cookie token
    let userId = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        // Procceed with userId = null if token is invalid or expired
      }
    }

    const query = `
      INSERT INTO issue_reports (
        user_id, full_name, email, contact_number, category, subject, description, screenshot, status, priority, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Open', 'Normal', NOW(), NOW())
      RETURNING id, created_at
    `;

    const result = await pool.query(query, [
      userId,
      fullName.trim(),
      email.trim().toLowerCase(),
      contactNumber?.trim() || null,
      category,
      subject.trim(),
      description.trim(),
      screenshot || null
    ]);

    // Send confirmation email asynchronously (do not block client response)
    try {
      const { sendIssueReceivedEmail } = require('../utils/email');
      sendIssueReceivedEmail(
        email.trim().toLowerCase(),
        fullName.trim(),
        subject.trim(),
        description.trim()
      );
    } catch (mailErr) {
      console.error('[Issues Router] Email failed to send:', mailErr.message);
    }

    res.status(201).json({
      message: 'Issue report submitted successfully.',
      reportId: result.rows[0].id
    });
  } catch (err) {
    console.error('[POST /api/issues] Error:', err.message);
    res.status(500).json({ error: 'Failed to submit issue report.' });
  }
});

module.exports = router;
