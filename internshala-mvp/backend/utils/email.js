const sgMail = require('@sendgrid/mail');

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

const FROM = process.env.FROM_EMAIL || 'noreply@incuxai.careers';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const BASE_HTML = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
${content}
<tr><td style="padding:0 32px 28px;text-align:center;border-top:1px solid #e2e8f0">
<p style="color:#94a3b8;font-size:11px;margin:20px 0 0;line-height:1.6">
IncuXAI Careers &middot; Your AI-powered job discovery platform<br>
If you no longer wish to receive these emails, <a href="${FRONTEND_URL}/profile" style="color:#94a3b8">unsubscribe</a>.
</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;

async function send({ to, subject, html }) {
  if (!SENDGRID_KEY) {
    console.warn(`[Email] Skipping "${subject}" to ${to} — no SENDGRID_API_KEY configured`);
    return false;
  }
  try {
    await sgMail.send({ from: FROM, to, subject, html });
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, err.response?.body?.errors?.[0]?.message || err.message);
    return false;
  }
}

// ── Templates ──────────────────────────────────────────────────────────────────

function welcomeHTML(name) {
  return BASE_HTML(`
<tr><td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:36px 32px 28px;text-align:center">
<h1 style="color:#fff;font-size:22px;margin:0 0 4px;letter-spacing:-0.3px">Welcome to IncuXAI Careers</h1>
<p style="color:#c7d2fe;font-size:13px;margin:0;font-weight:500">Your personalized job portal</p>
</td></tr>
<tr><td style="padding:32px 32px 24px">
<p style="color:#1e293b;font-size:15px;margin:0 0 6px;font-weight:600">Hi ${name || 'there'},</p>
<p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 18px">Thanks for signing up! Your account is ready. Here's what you can do next:</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:8px 0">
<table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:10px">
<tr><td width="32" style="vertical-align:top;padding:12px 0 12px 14px;font-size:18px">🔍</td>
<td style="font-size:13px;color:#334155;padding:12px 14px;line-height:1.5"><strong style="color:#0f172a">Browse jobs</strong> — Explore internships and full-time roles matched to your skills</td></tr>
<tr><td width="32" style="vertical-align:top;padding:4px 0 12px 14px;font-size:18px">📄</td>
<td style="font-size:13px;color:#334155;padding:4px 14px 12px;line-height:1.5"><strong style="color:#0f172a">Build your resume</strong> — AI Resume Builder with ATS scoring and 8 pro templates</td></tr>
<tr><td width="32" style="vertical-align:top;padding:4px 0 12px 14px;font-size:18px">📊</td>
<td style="font-size:13px;color:#334155;padding:4px 14px 12px;line-height:1.5"><strong style="color:#0f172a">Track applications</strong> — Save jobs, apply, and monitor from your dashboard</td></tr>
</table>
</td></tr></table>
<p style="color:#475569;font-size:13px;line-height:1.7;margin:18px 0 0">
Start by completing your <a href="${FRONTEND_URL}/profile" style="color:#4f46e5;font-weight:600;text-decoration:none">profile</a> to unlock personalized recommendations.
</p>
</td></tr>`);
}

function jobAlertHTML(name, jobs) {
  const jobRows = jobs.slice(0, 5).map(j => `
<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">
<table width="100%"><tr>
<td style="font-size:13px;color:#1e293b;font-weight:600">${j.title}</td>
<td align="right" style="font-size:12px;color:#64748b">${j.company}</td>
</tr>
<tr><td colspan="2" style="font-size:12px;color:#94a3b8;padding-top:2px">📍 ${j.location || 'Remote'} ${j.salary ? '💰 '+j.salary : ''}</td></tr>
</table>
</td></tr>`).join('');

  return BASE_HTML(`
<tr><td style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:36px 32px 28px;text-align:center">
<h1 style="color:#fff;font-size:20px;margin:0 0 4px">New Jobs Matching Your Profile</h1>
<p style="color:#bae6fd;font-size:13px;margin:0;font-weight:500">Handpicked opportunities for you</p>
</td></tr>
<tr><td style="padding:32px 32px 24px">
<p style="color:#1e293b;font-size:15px;margin:0 0 6px;font-weight:600">Hi ${name || 'there'},</p>
<p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 14px">We found ${jobs.length} new job${jobs.length > 1 ? 's' : ''} that match your skills and preferences:</p>
<table width="100%" cellpadding="0" cellspacing="0">${jobRows}</table>
<p style="margin:20px 0 0;text-align:center">
<a href="${FRONTEND_URL}/jobs" style="background:#2563eb;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;display:inline-block">View All Jobs →</a>
</p>
<p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;text-align:center">
Don't wait — these roles fill quickly. Apply before the competition does.
</p>
</td></tr>`);
}

function urgencyHTML(name, jobs) {
  const jobRows = jobs.slice(0, 5).map(j => `
<tr><td style="padding:10px 0;border-bottom:1px solid #fee2e2">
<table width="100%"><tr>
<td style="font-size:13px;color:#1e293b;font-weight:600">${j.title}</td>
<td align="right" style="font-size:12px;color:#dc2626;font-weight:600">⏳ Urgent</td>
</tr>
<tr><td colspan="2" style="font-size:12px;color:#64748b;padding-top:2px">${j.company} • ${j.location || 'Remote'}</td></tr>
</table>
</td></tr>`).join('');

  return BASE_HTML(`
<tr><td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:36px 32px 28px;text-align:center">
<h1 style="color:#fff;font-size:20px;margin:0 0 4px">⏳ Hurry! These Jobs are Closing Fast</h1>
<p style="color:#fca5a5;font-size:13px;margin:0;font-weight:500">Apply now before they're gone</p>
</td></tr>
<tr><td style="padding:32px 32px 24px">
<p style="color:#1e293b;font-size:15px;margin:0 0 6px;font-weight:600">Hi ${name || 'there'},</p>
<p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 14px">These ${jobs.length} position${jobs.length > 1 ? 's are' : ' is'} receiving applications right now and won't be open for long:</p>
<table width="100%" cellpadding="0" cellspacing="0">${jobRows}</table>
<p style="margin:20px 0 0;text-align:center">
<a href="${FRONTEND_URL}/jobs" style="background:#dc2626;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;display:inline-block">Apply Now →</a>
</p>
</td></tr>`);
}

// ── Public API ─────────────────────────────────────────────────────────────────

function resumeReminderHTML(name) {
  return BASE_HTML(`
<tr><td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:36px 32px 28px;text-align:center">
<h1 style="color:#fff;font-size:20px;margin:0 0 4px">Build Your ATS Resume</h1>
<p style="color:#fde68a;font-size:13px;margin:0;font-weight:500">Stand out from the competition</p>
</td></tr>
<tr><td style="padding:32px 32px 24px">
<p style="color:#1e293b;font-size:15px;margin:0 0 6px;font-weight:600">Hi ${name || 'there'},</p>
<p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 18px">Your resume is the first thing recruiters see. Make it count with our free AI Resume Builder:</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:8px 0">
<table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:10px">
<tr><td width="32" style="vertical-align:top;padding:12px 0 12px 14px;font-size:18px">⭐</td>
<td style="font-size:13px;color:#334155;padding:12px 14px;line-height:1.5"><strong style="color:#0f172a">ATS Score</strong> — Get a real-time score and optimize for applicant tracking systems</td></tr>
<tr><td width="32" style="vertical-align:top;padding:4px 0 12px 14px;font-size:18px">🎨</td>
<td style="font-size:13px;color:#334155;padding:4px 14px 12px;line-height:1.5"><strong style="color:#0f172a">8 Pro Templates</strong> — Choose from modern, professional designs that recruiters love</td></tr>
<tr><td width="32" style="vertical-align:top;padding:4px 0 12px 14px;font-size:18px">📝</td>
<td style="font-size:13px;color:#334155;padding:4px 14px 12px;line-height:1.5"><strong style="color:#0f172a">AI Suggestions</strong> — Smart content recommendations tailored to your target role</td></tr>
</table>
</td></tr></table>
<p style="color:#475569;font-size:13px;line-height:1.7;margin:18px 0 0">
Employers spend an average of <strong>7 seconds</strong> scanning a resume. Make yours unforgettable.
</p>
<p style="margin:20px 0 0;text-align:center">
<a href="${FRONTEND_URL}/resume" style="background:#d97706;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;display:inline-block">Build Your Resume →</a>
</p>
</td></tr>`);
}

function dailyReminderHTML(name, jobs) {
  const jobRows = jobs.slice(0, 5).map(j => `
<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">
<table width="100%"><tr>
<td style="font-size:13px;color:#1e293b;font-weight:600">${j.title}</td>
<td align="right" style="font-size:12px;color:#64748b">${j.company}</td>
</tr>
<tr><td colspan="2" style="font-size:12px;color:#94a3b8;padding-top:2px">📍 ${j.location || 'Remote'} ${j.salary ? '💰 '+j.salary : ''}</td></tr>
</table>
</td></tr>`).join('');

  return BASE_HTML(`
<tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:36px 32px 28px;text-align:center">
<h1 style="color:#fff;font-size:20px;margin:0 0 4px">Don't Miss Out — Apply Today!</h1>
<p style="color:#a7f3d0;font-size:13px;margin:0;font-weight:500">New opportunities waiting for you</p>
</td></tr>
<tr><td style="padding:32px 32px 24px">
<p style="color:#1e293b;font-size:15px;margin:0 0 6px;font-weight:600">Hi ${name || 'there'},</p>
<p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 14px">Here are ${jobs.length} job${jobs.length > 1 ? 's' : ''} you can apply to right now:</p>
<table width="100%" cellpadding="0" cellspacing="0">${jobRows}</table>
<p style="margin:20px 0 0;text-align:center">
<a href="${FRONTEND_URL}/jobs" style="background:#047857;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;display:inline-block">Browse All Jobs →</a>
</p>
<p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;text-align:center">
Consistency is key — apply to a few jobs every day to maximize your chances.
</p>
</td></tr>`);
}

function passwordResetHTML(name, resetUrl) {
  return BASE_HTML(`
<tr><td style="background:linear-gradient(135deg,#4f46e5,#3730a3);padding:36px 32px 28px;text-align:center">
<h1 style="color:#fff;font-size:22px;margin:0 0 4px;letter-spacing:-0.3px">Reset Your Password</h1>
<p style="color:#c7d2fe;font-size:13px;margin:0;font-weight:500">IncuXAI Careers Account Security</p>
</td></tr>
<tr><td style="padding:32px 32px 24px">
<p style="color:#1e293b;font-size:15px;margin:0 0 6px;font-weight:600">Hi ${name || 'there'},</p>
<p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 20px">
We received a request to reset the password for your IncuXAI Careers account. Click the button below to set up a new password:
</p>
<p style="margin:24px 0;text-align:center">
<a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;display:inline-block;box-shadow:0 4px 12px rgba(79,70,229,0.25)">Reset Password →</a>
</p>
<p style="color:#64748b;font-size:12px;line-height:1.6;margin:20px 0 0;padding-top:16px;border-top:1px solid #f1f5f9">
Or copy and paste this link into your browser:<br>
<a href="${resetUrl}" style="color:#4f46e5;word-break:break-all">${resetUrl}</a>
</p>
<p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:16px 0 0;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0">
🔒 <strong>Security Note:</strong> This password reset link will expire in <strong>30 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged and your account is completely secure.
</p>
</td></tr>`);
}

async function sendWelcomeEmail(user) {
  return send({ to: user.email, subject: 'Welcome to IncuXAI Careers — Your Job Search Starts Now!', html: welcomeHTML(user.name) });
}

async function sendJobAlert(user, jobs) {
  return send({ to: user.email, subject: `${jobs.length} New Jobs For You — Apply Today!`, html: jobAlertHTML(user.name, jobs) });
}

async function sendUrgencyAlert(user, jobs) {
  return send({ to: user.email, subject: `⏳ ${jobs.length} Jobs Closing Soon — Don't Miss Out!`, html: urgencyHTML(user.name, jobs) });
}

async function sendResumeReminder(user) {
  return send({ to: user.email, subject: 'Build Your ATS Resume — Get Hired Faster!', html: resumeReminderHTML(user.name) });
}

async function sendDailyReminder(user, jobs) {
  return send({ to: user.email, subject: `☀️ ${jobs.length} Jobs Ready — Apply Today!`, html: dailyReminderHTML(user.name, jobs) });
}

async function sendPasswordResetEmail(user, resetUrl) {
  return send({ to: user.email, subject: 'Reset your IncuXAI Careers password', html: passwordResetHTML(user.name, resetUrl) });
}

module.exports = {
  sendWelcomeEmail,
  sendJobAlert,
  sendUrgencyAlert,
  sendResumeReminder,
  sendDailyReminder,
  sendPasswordResetEmail
};
