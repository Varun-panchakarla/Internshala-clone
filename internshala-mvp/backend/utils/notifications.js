const pool = require('../db/pool');
const { sendJobAlert, sendResumeReminder, sendDailyReminder } = require('./email');

let lastScrapeTime = new Date();

async function notifyNewJobs(newJobs) {
  if (!newJobs || newJobs.length === 0) return;

  try {
    const users = await pool.query('SELECT id, email, name FROM users');
    if (users.rows.length === 0) {
      console.log('[Notify] No users to alert about new jobs');
      return;
    }

    for (const user of users.rows) {
      sendJobAlert({ email: user.email, name: user.name }, newJobs);
    }
    console.log(`[Notify] Sent new-job alerts to ${users.rows.length} users (${newJobs.length} jobs)`);
  } catch (err) {
    console.error('[Notify] Error sending new-job alerts:', err.message);
  }
}

async function sendDailyJobReminders() {
  try {
    const jobs = await pool.query(
      'SELECT * FROM jobs WHERE created_at > NOW() - INTERVAL \'7 days\' ORDER BY created_at DESC LIMIT 10'
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

    for (const user of users.rows) {
      sendDailyReminder({ email: user.email, name: user.name }, jobs.rows);
    }
    console.log(`[Notify] Sent daily reminders to ${users.rows.length} users`);
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

    for (const user of users.rows) {
      sendResumeReminder({ email: user.email, name: user.name });
    }
    console.log(`[Notify] Sent resume reminders to ${users.rows.length} users`);
  } catch (err) {
    console.error('[Notify] Error sending resume reminders:', err.message);
  }
}

module.exports = { notifyNewJobs, sendDailyJobReminders, sendResumeReminders };
