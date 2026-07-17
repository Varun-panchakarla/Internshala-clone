const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const RESUMES_FILE = path.join(__dirname, '..', 'resumes.json');

// Helper to read resumes
const getResumes = () => {
  if (!fs.existsSync(RESUMES_FILE)) {
    return {};
  }
  const data = fs.readFileSync(RESUMES_FILE, 'utf-8');
  return data ? JSON.parse(data) : {};
};

// Helper to write resumes
const saveResumes = (resumes) => {
  fs.writeFileSync(RESUMES_FILE, JSON.stringify(resumes, null, 2), 'utf-8');
};

const getDefaultTemplate = (name, email) => ({
  personalInfo: {
    fullName: name || '',
    email: email || '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    dob: '',
    gender: '',
    website: '',
    summary: '',
    photo: ''
  },
  education: [], // Items will have type: '10th', '12th', or 'graduation'
  experience: [],
  internship: [],
  projects: [],
  certifications: [],
  skills: [],
  achievements: [],
  languages: [],
  interests: []
});

// GET /api/resume?userId=123&name=John&email=john@example.com
router.get('/', (req, res) => {
  const { userId, name, email } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const resumes = getResumes();
  let userResume = resumes[userId];
  const defaultTpl = getDefaultTemplate(name, email);

  if (!userResume) {
    userResume = defaultTpl;
    resumes[userId] = userResume;
    saveResumes(resumes);
  } else {
    // Migrate old resumes to have new fields
    let updated = false;
    if (!userResume.achievements) { userResume.achievements = []; updated = true; }
    if (!userResume.languages) { userResume.languages = []; updated = true; }
    if (!userResume.interests) { userResume.interests = []; updated = true; }
    if (!userResume.personalInfo) { userResume.personalInfo = {}; updated = true; }
    if (!userResume.personalInfo.photo && userResume.personalInfo.photo !== '') { userResume.personalInfo.photo = ''; updated = true; }
    if (!userResume.personalInfo.dob && userResume.personalInfo.dob !== '') { userResume.personalInfo.dob = ''; updated = true; }
    if (!userResume.personalInfo.gender && userResume.personalInfo.gender !== '') { userResume.personalInfo.gender = ''; updated = true; }
    if (!userResume.personalInfo.portfolio && userResume.personalInfo.portfolio !== '') { userResume.personalInfo.portfolio = ''; updated = true; }
    
    // Convert old education array objects to explicitly have a type if missing
    if (userResume.education && userResume.education.length > 0) {
      userResume.education = userResume.education.map(edu => {
        if (!edu.type) {
          updated = true;
          return { ...edu, type: 'graduation' }; // default old entries to graduation
        }
        return edu;
      });
    }

    if (updated) {
      resumes[userId] = userResume;
      saveResumes(resumes);
    }
  }

  res.json({ data: userResume });
});

// POST /api/resume
router.post('/', (req, res) => {
  const { userId, resumeData } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (!resumeData) {
    return res.status(400).json({ error: 'resumeData is required' });
  }

  const resumes = getResumes();
  resumes[userId] = resumeData;
  saveResumes(resumes);

  res.json({ data: resumeData });
});

module.exports = router;
