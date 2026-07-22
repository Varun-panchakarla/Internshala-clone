const axios = require('axios');

const ADZUNA_APP_ID = 'bc23f928';
const ADZUNA_APP_KEY = '9e0a97eba76a5d610c3a5995b40cfe15';
const INDEED_API = 'https://j0b-api.vercel.app/api/jobs';

const TARGET_COMPANIES = new Set([
  'tcs', 'accenture', 'capgemini', 'cognizant', 'infosys',
  'wipro', 'hcl', 'tech mahindra', 'ibm', 'deloitte'
]);

const MNC_COMPANIES = [
  { name: 'TCS', adzunaSlug: 'tcs', indeedTerms: ['tcs', 'tata consultancy services'] },
  { name: 'Accenture', adzunaSlug: 'accenture', indeedTerms: ['accenture'] },
  { name: 'Capgemini', adzunaSlug: 'capgemini', indeedTerms: ['capgemini'] },
  { name: 'Cognizant', adzunaSlug: 'cognizant', indeedTerms: ['cognizant'] },
  { name: 'Infosys', adzunaSlug: 'infosys', indeedTerms: ['infosys'] },
  { name: 'Wipro', adzunaSlug: 'wipro', indeedTerms: ['wipro'] },
  { name: 'HCL', adzunaSlug: 'hcl', indeedTerms: ['hcl'] },
  { name: 'Tech Mahindra', adzunaSlug: 'tech-mahindra', indeedTerms: ['tech mahindra'] },
  { name: 'IBM', adzunaSlug: 'ibm', indeedTerms: ['ibm'] },
  { name: 'Deloitte', adzunaSlug: 'deloitte', indeedTerms: ['deloitte'] },
];

const NAME_NORMALIZE = {
  'tata consultancy services': 'TCS',
  'tata consultancy services (tcs)': 'TCS',
  'tcs': 'TCS',
  'accenture': 'Accenture',
  'capgemini': 'Capgemini',
  'capgemini engineering': 'Capgemini',
  'cognizant': 'Cognizant',
  'cognizant technology solutions': 'Cognizant',
  'infosys': 'Infosys',
  'wipro': 'Wipro',
  'hcl': 'HCL',
  'hcltech': 'HCL',
  'hcl technologies': 'HCL',
  'tech mahindra': 'Tech Mahindra',
  'tech mahindra (formerly mahindra satyam)': 'Tech Mahindra',
  'ibm': 'IBM',
  'deloitte': 'Deloitte',
};

function normalizeCompany(raw) {
  const key = raw.toLowerCase().trim();
  return NAME_NORMALIZE[key] || raw;
}

function isTargetMNC(company) {
  return TARGET_COMPANIES.has(company.toLowerCase().trim());
}

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
  const rangeMatch = lower.match(/(\d+)\s*[–-]\s*(\d+)\s*(?:years?|yrs?)/);
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

async function fetchAdzunaMNC(companySlug) {
  try {
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what=${encodeURIComponent(companySlug)}&results_per_page=30`;
    const res = await axios.get(url, { timeout: 30000, headers: { Accept: 'application/json' } });
    return res.data.results || [];
  } catch (err) {
    return [];
  }
}

async function fetchIndeedMNC(searchTerm) {
  try {
    const url = `${INDEED_API}?site_name=indeed&search_term=${encodeURIComponent(searchTerm + ' India')}&location=India&country_indeed=India&results_wanted=30`;
    const res = await axios.get(url, {
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    return res.data.jobs || [];
  } catch (err) {
    return [];
  }
}

function mapAdzunaJob(job) {
  const companyName = normalizeCompany(job.company?.display_name || '');
  if (!companyName || !isTargetMNC(companyName)) return null;

  const desc = job.description || '';
  const skills = extractSkills(desc);
  const location = job.location?.display_name || 'India';

  let employmentType = 'Full-time';
  const t = (job.contract_time || '').toLowerCase();
  if (t.includes('part')) employmentType = 'Part-time';
  else if (t.includes('contract')) employmentType = 'Contract';

  const titleLower = (job.title || '').toLowerCase();
  if (titleLower.includes('intern') || titleLower.includes('apprentice') || titleLower.includes('trainee')) {
    employmentType = 'Internship';
  }

  return {
    title: job.title,
    company: companyName,
    companyLogo: `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    logoColor: pickLogoColor(companyName),
    logoText: companyName.charAt(0).toUpperCase(),
    location,
    salary: job.salary_min != null ? formatSalary(job) : 'Undisclosed',
    experience: extractExperience(desc),
    employmentType,
    skills: skills.length > 0 ? skills : ['General'],
    description: desc,
    postedAt: formatDate(job.created),
    redirect_url: job.redirect_url,
  };
}

function mapIndeedJob(job) {
  const companyName = normalizeCompany(job.company || '');
  if (!companyName || !isTargetMNC(companyName)) return null;

  const desc = job.description || '';
  const skills = extractSkills(desc);

  let location = job.location || 'India';
  if (job.is_remote) {
    location = location.includes('Remote') ? location : `${location} (Remote)`;
  }

  return {
    title: job.title,
    company: companyName,
    companyLogo: job.company_logo || '',
    logoColor: pickLogoColor(companyName),
    logoText: companyName.charAt(0).toUpperCase(),
    location,
    salary: formatSalary(job),
    experience: extractExperience(desc),
    employmentType: mapJobType(job.job_type),
    skills: skills.length > 0 ? skills : ['General'],
    description: desc,
    postedAt: formatDate(job.date_posted),
    redirect_url: job.job_url_direct,
  };
}

async function fetchMNCJobs() {
  console.log('[MNC] Fetching MNC company jobs...');

  const allMapped = [];
  const seen = new Map();

  function addIfUnique(job) {
    if (!job || !job.title || !job.company || !job.redirect_url) return;
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return;
    seen.set(key, true);

    allMapped.push({
      id: `mnc-${Date.now()}-${allMapped.length}`,
      ...job,
      responsibilities: [],
      benefits: [],
      duration: null,
      matchScore: 0,
      source: 'mnc',
    });
  }

  // All 10 MNCs via Adzuna
  for (const company of MNC_COMPANIES) {
    const raw = await fetchAdzunaMNC(company.adzunaSlug);
    if (raw.length > 0) {
      const valid = raw.map(mapAdzunaJob).filter(Boolean);
      console.log(`[MNC] Adzuna "${company.name}": ${raw.length} raw → ${valid.length} valid`);
      valid.forEach(addIfUnique);
    } else {
      console.log(`[MNC] Adzuna "${company.name}": 0 results`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  // Supplement with Indeed (company-filtered)
  for (const company of MNC_COMPANIES) {
    const indeedResults = [];
    for (const term of company.indeedTerms) {
      const raw = await fetchIndeedMNC(term);
      if (raw.length > 0) {
        indeedResults.push(...raw);
        break;
      }
    }
    if (indeedResults.length > 0) {
      const valid = indeedResults.map(mapIndeedJob).filter(Boolean);
      console.log(`[MNC] Indeed "${company.name}": ${indeedResults.length} raw → ${valid.length} valid`);
      valid.forEach(addIfUnique);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`[MNC] Final unique jobs: ${allMapped.length}`);
  return allMapped;
}

module.exports = { fetchMNCJobs };
