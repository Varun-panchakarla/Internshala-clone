const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/pool');
const { sendEmployerOtpEmail, sendEmployerPasswordResetEmail } = require('../utils/email');

const router = express.Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
};

function signEmployerToken(employerId, email) {
  return jwt.sign({ employerId, email, role: 'employer' }, JWT_SECRET, { expiresIn: '7d' });
}

// Employer Auth Middleware
async function employerAuthMiddleware(req, res, next) {
  const token = req.cookies?.employer_token;
  if (!token) return res.status(401).json({ error: 'Employer authentication required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'employer') {
      return res.status(403).json({ error: 'Invalid access role.' });
    }

    const check = await pool.query('SELECT id, email, recruiter_name FROM employers WHERE id = $1', [decoded.employerId]);
    if (check.rows.length === 0) {
      res.clearCookie('employer_token', CLEAR_COOKIE_OPTIONS);
      return res.status(401).json({ error: 'Employer session is invalid.' });
    }

    req.employer = {
      id: check.rows[0].id,
      email: check.rows[0].email,
      recruiterName: check.rows[0].recruiter_name
    };
    next();
  } catch (err) {
    res.clearCookie('employer_token', CLEAR_COOKIE_OPTIONS);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

// helper to map employer profile response
function mapEmployerProfile(row) {
  if (!row) return {};
  return {
    companyLogo: row.company_logo || '',
    industry: row.industry || '',
    companySize: row.company_size || '',
    foundedYear: row.founded_year || '',
    website: row.website || '',
    linkedin: row.linkedin || '',
    description: row.description || '',
    headquarters: row.headquarters || '',
    officeLocations: row.office_locations || '',
    hiringLocations: row.hiring_locations || '',
    workMode: row.work_mode || 'Remote',
    designation: row.designation || '',
    department: row.department || '',
    officialPhone: row.official_phone || '',
    onboardingCompleted: row.onboarding_completed || false,
  };
}

// POST /api/employer/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { recruiterName, companyName, email, phone, website, password } = req.body;

    if (!recruiterName || !companyName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Required registration fields are missing.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRecruiter = recruiterName.trim();
    const cleanCompany = companyName.trim();
    const cleanPhone = phone.trim();
    const cleanWebsite = website ? website.trim() : '';

    // Check duplicate
    const checkDup = await pool.query('SELECT id, email_verified FROM employers WHERE email = $1', [cleanEmail]);
    let employerId;

    if (checkDup.rows.length > 0) {
      const existing = checkDup.rows[0];
      if (existing.email_verified) {
        return res.status(409).json({ error: 'An employer account with this email already exists.' });
      }
      
      // Update existing unverified employer details
      const passHash = await bcrypt.hash(password, SALT_ROUNDS);
      await pool.query(
        `UPDATE employers SET 
          recruiter_name = $1, 
          company_name = $2, 
          phone = $3, 
          website = $4, 
          password_hash = $5 
         WHERE id = $6`,
        [cleanRecruiter, cleanCompany, cleanPhone, cleanWebsite, passHash, existing.id]
      );
      employerId = existing.id;
    } else {
      // Create new employer
      const passHash = await bcrypt.hash(password, SALT_ROUNDS);
      const insertRes = await pool.query(
        `INSERT INTO employers (company_name, recruiter_name, email, phone, website, password_hash, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING id`,
        [cleanCompany, cleanRecruiter, cleanEmail, cleanPhone, cleanWebsite, passHash]
      );
      employerId = insertRes.rows[0].id;

      // Seed empty profile
      await pool.query(
        'INSERT INTO employer_profiles (employer_id, company_logo, work_mode) VALUES ($1, $2, $3)',
        [employerId, '', 'Remote']
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);

    await pool.query(
      `UPDATE employers SET 
        otp_code = $1, 
        otp_expires_at = NOW() + INTERVAL '10 minutes', 
        otp_attempts = 0, 
        last_otp_sent_at = NOW() 
       WHERE id = $2`,
      [otpHash, employerId]
    );

    await sendEmployerOtpEmail({ email: cleanEmail, name: cleanRecruiter, otp });

    res.status(201).json({
      email: cleanEmail,
      message: 'Verification OTP sent to your email. Please verify to activate recruiter account.'
    });
  } catch (err) {
    console.error('[Employer Register] Error:', err.message);
    res.status(500).json({ error: 'Recruiter registration failed.' });
  }
});

// POST /api/employer/auth/verify-email
router.post('/auth/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const result = await pool.query(
      'SELECT id, recruiter_name, company_name, email, email_verified, otp_code, otp_expires_at, otp_attempts FROM employers WHERE email = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const employer = result.rows[0];

    if (employer.email_verified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    if (employer.otp_attempts >= 5) {
      return res.status(400).json({ error: 'Maximum attempts exceeded. Please resend OTP.' });
    }

    const expiry = new Date(employer.otp_expires_at);
    if (expiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Please resend OTP.' });
    }

    const valid = await bcrypt.compare(cleanOtp, employer.otp_code);
    if (!valid) {
      const attempts = employer.otp_attempts + 1;
      await pool.query('UPDATE employers SET otp_attempts = $1 WHERE id = $2', [attempts, employer.id]);
      
      const remaining = 5 - attempts;
      if (remaining <= 0) {
        return res.status(400).json({ error: 'Maximum attempts exceeded. Please resend OTP.' });
      }
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Success
    await pool.query(
      `UPDATE employers SET 
        email_verified = true, 
        otp_code = NULL, 
        otp_expires_at = NULL, 
        otp_attempts = 0 
       WHERE id = $1`,
      [employer.id]
    );

    const profileRes = await pool.query('SELECT * FROM employer_profiles WHERE employer_id = $1', [employer.id]);
    const profile = profileRes.rows[0] || {};

    const token = signEmployerToken(employer.id, employer.email);
    res.cookie('employer_token', token, COOKIE_OPTIONS);

    res.json({
      employer: {
        id: employer.id,
        email: employer.email,
        recruiterName: employer.recruiter_name,
        companyName: employer.company_name,
        role: 'employer'
      },
      profile: mapEmployerProfile(profile),
      message: 'Email verified successfully.'
    });
  } catch (err) {
    console.error('[Employer Verify] Error:', err.message);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// POST /api/employer/auth/resend-otp
router.post('/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const cleanEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT id, recruiter_name, email_verified, last_otp_sent_at FROM employers WHERE email = $1', [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const employer = result.rows[0];
    if (employer.email_verified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    if (employer.last_otp_sent_at) {
      const diff = Math.floor((new Date() - new Date(employer.last_otp_sent_at)) / 1000);
      if (diff < 60) {
        const remaining = 60 - diff;
        return res.status(429).json({
          error: `Please wait ${remaining} seconds before requesting another code.`,
          remainingSeconds: remaining
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);

    await pool.query(
      `UPDATE employers SET 
        otp_code = $1, 
        otp_expires_at = NOW() + INTERVAL '10 minutes', 
        otp_attempts = 0, 
        last_otp_sent_at = NOW() 
       WHERE id = $2`,
      [otpHash, employer.id]
    );

    await sendEmployerOtpEmail({ email: cleanEmail, name: employer.recruiter_name, otp });

    res.json({ message: 'A new verification OTP has been sent to your email.' });
  } catch (err) {
    console.error('[Employer Resend OTP] Error:', err.message);
    res.status(500).json({ error: 'Failed to resend OTP.' });
  }
});

// POST /api/employer/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const cleanEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT * FROM employers WHERE email = $1', [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const employer = result.rows[0];

    if (!employer.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.', email: employer.email });
    }

    const valid = await bcrypt.compare(password, employer.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const profileRes = await pool.query('SELECT * FROM employer_profiles WHERE employer_id = $1', [employer.id]);
    const profile = profileRes.rows[0] || {};

    const token = signEmployerToken(employer.id, employer.email);
    res.cookie('employer_token', token, COOKIE_OPTIONS);

    res.json({
      employer: {
        id: employer.id,
        email: employer.email,
        recruiterName: employer.recruiter_name,
        companyName: employer.company_name,
        role: 'employer'
      },
      profile: mapEmployerProfile(profile)
    });
  } catch (err) {
    console.error('[Employer Login] Error:', err.message);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// POST /api/employer/auth/logout
router.post('/auth/logout', async (req, res) => {
  res.clearCookie('employer_token', CLEAR_COOKIE_OPTIONS);
  res.json({ message: 'Logged out successfully.' });
});

// GET /api/employer/auth/me
router.get('/auth/me', employerAuthMiddleware, async (req, res) => {
  try {
    const employer = await pool.query('SELECT id, recruiter_name, company_name, email FROM employers WHERE id = $1', [req.employer.id]);
    const profile = await pool.query('SELECT * FROM employer_profiles WHERE employer_id = $1', [req.employer.id]);

    res.json({
      employer: {
        id: employer.rows[0].id,
        email: employer.rows[0].email,
        recruiterName: employer.rows[0].recruiter_name,
        companyName: employer.rows[0].company_name,
        role: 'employer'
      },
      profile: mapEmployerProfile(profile.rows[0] || {})
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load session.' });
  }
});

// POST /api/employer/auth/forgot-password
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const cleanEmail = email.trim().toLowerCase();
    const check = await pool.query('SELECT id, recruiter_name, email FROM employers WHERE email = $1', [cleanEmail]);

    if (check.rows.length === 0) {
      return res.json({ message: 'If the email exists, a password reset link has been sent.' });
    }

    const employer = check.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      'INSERT INTO employer_password_resets (employer_id, token, expires_at) VALUES ($1, $2, $3)',
      [employer.id, token, expires]
    );

    const resetUrl = `${FRONTEND_URL}/employer/reset-password?token=${token}`;
    await sendEmployerPasswordResetEmail(employer, resetUrl);

    res.json({ message: 'If the email exists, a password reset link has been sent.' });
  } catch (err) {
    console.error('[Employer Forgot Pass] Error:', err.message);
    res.status(500).json({ error: 'Failed to send reset link.' });
  }
});

// POST /api/employer/auth/reset-password
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and new password are required.' });

    const check = await pool.query(
      'SELECT id, employer_id, expires_at, used FROM employer_password_resets WHERE token = $1',
      [token]
    );

    if (check.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const reset = check.rows[0];
    if (reset.used) {
      return res.status(400).json({ error: 'This reset link has already been used.' });
    }

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This reset link has expired.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query('UPDATE employers SET password_hash = $1 WHERE id = $2', [hash, reset.employer_id]);
    await pool.query('UPDATE employer_password_resets SET used = true WHERE id = $1', [reset.id]);

    res.json({ message: 'Password has been reset successfully. Please log in.' });
  } catch (err) {
    console.error('[Employer Reset Pass] Error:', err.message);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// GET /api/employer/profile
router.get('/profile', employerAuthMiddleware, async (req, res) => {
  try {
    const profile = await pool.query('SELECT * FROM employer_profiles WHERE employer_id = $1', [req.employer.id]);
    res.json({ profile: mapEmployerProfile(profile.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// PUT /api/employer/profile
router.put('/profile', employerAuthMiddleware, async (req, res) => {
  try {
    const {
      companyLogo, industry, companySize, foundedYear, website, linkedin,
      description, headquarters, officeLocations, hiringLocations, workMode,
      designation, department, officialPhone, onboardingCompleted
    } = req.body;

    const result = await pool.query(
      `INSERT INTO employer_profiles (
        employer_id, company_logo, industry, company_size, founded_year, website, linkedin,
        description, headquarters, office_locations, hiring_locations, work_mode,
        designation, department, official_phone, onboarding_completed, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      ON CONFLICT (employer_id)
      DO UPDATE SET
        company_logo = EXCLUDED.company_logo,
        industry = EXCLUDED.industry,
        company_size = EXCLUDED.company_size,
        founded_year = EXCLUDED.founded_year,
        website = EXCLUDED.website,
        linkedin = EXCLUDED.linkedin,
        description = EXCLUDED.description,
        headquarters = EXCLUDED.headquarters,
        office_locations = EXCLUDED.office_locations,
        hiring_locations = EXCLUDED.hiring_locations,
        work_mode = EXCLUDED.work_mode,
        designation = EXCLUDED.designation,
        department = EXCLUDED.department,
        official_phone = EXCLUDED.official_phone,
        onboarding_completed = EXCLUDED.onboarding_completed,
        updated_at = NOW()
      RETURNING *`,
      [
        req.employer.id, companyLogo || '', industry || '', companySize || '', foundedYear || '',
        website || '', linkedin || '', description || '', headquarters || '',
        officeLocations || '', hiringLocations || '', workMode || 'Remote',
        designation || '', department || '', officialPhone || '', onboardingCompleted || false
      ]
    );

    res.json({ profile: mapEmployerProfile(result.rows[0]) });
  } catch (err) {
    console.error('[Employer Update Profile] Error:', err.message);
    res.status(500).json({ error: 'Failed to update recruiter/company profile.' });
  }
});

module.exports = { router, employerAuthMiddleware };
