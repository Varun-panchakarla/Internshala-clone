const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

function mapProfile(row) {
  if (!row) return {};
  return {
    fullName: row.full_name || '',
    profilePhoto: row.profile_photo || '',
    college: row.college || '',
    degree: row.degree || '',
    skills: row.skills || [],
    experience: row.experience || 'Fresher',
    preferredRole: row.preferred_role || '',
    preferredLocation: row.preferred_location || '',
    employmentType: row.employment_type || 'Full-time',
    resumeInfo: row.resume_info || null,
    contactNumber: row.contact_number || '',
    currentCity: row.current_city || '',
    gender: row.gender || '',
    languages: row.languages || [],
    currentStatus: row.current_status || '',
    course: row.course || '',
    stream: row.stream || '',
    startYear: row.start_year || '',
    endYear: row.end_year || '',
    interests: row.interests || [],
    lookingFor: row.looking_for || [],
    workModes: row.work_modes || [],
    phoneVerified: row.phone_verified || false,
  };
}

module.exports = router;
