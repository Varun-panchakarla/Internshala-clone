const pool = require('../db/pool');
const { sendJobAlert, sendResumeReminder, sendDailyReminder } = require('./email');

async function hasSentToday(userId, emailType) {
  try {
    const result = await pool.query(
      'SELECT 1 FROM email_log WHERE user_id = $1 AND email_type = $2 AND sent_at::date = CURRENT_DATE',
      [userId, emailType]
    );
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

async function logEmail(userId, email, emailType) {
  try {
    await pool.query(
      'INSERT INTO email_log (user_id, email, email_type) VALUES ($1, $2, $3) ON CONFLICT (user_id, email_type, DATE(sent_at)) DO NOTHING',
      [userId, email, emailType]
    );
  } catch (err) {
    console.error(`[Notify] Failed to log email for user ${userId}:`, err.message);
  }
}

async function notifyNewJobs(newJobs) {
  if (!newJobs || newJobs.length === 0) return;

  try {
    const users = await pool.query('SELECT id, email, name FROM users');
    if (users.rows.length === 0) {
      console.log('[Notify] No users to alert about new jobs');
      return;
    }

    let sent = 0;
    for (const user of users.rows) {
      const alreadySent = await hasSentToday(user.id, 'job_alert');
      if (!alreadySent) {
        const success = await sendJobAlert({ email: user.email, name: user.name }, newJobs);
        if (success) {
          await logEmail(user.id, user.email, 'job_alert');
          sent++;
        }
      }
    }
    console.log(`[Notify] Sent new-job alerts to ${sent}/${users.rows.length} users (${newJobs.length} jobs)`);
  } catch (err) {
    console.error('[Notify] Error sending new-job alerts:', err.message);
  }
}

async function sendDailyJobReminders() {
  try {
    const jobs = await pool.query(
      "SELECT * FROM jobs WHERE created_at > NOW() - INTERVAL '7 days' ORDER BY created_at DESC LIMIT 10"
    );
    if (jobs.rows.length === 0) {
      console.log('[Notify] No recent jobs for daily reminder');
      return;
    }

    const users = await pool.query('SELECT id, email, name FROM users');
    if (users.rows.length === 0) {
      console.log('[Notify] No users for daily reminder');
      return;
    }

    let sent = 0;
    for (const user of users.rows) {
      const alreadySent = await hasSentToday(user.id, 'daily_reminder');
      if (!alreadySent) {
        const success = await sendDailyReminder({ email: user.email, name: user.name }, jobs.rows);
        if (success) {
          await logEmail(user.id, user.email, 'daily_reminder');
          sent++;
        }
      }
    }
    console.log(`[Notify] Sent daily reminders to ${sent}/${users.rows.length} users`);
  } catch (err) {
    console.error('[Notify] Error sending daily reminders:', err.message);
  }
}

async function sendResumeReminders() {
  try {
    const users = await pool.query(`
      SELECT u.id, u.email, u.name FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE p.resume_info IS NULL OR p.resume_info = '{}'::jsonb
    `);
    if (users.rows.length === 0) {
      console.log('[Notify] All users have resumes — skipping reminder');
      return;
    }

    let sent = 0;
    for (const user of users.rows) {
      const alreadySent = await hasSentToday(user.id, 'resume_reminder');
      if (!alreadySent) {
        const success = await sendResumeReminder({ email: user.email, name: user.name });
        if (success) {
          await logEmail(user.id, user.email, 'resume_reminder');
          sent++;
        }
      }
    }
    console.log(`[Notify] Sent resume reminders to ${sent}/${users.rows.length} users`);
  } catch (err) {
    console.error('[Notify] Error sending resume reminders:', err.message);
  }
}

module.exports = { notifyNewJobs, sendDailyJobReminders, sendResumeReminders };
