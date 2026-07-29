const axios = require('axios');

const MSG91_BASE = 'https://api.msg91.com/api/v5/otp';

function getConfig() {
  const authkey = process.env.MSG91_AUTH_KEY;
  const sender = process.env.MSG91_SENDER_ID;
  const template_id = process.env.MSG91_OTP_TEMPLATE_ID;
  if (!authkey || !sender || !template_id) {
    throw new Error('MSG91 credentials not configured. Set MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_OTP_TEMPLATE_ID.');
  }
  return { authkey, sender, template_id };
}

function formatPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned.slice(1);
  return cleaned;
}

async function sendOtp(phone) {
  const { authkey, sender, template_id } = getConfig();
  const mobile = formatPhone(phone);
  const res = await axios.post(`${MSG91_BASE}`, null, {
    params: { authkey, mobile, sender, template_id, otp_length: 6, otp_expiry: 5 },
    timeout: 15000,
  });
  return res.data;
}

async function verifyOtp(phone, otp) {
  const { authkey } = getConfig();
  const mobile = formatPhone(phone);
  const res = await axios.post(`${MSG91_BASE}/verify`, null, {
    params: { authkey, mobile, otp },
    timeout: 15000,
  });
  return res.data;
}

async function retryOtp(phone) {
  const { authkey } = getConfig();
  const mobile = formatPhone(phone);
  const res = await axios.post(`${MSG91_BASE}/retry`, null, {
    params: { authkey, mobile, retrytype: 'text' },
    timeout: 15000,
  });
  return res.data;
}

module.exports = { sendOtp, verifyOtp, retryOtp };
