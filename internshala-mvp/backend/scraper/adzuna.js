const axios = require('axios');

const APP_ID = 'bc23f928';
const APP_KEY = '9e0a97eba76a5d610c3a5995b40cfe15';

const SEARCH_TERMS = [
  'software engineer', 'internship', 'developer',
  'marketing', 'sales', 'data analyst', 'design',
  'business development', 'human resources', 'finance',
  'content writing', 'product manager', 'mechanical engineer',
  'civil engineer', 'electrical engineer',
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

function mapEmploymentType(contractTime, contractType, title) {
  const titleLower = (title || '').toLowerCase();
  if (titleLower.includes('intern') || titleLower.includes('apprentice') || titleLower.includes('trainee')) {
    return 'Internship';
  }
  const t = (contractTime || '').toLowerCase();
  if (t.includes('part')) return 'Part-time';
  if (contractType === 'contract') return 'Contract';
  if (t.includes('contract')) return 'Contract';
  if (t.includes('intern')) return 'Internship';
  return 'Full-time';
}

function formatSalary(job) {
  if (job.salary_min != null && job.salary_max != null) {
    const fmt = (n) => {
      if (n >= 100000) return `\u20B9${(n / 100000).toFixed(1)}L`;
      return `\u20B9${n.toLocaleString('en-IN')}`;
    };
    return `${fmt(job.salary_min)} - ${fmt(job.salary_max)} / year`;
  }
  if (job.salary_min != null) {
    return `\u20B9${job.salary_min.toLocaleString('en-IN')} / year`;
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
    'Sales', 'Marketing', 'Communication', 'Leadership',
    'Machine Learning', 'Data Analysis', 'AutoCAD', 'SolidWorks',
    'Accounting', 'Finance', 'HR', 'Recruitment', 'Social Media',
  ];
  const lower = desc.toLowerCase();
  return skillsList.filter(skill => lower.includes(skill.toLowerCase()));
}

async function fetchPage(term, page = 1) {
  try {
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&what=${encodeURIComponent(term)}&results_per_page=50`;
    const res = await axios.get(url, {
      timeout: 30000,
      headers: { Accept: 'application/json' },
    });
    return res.data.results || [];
  } catch (err) {
    console.log(`[Adzuna] Failed "${term}" page ${page}: ${err.message}`);
    return [];
  }
}

async function fetchFromAdzuna() {
  console.log('[Adzuna] Fetching real Indian jobs...');

  let allRaw = [];

  for (const term of SEARCH_TERMS) {
    const jobs = await fetchPage(term, 1);
    if (jobs.length > 0) {
      console.log(`[Adzuna] "${term}": ${jobs.length} jobs`);
      allRaw = allRaw.concat(jobs);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`[Adzuna] Raw total: ${allRaw.length}`);

  const seen = new Map();
  const mapped = [];

  for (const job of allRaw) {
    if (!job.title || !job.company || !job.company.display_name || !job.redirect_url) continue;

    const key = `${job.title.toLowerCase().trim()}|${job.company.display_name.toLowerCase().trim()}`;
    if (seen.has(key)) continue;
    seen.set(key, true);

    const desc = job.description || '';
    const skills = extractSkills(desc);
    const companyName = job.company.display_name;
    const location = job.location?.display_name || 'India';

    mapped.push({
      id: `adz-${job.id}`,
      title: job.title,
      company: companyName,
      companyLogo: '',
      logoColor: pickLogoColor(companyName),
      logoText: companyName.charAt(0).toUpperCase(),
      location,
      salary: formatSalary(job),
      experience: extractExperience(desc),
      employmentType: mapEmploymentType(job.contract_time, job.contract_type, job.title),
      skills: skills.length > 0 ? skills : ['General'],
      description: desc,
      responsibilities: [],
      benefits: [],
      postedAt: formatDate(job.created),
      duration: null,
      matchScore: 0,
      source: 'adzuna',
      redirect_url: job.redirect_url,
    });
  }

  console.log(`[Adzuna] Final unique jobs: ${mapped.length}`);
  return mapped;
}

module.exports = { fetchFromAdzuna };
