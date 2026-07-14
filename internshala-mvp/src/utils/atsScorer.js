/**
 * Utility to calculate ATS score and generate recommendations.
 * Evaluates: Contact Details, Summary, Education, Skills,
 *            Professional Experience, Internship, Projects, Certifications,
 *            LinkedIn, GitHub, Action Verbs.
 * Total: 100 points
 */
export const calculateAtsScore = (resume) => {
  if (!resume) return { score: 0, suggestions: [], breakdown: {} };

  let score = 0;
  const suggestions = [];
  const breakdown = {
    contactDetails: 0,
    professionalSummary: 0,
    education: 0,
    skills: 0,
    experience: 0,
    internship: 0,
    projects: 0,
    certifications: 0,
  };

  const { personalInfo = {}, education = [], experience = [], internship = [], projects = [], certifications = [], skills = [] } = resume;

  // ─── 1. Contact Details (15 pts) ────────────────────────────────────────────
  let contactScore = 0;
  if (personalInfo.fullName && personalInfo.fullName.trim().length > 2)  contactScore += 3;
  if (personalInfo.email    && personalInfo.email.includes('@'))          contactScore += 3;
  if (personalInfo.phone    && personalInfo.phone.trim().length > 6)      contactScore += 3;
  if (personalInfo.location && personalInfo.location.trim().length > 2)   contactScore += 2;
  if (personalInfo.linkedin && personalInfo.linkedin.trim().length > 4)   contactScore += 2;
  if (personalInfo.github   && personalInfo.github.trim().length > 4)     contactScore += 2;

  breakdown.contactDetails = contactScore;

  if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phone) {
    suggestions.push({
      id: 'contact-missing',
      category: 'Contact Details',
      message: 'Fill in your full name, email, and phone number so recruiters can contact you.',
      impact: 'Critical',
    });
  }
  if (!personalInfo.linkedin) {
    suggestions.push({
      id: 'linkedin-missing',
      category: 'Contact Details',
      message: 'Add your LinkedIn profile URL — recruiters check it 90% of the time.',
      impact: 'High',
    });
  }
  if (!personalInfo.github) {
    suggestions.push({
      id: 'github-missing',
      category: 'Contact Details',
      message: 'Add your GitHub profile URL to showcase your code and projects.',
      impact: 'High',
    });
  }

  score += contactScore;

  // ─── 2. Professional Summary (10 pts) ────────────────────────────────────────
  if (personalInfo.summary && personalInfo.summary.trim().split(/\s+/).length >= 20) {
    breakdown.professionalSummary = 10;
  } else if (personalInfo.summary && personalInfo.summary.trim().length > 0) {
    breakdown.professionalSummary = 5;
    suggestions.push({
      id: 'summary-short',
      category: 'Professional Summary',
      message: 'Expand your summary to at least 20 words describing your expertise, values, and career goals.',
      impact: 'Medium',
    });
  } else {
    breakdown.professionalSummary = 0;
    suggestions.push({
      id: 'summary-missing',
      category: 'Professional Summary',
      message: 'Add a professional summary of 20–50 words. ATS parsers weigh this section heavily.',
      impact: 'High',
    });
  }
  score += breakdown.professionalSummary;

  // ─── 3. Education (15 pts) ────────────────────────────────────────────────
  if (education.length > 0) {
    const validEdu = education.filter(e => e.institution && e.degree);
    if (validEdu.length > 0) {
      breakdown.education = 15;
    } else {
      breakdown.education = 7;
      suggestions.push({
        id: 'education-incomplete',
        category: 'Education',
        message: 'Complete the college name and degree fields for your education entries.',
        impact: 'High',
      });
    }
  } else {
    breakdown.education = 0;
    suggestions.push({
      id: 'education-missing',
      category: 'Education',
      message: 'Add at least one education entry (college/university and degree).',
      impact: 'High',
    });
  }
  score += breakdown.education;

  // ─── 4. Skills (15 pts) ────────────────────────────────────────────────────
  if (skills.length > 0) {
    const uniqueSkills = [...new Set(skills.filter(s => s.trim().length > 0))];
    breakdown.skills = Math.min(15, uniqueSkills.length * 1.875); // 8 skills = full marks
    if (uniqueSkills.length < 5) {
      suggestions.push({
        id: 'skills-count',
        category: 'Skills',
        message: `Add at least 5 technical skills (you have ${uniqueSkills.length}). ATS filters match on keywords.`,
        impact: 'High',
      });
    } else if (uniqueSkills.length < 8) {
      suggestions.push({
        id: 'skills-more',
        category: 'Skills',
        message: `Adding a few more skills (currently ${uniqueSkills.length}) will improve keyword matching.`,
        impact: 'Medium',
      });
    }
  } else {
    breakdown.skills = 0;
    suggestions.push({
      id: 'skills-missing',
      category: 'Skills',
      message: 'Add key technical skills. Recruiters search resumes by specific skill keywords.',
      impact: 'Critical',
    });
  }
  score += breakdown.skills;

  // ─── 5. Professional Experience (15 pts) ─────────────────────────────────
  if (experience.length > 0) {
    const detailed = experience.filter(e => e.description && e.description.trim().split(/\s+/).length >= 15);
    if (detailed.length === experience.length) {
      breakdown.experience = 15;
    } else if (experience.some(e => e.role && e.company)) {
      breakdown.experience = 10;
      suggestions.push({
        id: 'experience-detail',
        category: 'Professional Experience',
        message: 'Use action verbs (Developed, Led, Optimized) and write 15+ words per role description.',
        impact: 'Medium',
      });
    } else {
      breakdown.experience = 5;
      suggestions.push({
        id: 'experience-incomplete',
        category: 'Professional Experience',
        message: 'Fill in company name and role title for all experience entries.',
        impact: 'High',
      });
    }
  } else {
    breakdown.experience = 0;
    suggestions.push({
      id: 'experience-missing',
      category: 'Professional Experience',
      message: 'Add professional work experience. Even part-time or freelance work counts.',
      impact: 'Critical',
    });
  }
  score += breakdown.experience;

  // ─── 6. Internship (10 pts) ────────────────────────────────────────────────
  if (internship.length > 0) {
    const validIntern = internship.filter(i => i.company && i.role);
    if (validIntern.length > 0) {
      breakdown.internship = 10;
    } else {
      breakdown.internship = 5;
      suggestions.push({
        id: 'internship-incomplete',
        category: 'Internship',
        message: 'Complete the company name and role for your internship entries.',
        impact: 'Medium',
      });
    }
  } else {
    breakdown.internship = 0;
    suggestions.push({
      id: 'internship-missing',
      category: 'Internship',
      message: 'Add internship experience. It greatly improves ATS ranking for freshers.',
      impact: 'High',
    });
  }
  score += breakdown.internship;

  // ─── 7. Projects (10 pts) ────────────────────────────────────────────────
  if (projects.length > 0) {
    const valid = projects.filter(p => p.title && p.technologies && p.description);
    if (valid.length > 0) {
      breakdown.projects = 10;
    } else {
      breakdown.projects = 5;
      suggestions.push({
        id: 'projects-incomplete',
        category: 'Projects',
        message: 'Add title, technologies used, and a description to your project entries.',
        impact: 'Medium',
      });
    }
  } else {
    breakdown.projects = 0;
    suggestions.push({
      id: 'projects-missing',
      category: 'Projects',
      message: 'Add at least one project to show practical skills and initiative.',
      impact: 'High',
    });
  }
  score += breakdown.projects;

  // ─── 8. Certifications (5 pts) ────────────────────────────────────────────
  if (certifications.length > 0) {
    const validCerts = certifications.filter(c => c.name && c.organization);
    if (validCerts.length > 0) {
      breakdown.certifications = 5;
    } else {
      breakdown.certifications = 2;
      suggestions.push({
        id: 'certifications-incomplete',
        category: 'Certifications',
        message: 'Fill in the certification name and issuing organization.',
        impact: 'Low',
      });
    }
  } else {
    breakdown.certifications = 0;
    suggestions.push({
      id: 'certifications-missing',
      category: 'Certifications',
      message: 'Add certifications (e.g., AWS, Google, Coursera) to validate your skills.',
      impact: 'Medium',
    });
  }
  score += breakdown.certifications;

  // ─── Bonus: Action Verbs in Experience/Internship (3 pts) ─────────────────
  const actionWords = ['developed', 'built', 'implemented', 'optimized', 'designed', 'created', 'managed', 'led', 'improved', 'collaborated', 'delivered', 'architected', 'automated'];
  const expText = [...(experience || []), ...(internship || [])].map(e => e.description || '').join(' ').toLowerCase();
  const actionMatches = actionWords.filter(w => expText.includes(w));
  if (actionMatches.length >= 3) {
    score += 3;
  } else {
    suggestions.push({
      id: 'action-verbs',
      category: 'Professional Experience',
      message: 'Use strong action verbs like Developed, Built, Optimized, Led in your descriptions.',
      impact: 'Medium',
    });
  }

  // ─── Bonus: Technical Keywords in Skills (2 pts) ──────────────────────────
  const keywords = ['react', 'javascript', 'html', 'css', 'node', 'express', 'mongodb', 'sql', 'python', 'java', 'git', 'typescript', 'aws', 'docker'];
  const skillText = skills.join(' ').toLowerCase();
  const keywordMatches = keywords.filter(w => skillText.includes(w));
  if (keywordMatches.length >= 5) {
    score += 2;
  } else {
    suggestions.push({
      id: 'keywords',
      category: 'Skills',
      message: 'Include industry-standard keywords like React, JavaScript, Python, Git, SQL in your skills.',
      impact: 'Medium',
    });
  }

  const finalScore = Math.min(100, Math.round(score));

  // Sort by impact: Critical → High → Medium → Low
  const impactOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  suggestions.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return { score: finalScore, suggestions, breakdown };
};

/**
 * Calculates Profile Completion Percentage (separate from ATS Score).
 * Evaluates whether key fields are filled in the resume.
 */
export const calculateResumeCompletion = (resume) => {
  if (!resume) return 0;

  let total = 0;
  const { personalInfo = {}, education = [], experience = [], internship = [], projects = [], certifications = [], skills = [] } = resume;

  // Personal Info (30 pts)
  if (personalInfo.fullName && personalInfo.fullName.trim()) total += 6;
  if (personalInfo.email    && personalInfo.email.trim())    total += 6;
  if (personalInfo.phone    && personalInfo.phone.trim())    total += 5;
  if (personalInfo.location && personalInfo.location.trim()) total += 4;
  if (personalInfo.linkedin && personalInfo.linkedin.trim()) total += 5;
  if (personalInfo.github   && personalInfo.github.trim())   total += 4;

  // Professional Summary (10 pts)
  if (personalInfo.summary && personalInfo.summary.trim().length > 30) total += 10;

  // Education (15 pts)
  if (education.length > 0 && education[0].institution && education[0].degree) total += 15;

  // Skills (10 pts)
  if (skills.length >= 3) total += 10;

  // Experience (10 pts)
  if (experience.length > 0 && experience[0].role && experience[0].company) total += 10;

  // Internship (5 pts)
  if (internship.length > 0 && internship[0].company && internship[0].role) total += 5;

  // Projects (10 pts)
  if (projects.length > 0 && projects[0].title) total += 10;

  // Certifications (5 pts)
  if (certifications.length > 0 && certifications[0].name) total += 5;

  return Math.min(100, total);
};

/**
 * Calculates Profile Completion Percentage for the user profile page.
 */
export const calculateProfileCompletion = (profileData) => {
  if (!profileData) return 0;
  let completion = 0;

  if (profileData.fullName        && profileData.fullName.trim())        completion += 15;
  if (profileData.profilePhoto    && profileData.profilePhoto.trim())    completion += 10;
  if (profileData.college         && profileData.college.trim())         completion += 15;
  if (profileData.degree          && profileData.degree.trim())          completion += 15;
  if (profileData.skills          && profileData.skills.length > 0)      completion += 15;
  if (profileData.experience      && profileData.experience.trim())      completion += 10;
  if (profileData.preferredRole   && profileData.preferredRole.trim())   completion += 10;
  if ((profileData.preferredLocation && profileData.preferredLocation.trim()) ||
      (profileData.employmentType    && profileData.employmentType.trim())) {
    completion += 10;
  }

  return completion;
};
