const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const JOBS_FILE = path.resolve(__dirname, '..', 'jobs.json');

function loadJobs() {
  try {
    const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// GET /api/jobs
router.get('/', (req, res) => {
  const jobs = loadJobs();

  const {
    search, location, experience, employmentType, role, skills, company, salaryRange
  } = req.query;

  let filtered = [...jobs];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  if (location) {
    const l = location.toLowerCase();
    filtered = filtered.filter(j =>
      l === 'remote'
        ? j.location.toLowerCase().includes('remote')
        : j.location.toLowerCase().includes(l) && !j.location.toLowerCase().includes('remote')
    );
  }

  if (experience) {
    const e = experience.toLowerCase();
    filtered = filtered.filter(j => j.experience?.toLowerCase().includes(e));
  }

  if (employmentType) {
    filtered = filtered.filter(j =>
      j.employmentType?.toLowerCase() === employmentType.toLowerCase()
    );
  }

  if (role) {
    const r = role.toLowerCase();
    filtered = filtered.filter(j => j.title.toLowerCase().includes(r));
  }

  if (skills) {
    const skillList = skills.split(',').map(s => s.trim().toLowerCase());
    filtered = filtered.filter(j =>
      skillList.every(s => j.skills.map(x => x.toLowerCase()).includes(s))
    );
  }

  if (company) {
    const c = company.toLowerCase();
    filtered = filtered.filter(j => j.company?.toLowerCase().includes(c));
  }

  if (salaryRange) {
    filtered = filtered.filter(j => {
      if (!j.salary || j.salary === 'Undisclosed') return false;
      const nums = [...j.salary.matchAll(/₹?(\d+\.?\d*)L/g)].map(m => parseFloat(m[1]));
      if (nums.length === 0) return false;
      const avg = (nums[0] + (nums[1] || nums[0])) / 2;
      switch (salaryRange) {
        case 'below-3': return avg < 3;
        case '3-6': return avg >= 3 && avg <= 6;
        case '6-12': return avg > 6 && avg <= 12;
        case 'above-12': return avg > 12;
        default: return true;
      }
    });
  }

  res.json({ data: filtered, total: filtered.length });
});

// GET /api/jobs/:id
router.get('/:id', (req, res) => {
  const jobs = loadJobs();
  const job = jobs.find(j => j.id === req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({ data: job });
});

module.exports = router;
