const crypto = require('crypto');
const axios = require('axios');

const LOGO_COLORS = [
  'bg-red-500', 'bg-indigo-600', 'bg-purple-500', 'bg-rose-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-blue-600', 'bg-orange-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-pink-500', 'bg-lime-600'
];

const FAKE_NAMES = [
  'TechCorp', 'InnovateAI', 'DataBridge', 'CloudBase',
  'NextWave', 'PrimeStack', 'ApexLogic', 'Radiant Systems',
  'Pinnacle Labs', 'Stealth Startup'
];

function generateId(title, company, source) {
  return crypto.createHash('md5').update(`${source}|${title}|${company}|${Date.now()}`).digest('hex');
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractSkills(text) {
  const skillsList = [
    'React', 'Angular', 'Vue', 'Node.js', 'Express',
    'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL',
    'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'GCP',
    'Figma', 'CSS', 'Tailwind CSS', 'Bootstrap', 'HTML',
    'Redux', 'GraphQL', 'Git', 'Linux', 'C++',
    'Ruby', 'Go', 'Rust', 'Kubernetes', 'Terraform',
    'Jenkins', 'Jira', 'Framer', 'Mulesoft', 'Tableau'
  ];
  const lower = text.toLowerCase();
  return skillsList.filter(skill => lower.includes(skill.toLowerCase()));
}

function createJobEntry(data) {
  const defaultSkills = data.skills || [];
  const extracted = extractSkills(data.description || '');
  const combined = [...new Set([...defaultSkills, ...extracted])];
  return {
    id: data.id || generateId(data.title, data.company, data.source),
    title: data.title || 'Unknown Title',
    company: data.company || pickRandom(FAKE_NAMES),
    companyLogo: data.companyLogo || '',
    logoColor: data.logoColor || pickRandom(LOGO_COLORS),
    logoText: (data.company || '?').charAt(0).toUpperCase(),
    location: data.location || 'Remote',
    salary: data.salary || 'Undisclosed',
    experience: data.experience || 'Fresher',
    employmentType: data.employmentType || 'Full-time',
    skills: combined.length > 0 ? combined : ['General'],
    description: data.description || '',
    responsibilities: data.responsibilities || [],
    benefits: data.benefits || [],
    postedAt: data.postedAt || 'Just now',
    duration: data.duration || null,
    matchScore: 0,
    source: data.source || 'web'
  };
}

async function fetchWithAxios(url, options = {}) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://www.google.com/',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    ...options.headers
  };

  return axios.get(url, { headers, timeout: 15000, ...options });
}

function generateDescription(job) {
  return `${job.title} at ${job.company}. ${job.description || 'We are looking for a passionate individual to join our team and contribute to exciting projects.'} Learn, innovate, and grow with us.`;
}

module.exports = {
  generateId, pickRandom, extractSkills, createJobEntry,
  FAKE_NAMES, LOGO_COLORS, fetchWithAxios, generateDescription
};
