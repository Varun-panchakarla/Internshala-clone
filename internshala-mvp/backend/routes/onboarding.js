const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');
const sms = require('../utils/sms');

const router = express.Router();

function mapProfile(row) {
  if (!row) return {};
  return {
    fullName: row.full_name || '',
    profilePhoto: row.profile_photo || '',
    college: row.college || '',
    degree: row.degree || '',
    skills: row.skills || [],
    experience: row.experience || 'Fresher',
    preferredRole: row.preferred_role || '',
    preferredLocation: row.preferred_location || '',
    employmentType: row.employment_type || 'Full-time',
    resumeInfo: row.resume_info || null,
    contactNumber: row.contact_number || '',
    currentCity: row.current_city || '',
    gender: row.gender || '',
    languages: row.languages || [],
    currentStatus: row.current_status || '',
    course: row.course || '',
    stream: row.stream || '',
    startYear: row.start_year || '',
    endYear: row.end_year || '',
    interests: row.interests || [],
    lookingFor: row.looking_for || [],
    workModes: row.work_modes || [],
    phoneVerified: row.phone_verified || false,
  };
}

// POST /api/onboarding/send-phone-otp
router.post('/send-phone-otp', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user.userId;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?\d{8,15}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Please enter a valid phone number (minimum 8 digits).' });
    }

    // Store phone number for this user (MSG91 handles OTP lifecycle)
    await pool.query(
      `INSERT INTO phone_otps (user_id, phone_number, expires_at, attempts, last_sent_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes', 0, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         phone_number = EXCLUDED.phone_number,
         expires_at = EXCLUDED.expires_at,
         attempts = 0,
         last_sent_at = EXCLUDED.last_sent_at`,
      [userId, cleanPhone]
    );

    try {
      const msgRes = await sms.sendOtp(cleanPhone);
      console.log(`[MSG91] OTP sent to ${cleanPhone} — request_id: ${msgRes.request_id}`);
    } catch (smsErr) {
      console.error('[MSG91] Send error:', smsErr.message);
      return res.status(500).json({ error: 'Failed to send SMS. Please try again.' });
    }

    res.json({ message: 'Verification OTP sent successfully.' });
  } catch (err) {
    console.error('[Onboarding SMS] Send OTP error:', err.message);
    res.status(500).json({ error: 'Failed to send phone verification OTP.' });
  }
});

// POST /api/onboarding/resend-phone-otp
router.post('/resend-phone-otp', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user.userId;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Cooldown check (60 seconds)
    const existing = await pool.query('SELECT last_sent_at FROM phone_otps WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0 && existing.rows[0].last_sent_at) {
      const lastSent = new Date(existing.rows[0].last_sent_at);
      const diffSeconds = Math.floor((new Date() - lastSent) / 1000);
      if (diffSeconds < 60) {
        const remaining = 60 - diffSeconds;
        return res.status(429).json({ 
          error: `Please wait ${remaining} seconds before requesting another code.`,
          remainingSeconds: remaining
        });
      }
    }

    // Update sent time
    await pool.query(
      `INSERT INTO phone_otps (user_id, phone_number, expires_at, attempts, last_sent_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes', 0, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         phone_number = EXCLUDED.phone_number,
         expires_at = EXCLUDED.expires_at,
         attempts = 0,
         last_sent_at = EXCLUDED.last_sent_at`,
      [userId, cleanPhone]
    );

    try {
      const msgRes = await sms.retryOtp(cleanPhone);
      console.log(`[MSG91] OTP resent to ${cleanPhone} — request_id: ${msgRes.request_id}`);
    } catch (smsErr) {
      console.error('[MSG91] Resend error:', smsErr.message);
      return res.status(500).json({ error: 'Failed to resend SMS. Please try again.' });
    }

    res.json({ message: 'A new verification OTP has been sent to your phone.' });
  } catch (err) {
    console.error('[Onboarding SMS] Resend OTP error:', err.message);
    res.status(500).json({ error: 'Failed to resend phone verification OTP.' });
  }
});

// POST /api/onboarding/verify-phone-otp
router.post('/verify-phone-otp', authMiddleware, async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.userId;

    if (!otp) {
      return res.status(400).json({ error: 'OTP is required.' });
    }

    const cleanOtp = String(otp).trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'OTP must be a 6-digit number.' });
    }

    const result = await pool.query(
      'SELECT phone_number, expires_at FROM phone_otps WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No verification request found. Please request an OTP first.' });
    }

    const { phone_number, expires_at } = result.rows[0];

    // Check expiry on our end
    if (new Date(expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Please resend OTP.' });
    }

    // Verify OTP via MSG91
    let verified = false;
    try {
      const verifyRes = await sms.verifyOtp(phone_number, cleanOtp);
      verified = verifyRes.type === 'success';
    } catch (verifyErr) {
      console.error('[MSG91] Verify error:', verifyErr.response?.data || verifyErr.message);
      // MSG91 returns error type 'error' for invalid OTP
      if (verifyErr.response?.data?.type === 'error') {
        return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
      }
      return res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
    }

    if (!verified) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Success! Update profile
    await pool.query(
      'UPDATE profiles SET phone_verified = true, contact_number = $1 WHERE user_id = $2',
      [phone_number, userId]
    );

    await pool.query('DELETE FROM phone_otps WHERE user_id = $1', [userId]);

    const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    const profile = profileResult.rows[0] || {};

    res.json({
      profile: mapProfile(profile),
      message: 'Phone number verified successfully.'
    });
  } catch (err) {
    console.error('[Onboarding SMS] Verify OTP error:', err.message);
    res.status(500).json({ error: 'Failed to verify phone OTP.' });
  }
});

module.exports = router;
