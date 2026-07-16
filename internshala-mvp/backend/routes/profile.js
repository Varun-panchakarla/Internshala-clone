const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('./auth');

const router = express.Router();

const VALID_EXPERIENCE = ['Fresher', '1-3 years', '3+ years', '5+ years'];
const VALID_EMPLOYMENT = ['Full-time', 'Part-time', 'Internship', 'Contract'];

// PUT /api/profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName, profilePhoto, college, degree,
      skills, experience, preferredRole,
      preferredLocation, employmentType, resumeInfo,
    } = req.body;

    const cleanName = typeof fullName === 'string' ? fullName.trim().slice(0, 255) : '';
    if (!cleanName) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    const cleanExperience = VALID_EXPERIENCE.includes(experience) ? experience : 'Fresher';
    const cleanEmployment = VALID_EMPLOYMENT.includes(employmentType) ? employmentType : 'Full-time';

    const skillsArray = Array.isArray(skills)
      ? skills.filter(s => typeof s === 'string').map(s => s.trim()).filter(Boolean)
      : [];

    const result = await pool.query(
      `INSERT INTO profiles (
        user_id, full_name, profile_photo, college, degree,
        skills, experience, preferred_role, preferred_location,
        employment_type, resume_info, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        profile_photo = EXCLUDED.profile_photo,
        college = EXCLUDED.college,
        degree = EXCLUDED.degree,
        skills = EXCLUDED.skills,
        experience = EXCLUDED.experience,
        preferred_role = EXCLUDED.preferred_role,
        preferred_location = EXCLUDED.preferred_location,
        employment_type = EXCLUDED.employment_type,
        resume_info = COALESCE(EXCLUDED.resume_info, profiles.resume_info),
        updated_at = NOW()
      RETURNING *`,
      [
        userId, cleanName, profilePhoto || null, college?.trim() || null,
        degree?.trim() || null, skillsArray, cleanExperience,
        preferredRole?.trim() || null, preferredLocation?.trim() || null,
        cleanEmployment, resumeInfo ? JSON.stringify(resumeInfo) : null,
      ]
    );

    const profile = result.rows[0];

    res.json({
      profile: {
        fullName: profile.full_name,
        profilePhoto: profile.profile_photo || '',
        college: profile.college || '',
        degree: profile.degree || '',
        skills: profile.skills || [],
        experience: profile.experience || 'Fresher',
        preferredRole: profile.preferred_role || '',
        preferredLocation: profile.preferred_location || '',
        employmentType: profile.employment_type || 'Full-time',
        resumeInfo: profile.resume_info || null,
      },
    });
  } catch (err) {
    console.error('[Profile] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
