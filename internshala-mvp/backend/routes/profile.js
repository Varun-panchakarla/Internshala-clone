const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

const VALID_EXPERIENCE = ['Fresher', '1-3 years', '3+ years', '5+ years'];
const VALID_EMPLOYMENT = ['Full-time', 'Part-time', 'Internship', 'Contract'];

function parseStringArray(val) {
  if (Array.isArray(val)) return val.filter(s => typeof s === 'string').map(s => s.trim()).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

// GET /api/profile — fetch authenticated user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.json({ profile: null });
    }

    res.json({ profile: mapProfile(result.rows[0]) });
  } catch (err) {
    console.error('[Profile] Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /api/profile — create or update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName, profilePhoto, college, degree,
      skills, experience, preferredRole,
      preferredLocation, employmentType, resumeInfo,
      contactNumber, currentCity, gender, languages,
      currentStatus, course, stream, startYear, endYear,
      interests, lookingFor, workModes,
    } = req.body;

    const cleanName = typeof fullName === 'string' ? fullName.trim().slice(0, 255) : '';
    if (!cleanName) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    const cleanExperience = VALID_EXPERIENCE.includes(experience) ? experience : 'Fresher';
    const cleanEmployment = VALID_EMPLOYMENT.includes(employmentType) ? employmentType : 'Full-time';

    const skillsArray = parseStringArray(skills);
    const languagesArray = parseStringArray(languages);
    const interestsArray = parseStringArray(interests);
    const lookingForArray = parseStringArray(lookingFor);
    const workModesArray = parseStringArray(workModes);

    const result = await pool.query(
      `INSERT INTO profiles (
        user_id, full_name, profile_photo, college, degree,
        skills, experience, preferred_role, preferred_location,
        employment_type, resume_info, updated_at,
        contact_number, current_city, gender, languages,
        current_status, course, stream, start_year, end_year,
        interests, looking_for, work_modes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        profile_photo = COALESCE(EXCLUDED.profile_photo, profiles.profile_photo),
        college = EXCLUDED.college,
        degree = EXCLUDED.degree,
        skills = EXCLUDED.skills,
        experience = EXCLUDED.experience,
        preferred_role = EXCLUDED.preferred_role,
        preferred_location = EXCLUDED.preferred_location,
        employment_type = EXCLUDED.employment_type,
        resume_info = COALESCE(EXCLUDED.resume_info, profiles.resume_info),
        updated_at = NOW(),
        contact_number = EXCLUDED.contact_number,
        current_city = EXCLUDED.current_city,
        gender = EXCLUDED.gender,
        languages = EXCLUDED.languages,
        current_status = EXCLUDED.current_status,
        course = EXCLUDED.course,
        stream = EXCLUDED.stream,
        start_year = EXCLUDED.start_year,
        end_year = EXCLUDED.end_year,
        interests = EXCLUDED.interests,
        looking_for = EXCLUDED.looking_for,
        work_modes = EXCLUDED.work_modes
      RETURNING *`,
      [
        userId, cleanName, profilePhoto !== undefined ? profilePhoto : null,
        college?.trim() || null, degree?.trim() || null,
        skillsArray, cleanExperience,
        preferredRole?.trim() || null, preferredLocation?.trim() || null,
        cleanEmployment, resumeInfo ? JSON.stringify(resumeInfo) : null,
        contactNumber?.trim() || null, currentCity?.trim() || null,
        gender?.trim() || null, languagesArray,
        currentStatus?.trim() || null, course?.trim() || null,
        stream?.trim() || null, startYear?.trim() || null,
        endYear?.trim() || null, interestsArray,
        lookingForArray, workModesArray,
      ]
    );

    res.json({ profile: mapProfile(result.rows[0]) });
  } catch (err) {
    console.error('[Profile] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

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
  };
}

module.exports = router;
