const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { sendWelcomeEmail, sendPasswordResetEmail, sendOtpEmail } = require('../utils/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';
const SALT_ROUNDS = 12;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;

function validateEmail(email) {
  return typeof email === 'string' && email.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str) {
  return typeof str === 'string' ? str.trim().slice(0, MAX_NAME_LENGTH) : '';
}

function signToken(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

function setCookie(res, token) {
  res.cookie('token', token, COOKIE_OPTIONS);
}

// Auth middleware — attaches req.user if valid token
async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user actually exists in the database (e.g. in case of DB resets)
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [decoded.userId]);
    if (userCheck.rows.length === 0) {
      res.clearCookie('token', COOKIE_OPTIONS);
      return res.status(401).json({ error: 'User session is invalid or user was deleted.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token', COOKIE_OPTIONS);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanName = sanitize(name);
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH) : '';

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (cleanName.length < 1) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await pool.query('SELECT id, email_verified FROM users WHERE email = $1', [cleanEmail]);
    let userId;
    
    if (existing.rows.length > 0) {
      const existingUser = existing.rows[0];
      if (existingUser.email_verified) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      
      // Update existing unverified user with new name and password hash
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await pool.query(
        `UPDATE users SET name = $1, password_hash = $2 WHERE id = $3`,
        [cleanName, passwordHash, existingUser.id]
      );
      // Also update the profile name
      await pool.query(
        `UPDATE profiles SET full_name = $1 WHERE user_id = $2`,
        [cleanName, existingUser.id]
      );
      userId = existingUser.id;
    } else {
      // Create new user (default email_verified = false)
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, name, email_verified) VALUES ($1, $2, $3, false) RETURNING id`,
        [cleanEmail, passwordHash, cleanName]
      );
      userId = userResult.rows[0].id;

      await pool.query(
        `INSERT INTO profiles (user_id, full_name, experience, employment_type, phone_verified) VALUES ($1, $2, $3, $4, false)`,
        [userId, cleanName, 'Fresher', 'Full-time']
      );
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    
    // Store OTP in database with 10 minutes expiry
    await pool.query(
      `UPDATE users SET 
        otp_code = $1, 
        otp_expires_at = NOW() + INTERVAL '10 minutes', 
        otp_attempts = 0, 
        last_otp_sent_at = NOW() 
       WHERE id = $2`,
      [otpHash, userId]
    );

    // Send OTP email (welcome email will be sent on OTP verification success)
    await sendOtpEmail({ email: cleanEmail, name: cleanName, otp });

    res.status(201).json({
      email: cleanEmail,
      message: 'Verification OTP sent to your email. Please verify to activate your account.'
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH) : '';

    const result = await pool.query(
      'SELECT id, email, name, password_hash, role, email_verified FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.', email: user.email });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses Google sign-in.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    const profile = profileResult.rows[0] || {};

    const token = signToken(user.id, user.email);
    setCookie(res, token);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      profile: mapProfile(profile),
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential, access_token } = req.body;
    if (!credential && !access_token) {
      return res.status(400).json({ error: 'Google credential or access token is required.' });
    }

    let googleId, email, name;

    if (access_token) {
      const axios = require('axios');
      try {
        const userInfoRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
        const payload = userInfoRes.data;
        googleId = payload.sub;
        email = payload.email;
        name = payload.name || email.split('@')[0];
      } catch (err) {
        return res.status(401).json({ error: 'Invalid Google access token.' });
      }
    } else {
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      let ticket;
      try {
        ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
      } catch (err) {
        return res.status(401).json({ error: 'Invalid Google credential.' });
      }

      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name || email.split('@')[0];
    }

    const existing = await pool.query(
      'SELECT id, email, name, role FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    let user;
    let isNewUser = false;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      await pool.query(
        'UPDATE users SET google_id = COALESCE(google_id, $1), email_verified = true WHERE id = $2',
        [googleId, user.id]
      );
    } else {
      isNewUser = true;
      const result = await pool.query(
        `INSERT INTO users (email, name, google_id, email_verified) VALUES ($1, $2, $3, true) RETURNING id, email, name, role`,
        [email, name, googleId]
      );
      user = result.rows[0];

      await pool.query(
        `INSERT INTO profiles (user_id, full_name, experience, employment_type, phone_verified) VALUES ($1, $2, $3, $4, false)`,
        [user.id, name, 'Fresher', 'Full-time']
      );
    }

    const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    const profile = profileResult.rows[0] || {};

    if (isNewUser) {
      sendWelcomeEmail({ email: user.email, name: user.name });
    }

    const token = signToken(user.id, user.email);
    setCookie(res, token);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      profile: mapProfile(profile),
    });
  } catch (err) {
    console.error('[Auth] Google auth error:', err.message);
    res.status(500).json({ error: 'Google authentication failed.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out.' });
});

// DELETE /api/auth/account — permanently delete authenticated user account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('[Auth] Account deletion error:', err.message);
    res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
});

// GET /api/auth/me — restore session from cookie
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      res.clearCookie('token', COOKIE_OPTIONS);
      return res.status(401).json({ error: 'User not found.' });
    }

    const user = userResult.rows[0];
    const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    const profile = profileResult.rows[0] || {};

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      profile: mapProfile(profile),
    });
  } catch (err) {
    console.error('[Auth] Me error:', err.message);
    res.status(500).json({ error: 'Failed to restore session.' });
  }
});

const crypto = require('crypto');

const memoryResetTokens = new Map();

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH) : '';

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const genericResponse = {
      message: "If an account exists with this email, we've sent a password reset link."
    };

    let user = null;
    try {
      const result = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [cleanEmail]);
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } catch (err) {
      console.warn('[Auth] Database lookup error on forgot-password:', err.message);
    }

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

      try {
        await pool.query('UPDATE password_resets SET used = true WHERE user_id = $1 AND used = false', [user.id]);
        await pool.query(
          'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
          [user.id, token, expiresAt]
        );
      } catch (dbErr) {
        console.warn('[Auth] Could not store reset token in DB table:', dbErr.message);
      }

      memoryResetTokens.set(token, {
        userId: user.id,
        email: user.email,
        expiresAt,
        used: false
      });

      console.log(`\n======================================================`);
      console.log(`[Auth] Password Reset Token Generated for ${user.email}`);
      console.log(`[Auth] Reset Link: ${resetUrl}`);
      console.log(`======================================================\n`);

      await sendPasswordResetEmail(user, resetUrl);

      return res.json({
        ...genericResponse,
        devResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined
      });
    }

    return res.json(genericResponse);
  } catch (err) {
    console.error('[Auth] forgot-password error:', err);
    return res.status(500).json({ error: 'Server error processing password reset request.' });
  }
});

// GET /api/auth/verify-reset-token
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Password reset token is required.' });
    }

    let tokenData = null;

    try {
      const dbResult = await pool.query(
        `SELECT pr.id, pr.user_id, pr.used, pr.expires_at, u.email 
         FROM password_resets pr 
         JOIN users u ON pr.user_id = u.id 
         WHERE pr.token = $1`,
        [token]
      );
      if (dbResult.rows.length > 0) {
        const row = dbResult.rows[0];
        tokenData = {
          userId: row.user_id,
          email: row.email,
          used: row.used,
          expiresAt: new Date(row.expires_at)
        };
      }
    } catch (err) {
      console.warn('[Auth] DB lookup error on verify-reset-token:', err.message);
    }

    if (!tokenData && memoryResetTokens.has(token)) {
      tokenData = memoryResetTokens.get(token);
    }

    if (!tokenData) {
      return res.status(400).json({ error: 'This password reset link is invalid or does not exist.' });
    }

    if (tokenData.used) {
      return res.status(400).json({ error: 'This password reset link has already been used.' });
    }

    if (new Date() > new Date(tokenData.expiresAt)) {
      return res.status(400).json({ error: 'This password reset link has expired. Please request a new one.' });
    }

    return res.json({ valid: true, email: tokenData.email });
  } catch (err) {
    console.error('[Auth] verify-reset-token error:', err);
    return res.status(500).json({ error: 'Server error verifying token.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Password reset token is required.' });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    let tokenData = null;

    try {
      const dbResult = await pool.query(
        `SELECT pr.id, pr.user_id, pr.used, pr.expires_at, u.email 
         FROM password_resets pr 
         JOIN users u ON pr.user_id = u.id 
         WHERE pr.token = $1`,
        [token]
      );
      if (dbResult.rows.length > 0) {
        const row = dbResult.rows[0];
        tokenData = {
          id: row.id,
          userId: row.user_id,
          email: row.email,
          used: row.used,
          expiresAt: new Date(row.expires_at)
        };
      }
    } catch (err) {
      console.warn('[Auth] DB lookup error on reset-password:', err.message);
    }

    if (!tokenData && memoryResetTokens.has(token)) {
      tokenData = memoryResetTokens.get(token);
    }

    if (!tokenData) {
      return res.status(400).json({ error: 'This password reset link is invalid or does not exist.' });
    }

    if (tokenData.used) {
      return res.status(400).json({ error: 'This password reset link has already been used.' });
    }

    if (new Date() > new Date(tokenData.expiresAt)) {
      return res.status(400).json({ error: 'This password reset link has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    try {
      await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, tokenData.userId]);
      await pool.query('UPDATE password_resets SET used = true WHERE user_id = $1', [tokenData.userId]);
    } catch (dbErr) {
      console.warn('[Auth] DB update error on reset-password:', dbErr.message);
    }

    memoryResetTokens.set(token, { ...tokenData, used: true });

    return res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('[Auth] reset-password error:', err);
    return res.status(500).json({ error: 'Server error updating password.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  console.log('[Auth Change Password] Request received. req.user:', req.user);
  try {
    const { currentPassword, newPassword } = req.body;
    console.log('[Auth Change Password] Inputs received:', {
      currentPasswordLength: currentPassword?.length || 0,
      newPasswordLength: newPassword?.length || 0
    });

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const userId = req.user.userId;
    console.log('[Auth Change Password] Querying user with ID:', userId);
    const userRes = await pool.query('SELECT id, password_hash FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      console.warn('[Auth Change Password] User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];
    if (user.password_hash) {
      console.log('[Auth Change Password] Verifying current password hash...');
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        console.warn('[Auth Change Password] Current password verification failed.');
        return res.status(400).json({ error: 'Incorrect current password.' });
      }
    }

    console.log('[Auth Change Password] Hashing new password...');
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    console.log('[Auth Change Password] Updating database password_hash...');
    const updateResult = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, userId]
    );

    if (updateResult.rowCount === 0) {
      console.error(`[Auth Change Password Fail] No rows updated for user ID: ${userId}`);
      return res.status(500).json({ error: 'Database update failed. Password not changed.' });
    }

    console.log(`[Auth Change Password Success] Successfully updated password hash in users table for ID: ${userId}`);
    return res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('[Auth Change Password Error] Catch block exception:', err);
    return res.status(500).json({ 
      error: `Server error changing password: ${err.message || err}` 
    });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanOtp = typeof otp === 'string' ? otp.trim() : String(otp).trim();

    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'OTP must be a 6-digit number.' });
    }

    const result = await pool.query(
      'SELECT id, email, name, role, email_verified, otp_code, otp_expires_at, otp_attempts FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ error: 'No verification code found. Please request a new OTP.' });
    }

    if (user.otp_attempts >= 5) {
      return res.status(400).json({ error: 'Maximum verification attempts exceeded. Please resend a new OTP.' });
    }

    const expiry = new Date(user.otp_expires_at);
    if (expiry < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    const valid = await bcrypt.compare(cleanOtp, user.otp_code);
    if (!valid) {
      const newAttempts = user.otp_attempts + 1;
      await pool.query('UPDATE users SET otp_attempts = $1 WHERE id = $2', [newAttempts, user.id]);
      
      const remaining = 5 - newAttempts;
      if (remaining <= 0) {
        return res.status(400).json({ error: 'Maximum attempts exceeded. Please request a new OTP.' });
      }
      return res.status(400).json({ error: `Invalid OTP. ${remaining} attempts remaining.` });
    }

    // OTP is valid! Mark verified, clear OTP details, log user in
    await pool.query(
      `UPDATE users SET 
        email_verified = true, 
        otp_code = NULL, 
        otp_expires_at = NULL, 
        otp_attempts = 0 
       WHERE id = $1`,
      [user.id]
    );

    const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    const profile = profileResult.rows[0] || {};

    // Send actual welcome email now
    sendWelcomeEmail({ email: user.email, name: user.name });

    const token = signToken(user.id, user.email);
    setCookie(res, token);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      profile: mapProfile(profile),
      message: 'Email verified successfully.'
    });
  } catch (err) {
    console.error('[Auth] Verify OTP error:', err.message);
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    const result = await pool.query(
      'SELECT id, name, email_verified, last_otp_sent_at FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    // Cooldown check (60 seconds)
    if (user.last_otp_sent_at) {
      const lastSent = new Date(user.last_otp_sent_at);
      const diffSeconds = Math.floor((new Date() - lastSent) / 1000);
      if (diffSeconds < 60) {
        const remaining = 60 - diffSeconds;
        return res.status(429).json({ 
          error: `Please wait ${remaining} seconds before requesting another code.`,
          remainingSeconds: remaining
        });
      }
    }

    // Generate and store new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);

    await pool.query(
      `UPDATE users SET 
        otp_code = $1, 
        otp_expires_at = NOW() + INTERVAL '10 minutes', 
        otp_attempts = 0, 
        last_otp_sent_at = NOW() 
       WHERE id = $2`,
      [otpHash, user.id]
    );

    await sendOtpEmail({ email: cleanEmail, name: user.name, otp });

    res.json({ message: 'A new verification OTP has been sent to your email.' });
  } catch (err) {
    console.error('[Auth] Resend OTP error:', err.message);
    res.status(500).json({ error: 'Failed to resend OTP.' });
  }
});

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

module.exports = { router, authMiddleware };
