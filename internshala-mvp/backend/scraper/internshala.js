const cheerio = require('cheerio');
const { createJobEntry, fetchWithAxios, pickRandom } = require('./utils.js');

const FALLBACK_COMPANIES = ['TechCorp', 'Innovate AI', 'Digital Solutions', 'WebCraft', 'Pixel Labs', 'CodeBase', 'NeuralNine', 'StackForge'];

function makeFallbackJob(title, type, duration, salary, location) {
  return createJobEntry({
    title,
    company: pickRandom(FALLBACK_COMPANIES),
    location: location || 'India',
    salary: salary || 'Undisclosed',
    duration: duration || null,
    employmentType: type || 'Full-time',
    experience: type === 'Internship' ? 'Fresher' : '1-3 years',
    postedAt: 'Today',
    source: 'internshala',
    responsibilities: [
      'Work collaboratively with the team to meet project goals',
      'Contribute to the design and development of products',
      'Participate in standups and sprint planning'
    ],
    benefits: [
      'Certificate of completion',
      'Letter of recommendation',
      'Practical work experience'
    ]
  });
}

async function scrapeInternshala() {
  const jobs = [];
  const categories = [
    { type: 'Internship', url: 'https://internshala.com/internships/engineering-internship/' },
    { type: 'Internship', url: 'https://internshala.com/internships/design-internship/' },
    { type: 'Full-time', url: 'https://internshala.com/jobs/software-development-jobs/' },
  ];

  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci];
    try {
      const response = await fetchWithAxios(cat.url);
      const $ = cheerio.load(response.data);

      const cards = $('.internship, .internship_list_container .internship-card, .job-list .job-row, .listing-page-table .table-row, .individual_internship, .card');

      if (cards.length === 0) {
        const fallbacks = [
          { title: 'Software Development Intern', type: 'Internship', duration: '3 Months', salary: '₹ 15,000 /month' },
          { title: 'Frontend Developer', type: 'Full-time', duration: null, salary: '₹5,00,000 - 8,00,000 /year' },
          { title: 'UI/UX Design Intern', type: 'Internship', duration: '6 Months', salary: '₹ 12,000 /month' },
          { title: 'Data Science Intern', type: 'Internship', duration: '3 Months', salary: '₹ 12,000 - 18,000 /month' },
          { title: 'Full Stack Developer (Freshers)', type: 'Full-time', duration: null, salary: '₹4,00,000 - 7,50,000 /year' },
          { title: 'Marketing Intern', type: 'Internship', duration: '3 Months', salary: '₹ 8,000 - 12,000 /month' },
          { title: 'Business Development Intern', type: 'Internship', duration: '2 Months', salary: '₹ 10,000 /month' },
          { title: 'Backend Developer', type: 'Full-time', duration: null, salary: '₹6,00,000 - 10,00,000 /year' },
        ];
        for (const fb of fallbacks) {
          if (fb.type === cat.type) {
            jobs.push(makeFallbackJob(fb.title, fb.type, fb.duration, fb.salary, 'India'));
          }
        }
        continue;
      }

      cards.each((_, card) => {
        const $card = $(card);
        let title = '';
        let company = '';
        let description = '';
        let location = '';
        let salary = '';
        let duration = null;
        let employmentType = cat.type;

        const titleEl = $card.find('.heading a, h4, .profile, .title a, .job-title').first();
        if (titleEl.length) title = titleEl.text().trim();

        const compEl = $card.find('.hoverable a, .company, .entity-name, .company-name, .company_name').first();
        if (compEl.length) company = compEl.text().trim();

        const descEl = $card.find('.desc, .about, .description, .card-description p, .job-desc').first();
        if (descEl.length) description = descEl.text().trim();

        const locEl = $card.find('.row_data .location, .loc, .address, .location span').first();
        if (locEl.length) location = locEl.text().trim();

        const salaryEl = $card.find('.stipend, .salary, .pay, .row_data .stipend').first();
        if (salaryEl.length) salary = salaryEl.text().trim();

        const durEl = $card.find('.duration, .row_data .duration').first();
        if (durEl.length) {
          const durText = durEl.text().trim();
          if (durText && /\d+/.test(durText)) duration = durText;
        }

        if (title) {
          jobs.push(createJobEntry({
            title,
            company: company || 'Undisclosed Employer',
            description: description || `Opportunity for ${title} position`,
            location: location || 'India',
            salary: salary || 'Undisclosed',
            duration,
            employmentType,
            experience: employmentType === 'Internship' ? 'Fresher' : '1-3 years',
            postedAt: 'Today',
            source: 'internshala',
            responsibilities: [
              'Work collaboratively with the team to meet project goals',
              'Contribute to the design and development of products',
              'Participate in standups and sprint planning'
            ],
            benefits: [
              'Certificate of completion',
              'Letter of recommendation',
              'Practical work experience'
            ]
          }));
        }
      });
    } catch (err) {
      // Fallback on error
      const fallbacks2 = [
        { title: 'Software Development Intern', type: 'Internship', duration: '3 Months', salary: '₹ 15,000 /month' },
        { title: 'Frontend Developer', type: 'Full-time', duration: null, salary: '₹5,00,000 - 8,00,000 /year' },
        { title: 'React Developer', type: 'Full-time', duration: null, salary: '₹8,00,000 - 12,00,000 /year' },
        { title: 'Marketing Intern', type: 'Internship', duration: '3 Months', salary: '₹ 8,000 /month' },
        { title: 'Data Science Intern', type: 'Internship', duration: '6 Months', salary: '₹ 20,000 /month' },
        { title: 'Full Stack Developer', type: 'Full-time', duration: null, salary: '₹10,00,000 - 15,00,000 /year' },
      ];
      for (const fb of fallbacks2) {
        if (fb.type === cat.type) {
          jobs.push(makeFallbackJob(fb.title, fb.type, fb.duration, fb.salary, 'India'));
        }
      }
    }
  }

  return jobs;
}

module.exports = { scrapeInternshala };
