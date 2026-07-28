const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

// In-memory OTP store: Map<phone, { code, expiresAt, userId }>
const otpStore = new Map();

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between sends
const MAX_ATTEMPTS = 5;

// Cleanup expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore) {
    if (now > data.expiresAt) otpStore.delete(phone);
  }
}, 10 * 60 * 1000);

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function formatPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
  if (cleaned.length === 10) return '+91' + cleaned;
  return cleaned;
}

// POST /api/otp/send — send OTP to phone number
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const cleanPhone = formatPhone(phone);
    if (!/^\+\d{10,15}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format.' });
    }

    // Check resend cooldown
    const existing = otpStore.get(cleanPhone);
    if (existing && (Date.now() - existing.sentAt) < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.sentAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSec}s before requesting a new OTP.` });
    }

    const code = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    otpStore.set(cleanPhone, {
      code,
      expiresAt,
      userId,
      sentAt: Date.now(),
      attempts: 0,
    });

    // Try to send SMS via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      try {
        const twilio = require('twilio')(accountSid, authToken);
        const msgPayload = {
          body: `Your IncuXAI Careers verification code is: ${code}. It expires in 5 minutes.`,
          to: cleanPhone,
        };
        const messagingSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
        if (messagingSid) {
          msgPayload.messagingServiceSid = messagingSid;
        } else {
          msgPayload.from = fromNumber;
        }
        await twilio.messages.create(msgPayload);
        console.log(`[OTP] Sent to ${cleanPhone}`);
      } catch (twilioErr) {
        console.error('[OTP] Twilio error:', twilioErr.message);
        // In dev mode, return OTP in response for testing
        if (process.env.NODE_ENV !== 'production') {
          return res.json({ message: 'OTP sent (dev mode).', otp: code });
        }
        return res.status(500).json({ error: 'Failed to send SMS. Please try again.' });
      }
    } else {
      console.warn('[OTP] Twilio not configured. Returning OTP in response.');
      return res.json({ message: 'OTP generated (Twilio not configured).', otp: code });
    }

    res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[OTP] Send error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

// POST /api/otp/verify — verify OTP code
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone number and OTP code are required.' });
    }

    const cleanPhone = formatPhone(phone);
    const stored = otpStore.get(cleanPhone);

    if (!stored) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }

    if (stored.userId !== userId) {
      return res.status(403).json({ error: 'This OTP was not sent to your account.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    stored.attempts++;
    if (stored.attempts > MAX_ATTEMPTS) {
      otpStore.delete(cleanPhone);
      return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (stored.code !== code.trim()) {
      return res.status(400).json({ error: `Incorrect OTP. ${MAX_ATTEMPTS - stored.attempts} attempts remaining.` });
    }

    // OTP verified — mark phone as verified in profiles
    await pool.query(
      'UPDATE profiles SET contact_number = $1, phone_verified = true WHERE user_id = $2',
      [cleanPhone, userId]
    );

    otpStore.delete(cleanPhone);
    console.log(`[OTP] Verified for user ${userId}, phone ${cleanPhone}`);

    res.json({ message: 'Phone number verified successfully.', phone: cleanPhone });
  } catch (err) {
    console.error('[OTP] Verify error:', err.message);
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

module.exports = router;
