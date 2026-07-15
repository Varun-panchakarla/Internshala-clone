const axios = require('axios');

const API_BASE = 'https://j0b-api.vercel.app/api/jobs';

const SEARCH_QUERIES = [
  { term: 'software engineer', wanted: 100 },
  { term: 'internship', wanted: 100 },
  { term: 'developer', wanted: 80 },
  { term: 'marketing', wanted: 50 },
  { term: 'sales', wanted: 50 },
  { term: 'data analyst', wanted: 50 },
  { term: 'design', wanted: 50 },
  { term: 'business development', wanted: 50 },
  { term: 'human resources', wanted: 50 },
  { term: 'finance', wanted: 50 },
  { term: 'content writing', wanted: 30 },
  { term: 'product manager', wanted: 30 },
  { term: 'mechanical', wanted: 30 },
  { term: 'civil engineer', wanted: 30 },
  { term: 'electrical engineer', wanted: 30 },
];

const LOGO_COLORS = [
  'bg-red-500', 'bg-indigo-600', 'bg-purple-500', 'bg-rose-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-blue-600', 'bg-orange-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-pink-500', 'bg-lime-600',
];

function pickLogoColor(company) {
  let hash = 0;
  for (let i = 0; i < (company || '').length; i++) {
    hash = ((hash << 5) - hash) + company.charCodeAt(i);
  }
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

function mapJobType(type) {
  if (!type) return 'Full-time';
  const t = type.toLowerCase();
  if (t.includes('intern')) return 'Internship';
  if (t.includes('full')) return 'Full-time';
  if (t.includes('part')) return 'Part-time';
  if (t.includes('contract')) return 'Contract';
  return 'Full-time';
}

function formatSalary(job) {
  if (job.min_amount != null && job.max_amount != null) {
    const fmt = (n) => {
      if (n >= 100000) return `\u20B9${(n / 100000).toFixed(1)}L`;
      return `\u20B9${n.toLocaleString('en-IN')}`;
    };
    return `${fmt(job.min_amount)} - ${fmt(job.max_amount)} / year`;
  }
  return 'Undisclosed';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function extractExperience(desc) {
  if (!desc) return 'Fresher';
  const lower = desc.toLowerCase();

  const matches = lower.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:professional\s+)?(?:exp|experience)/g);
  if (matches) {
    const years = matches.map(m => parseInt(m.match(/(\d+)/)[1]));
    const maxYears = Math.max(...years);
    if (maxYears <= 1) return 'Fresher';
    if (maxYears <= 3) return '1-3 years';
    if (maxYears <= 5) return '3+ years';
    return '5+ years';
  }

  const rangeMatch = lower.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:years?|yrs?)/);
  if (rangeMatch) {
    const max = parseInt(rangeMatch[2]);
    if (max <= 1) return 'Fresher';
    if (max <= 3) return '1-3 years';
    if (max <= 5) return '3+ years';
    return '5+ years';
  }

  if (lower.includes('fresher') || lower.includes('entry level') || lower.includes('0 year') || lower.includes('no experience') || lower.includes('fresh graduate')) {
    return 'Fresher';
  }

  return 'Fresher';
}

function extractSkills(desc) {
  if (!desc) return [];
  const skillsList = [
    'React', 'Angular', 'Vue', 'Node.js', 'Express',
    'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL',
    'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'GCP',
    'Figma', 'CSS', 'Tailwind CSS', 'Bootstrap', 'HTML',
    'Redux', 'GraphQL', 'Git', 'Linux', 'C++',
    'Ruby', 'Go', 'Rust', 'Kubernetes', 'Terraform',
    'Jenkins', 'Jira', 'Tableau', 'Photoshop', 'Illustrator',
    'Excel', 'PowerPoint', 'Word', 'SEO', 'Content Writing',
    'Sales', 'Marketing', 'Communication', 'Leadership', 'Python',
    'Machine Learning', 'Data Analysis', 'AutoCAD', 'SolidWorks',
    'Accounting', 'Finance', 'HR', 'Recruitment', 'Social Media',
  ];
  const lower = desc.toLowerCase();
  return skillsList.filter(skill => lower.includes(skill.toLowerCase()));
}

async function fetchBatch(term, wanted) {
  try {
    const url = `${API_BASE}?site_name=indeed&search_term=${encodeURIComponent(term)}&location=India&country_indeed=India&results_wanted=${wanted}`;
    const res = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    return res.data.jobs || [];
  } catch (err) {
    console.log(`[JobAPI] Failed "${term}": ${err.message}`);
    return [];
  }
}

async function fetchFromJobApi() {
  console.log('[JobAPI] Fetching real Indian jobs from Indeed...');

  let allRaw = [];

  for (const { term, wanted } of SEARCH_QUERIES) {
    const jobs = await fetchBatch(term, wanted);
    if (jobs.length > 0) {
      console.log(`[JobAPI] "${term}": ${jobs.length} jobs`);
      allRaw = allRaw.concat(jobs);
    }
    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`[JobAPI] Raw total: ${allRaw.length}`);

  const seen = new Map();
  const mapped = [];

  for (const job of allRaw) {
    if (!job.title || !job.company || !job.job_url_direct) continue;

    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) continue;
    seen.set(key, true);

    const desc = job.description || '';
    const skills = extractSkills(desc);

    let location = job.location || 'India';
    if (job.is_remote) {
      location = location.includes('Remote') ? location : `${location} (Remote)`;
    }

    mapped.push({
      id: `job-${job.id}`,
      title: job.title,
      company: job.company,
      companyLogo: job.company_logo || '',
      logoColor: pickLogoColor(job.company),
      logoText: job.company.charAt(0).toUpperCase(),
      location,
      salary: formatSalary(job),
      experience: extractExperience(desc),
      employmentType: mapJobType(job.job_type),
      skills: skills.length > 0 ? skills : ['General'],
      description: desc,
      responsibilities: [],
      benefits: [],
      postedAt: formatDate(job.date_posted),
      duration: null,
      matchScore: 0,
      source: 'indeed',
      redirect_url: job.job_url_direct,
    });
  }

  console.log(`[JobAPI] Final unique jobs: ${mapped.length}`);
  return mapped;
}

module.exports = { fetchFromJobApi };
