const { createJobEntry, pickRandom, FAKE_NAMES, LOGO_COLORS } = require('./utils.js');

function seedJobs() {
  const jobs = [];

  const listings = [
    { title: 'Frontend Engineer Intern', company: 'Google', location: 'Bangalore, India', salary: '₹50,000 / month', type: 'Internship', exp: 'Fresher', skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'], duration: '3 Months', desc: 'Join Google\'s Frontend team to build accessible, beautiful, and high-performance interfaces.' },
    { title: 'React Developer', company: 'Stripe', location: 'Remote', salary: '₹15,00,000 - ₹22,00,000 / year', type: 'Full-time', exp: '1-3 years', skills: ['React', 'Tailwind CSS', 'JavaScript', 'Redux', 'GraphQL'], duration: null, desc: 'Stripe is looking for a React Developer to join our dashboard team.' },
    { title: 'UI/UX Developer', company: 'Canva', location: 'Mumbai, India', salary: '₹8,00,000 - ₹12,00,000 / year', type: 'Full-time', exp: '1-3 years', skills: ['Figma', 'CSS', 'React', 'Tailwind CSS'], duration: null, desc: 'At Canva, we empower everyone to design.' },
    { title: 'Full Stack Developer', company: 'Airbnb', location: 'Gurgaon, India', salary: '₹18,00,000 - ₹26,00,000 / year', type: 'Full-time', exp: '3+ years', skills: ['React', 'Node.js', 'Express', 'MongoDB'], duration: null, desc: 'Airbnb is redefining travel.' },
    { title: 'Software Engineering Intern', company: 'Slack', location: 'Pune, India', salary: '₹35,000 / month', type: 'Internship', exp: 'Fresher', skills: ['JavaScript', 'React', 'Node.js', 'Git'], duration: '3 Months', desc: 'Join Slack\'s Core Workflow team.' },
    { title: 'Mobile App Developer (React Native)', company: 'Spotify', location: 'Remote', salary: '₹20,00,000 - ₹30,00,000 / year', type: 'Full-time', exp: '3+ years', skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux'], duration: null, desc: 'Spotify wants an expert Mobile App Developer.' },
    { title: 'Backend Engineering Intern', company: 'Netflix', location: 'Remote', salary: '₹60,000 / month', type: 'Internship', exp: 'Fresher', skills: ['Node.js', 'Python', 'SQL', 'Git', 'Docker'], duration: '6 Months', desc: 'Netflix is seeking a Backend Engineering Intern.' },
    { title: 'Frontend Architect', company: 'Meta', location: 'Hyderabad, India', salary: '₹45,00,000 - ₹60,00,000 / year', type: 'Full-time', exp: '5+ years', skills: ['React', 'TypeScript', 'GraphQL', 'Web Performance', 'System Design'], duration: null, desc: 'Meta is looking for a Frontend Architect.' },
    { title: 'Part-Time Web Developer', company: 'Local Startup Incubator', location: 'Chennai, India', salary: '₹20,000 / month', type: 'Part-time', exp: 'Fresher', skills: ['React', 'CSS', 'WordPress', 'JavaScript'], duration: null, desc: 'Looking for a flexible part-time developer.' },
    { title: 'UI Developer Contract', company: 'Figma', location: 'Remote', salary: '₹1,50,000 / month', type: 'Contract', exp: '3+ years', skills: ['React', 'TypeScript', 'CSS', 'Tailwind CSS'], duration: null, desc: 'Figma is looking for a UI Developer on contract.' },
    { title: 'Business Development (Sales)', company: 'The Spryte Platform', location: 'Bangalore', salary: '₹ 12,000 - 15,000 /month', type: 'Internship', exp: 'Fresher', skills: ['Sales', 'Communication', 'Negotiation'], duration: '2 Months', desc: 'Drive business growth through strategic sales initiatives.' },
    { title: 'Talent Acquisition', company: 'Purplle', location: 'Mumbai', salary: '₹ 20,000 - 25,000 /month', type: 'Internship', exp: 'Fresher', skills: ['HR', 'Recruitment', 'Communication'], duration: '6 Months', desc: 'Help build teams at India\'s fastest growing beauty platform.' },
    { title: 'Human Resources (HR)', company: 'JSW Severfield Structures', location: 'Mumbai', salary: '₹ 5,000 /month', type: 'Internship', exp: 'Fresher', skills: ['HR', 'Excel', 'Communication'], duration: '3 Months', desc: 'HR intern role at leading infrastructure company.' },
    { title: 'Inside Sales', company: 'The Muthoot Group', location: 'Bangalore', salary: '₹ 12,300 - 14,000 /month', type: 'Internship', exp: 'Fresher', skills: ['Sales', 'Cold Calling', 'CRM'], duration: '6 Months', desc: 'Inside sales opportunity at India\'s largest gold loan NBFC.' },
    { title: 'Mechanical Engineering', company: 'Spacewood Furnishers', location: 'Nagpur', salary: '₹ 16,500 - 20,500 /month', type: 'Internship', exp: 'Fresher', skills: ['AutoCAD', 'Mechanical Design', 'Manufacturing'], duration: '1 Month', desc: 'Hands-on internship in furniture manufacturing.' },
    { title: 'Founders Office', company: 'Gulshan Sharma', location: 'Gurgaon', salary: '₹ 5,000 - 15,000 /month', type: 'Internship', exp: 'Fresher', skills: ['Strategy', 'Operations', 'Analytics'], duration: '4 Months', desc: 'Work directly with the founder on business strategy.' },
    { title: 'Video Editing/Making', company: 'Zypp Electric', location: 'Gurgaon', salary: '₹ 3,000 - 5,000 /month', type: 'Internship', exp: 'Fresher', skills: ['Premiere Pro', 'After Effects', 'Creative'], duration: '3 Months', desc: 'Create compelling video content for India\'s leading EV company.' },
    { title: 'Data Analyst', company: 'Myntra', location: 'Bangalore', salary: '₹12,00,000 - ₹18,00,000 /year', type: 'Full-time', exp: '1-3 years', skills: ['SQL', 'Python', 'Tableau', 'Excel'], duration: null, desc: 'Drive data-informed decisions for India\'s fashion e-commerce leader.' },
    { title: 'Product Manager', company: 'PhonePe', location: 'Bangalore', salary: '₹20,00,000 - ₹30,00,000 /year', type: 'Full-time', exp: '3+ years', skills: ['Product Strategy', 'Analytics', 'User Research'], duration: null, desc: 'Shape the future of digital payments in India.' },
    { title: 'Graphic Design Intern', company: 'Zomato', location: 'Gurgaon', salary: '₹ 15,000 /month', type: 'Internship', exp: 'Fresher', skills: ['Figma', 'Adobe Illustrator', 'Photoshop'], duration: '3 Months', desc: 'Design mouth-watering visuals for India\'s food tech leader.' },
    { title: 'Content Writing Intern', company: 'ShareChat', location: 'Remote', salary: '₹ 10,000 /month', type: 'Internship', exp: 'Fresher', skills: ['Content Writing', 'SEO', 'Creative Writing'], duration: '2 Months', desc: 'Write engaging content for India\'s homegrown social media platform.' },
    { title: 'Social Media Manager', company: 'CRED', location: 'Bangalore', salary: '₹10,00,000 - ₹15,00,000 /year', type: 'Full-time', exp: '2-4 years', skills: ['Social Media', 'Content Strategy', 'Analytics'], duration: null, desc: 'Manage brand presence for India\'s most loved fintech.' },
  ];

  listings.forEach((l) => {
    jobs.push(createJobEntry({
      title: l.title,
      company: l.company,
      location: l.location,
      salary: l.salary,
      duration: l.duration,
      employmentType: l.type,
      experience: l.exp,
      skills: l.skills,
      description: l.desc,
      postedAt: pickRandom(['Today', '1 day ago', '2 days ago', '3 days ago', 'Just now', '1 week ago']),
      source: l.company,
      responsibilities: [
        'Work collaboratively with the team on assigned projects',
        'Meet deadlines and deliver quality output',
        'Participate in team meetings and contribute ideas'
      ],
      benefits: [
        'Certificate of experience',
        'Flexible working hours',
        'Exposure to industry best practices',
        'Performance bonus potential'
      ]
    }));
  });

  return jobs;
}

module.exports = seedJobs;
