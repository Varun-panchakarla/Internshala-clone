const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';
const SALT_ROUNDS = 12;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
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
      res.clearCookie('token', { path: '/' });
      return res.status(401).json({ error: 'User session is invalid or user was deleted.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token', { path: '/' });
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

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role, created_at`,
      [cleanEmail, passwordHash, cleanName]
    );
    const user = userResult.rows[0];

    const profileResult = await pool.query(
      `INSERT INTO profiles (user_id, full_name, experience, employment_type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.id, cleanName, 'Fresher', 'Full-time']
    );

    const token = signToken(user.id, user.email);
    setCookie(res, token);

    sendWelcomeEmail({ email: cleanEmail, name: cleanName });

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      profile: mapProfile(profileResult.rows[0]),
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
      'SELECT id, email, name, password_hash, role FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

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
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      return res.status(401).json({ error: 'Invalid Google credential.' });
    }

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split('@')[0];

    const existing = await pool.query(
      'SELECT id, email, name, role FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    let user;
    let isNewUser = false;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
      }
    } else {
      isNewUser = true;
      const result = await pool.query(
        `INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING id, email, name, role`,
        [email, name, googleId]
      );
      user = result.rows[0];

      await pool.query(
        `INSERT INTO profiles (user_id, full_name, experience, employment_type) VALUES ($1, $2, $3, $4)`,
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
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out.' });
});

// GET /api/auth/me — restore session from cookie
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      res.clearCookie('token', { path: '/' });
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
  };
}

module.exports = { router, authMiddleware };
