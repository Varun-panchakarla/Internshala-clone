require('dotenv').config();
const pool = require('./pool');
const { seedJobs } = require('./seed');

(async () => {
  try {
    await pool.query('DELETE FROM jobs');
    console.log('Cleared jobs table');
    const r = await seedJobs();
    console.log('Seed result:', r);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
