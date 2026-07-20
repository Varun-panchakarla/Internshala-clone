const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { sendWelcomeEmail } = require('../utils/email');

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
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at`,
      [cleanEmail, passwordHash, cleanName]
    );
    const user = userResult.rows[0];

    await pool.query(
      `INSERT INTO profiles (user_id, full_name, experience, employment_type) VALUES ($1, $2, $3, $4)`,
      [user.id, cleanName, 'Fresher', 'Full-time']
    );

    const token = signToken(user.id, user.email);
    setCookie(res, token);

    sendWelcomeEmail({ email: cleanEmail, name: cleanName });

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      profile: {
        fullName: cleanName,
        skills: [],
        experience: 'Fresher',
        employmentType: 'Full-time',
      },
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
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
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

    sendWelcomeEmail({ email: user.email, name: user.name });

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
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
      'SELECT id, email, name FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
      }
    } else {
      const result = await pool.query(
        `INSERT INTO users (email, name, google_id) VALUES ($1, $2, $3) RETURNING id, email, name`,
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

    sendWelcomeEmail({ email: user.email, name: user.name });

    const token = signToken(user.id, user.email);
    setCookie(res, token);

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
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
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
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
      user: { id: user.id, email: user.email, name: user.name },
      profile: mapProfile(profile),
    });
  } catch (err) {
    console.error('[Auth] Me error:', err.message);
    res.status(500).json({ error: 'Failed to restore session.' });
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
  };
}

module.exports = { router, authMiddleware };
