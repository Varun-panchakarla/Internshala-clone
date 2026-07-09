/**
 * Utility to calculate ATS score and generate recommendations.
 */
export const calculateAtsScore = (resume) => {
  if (!resume) return { score: 0, suggestions: [], breakdown: {} };

  let score = 0;
  const suggestions = [];
  const breakdown = {
    personalInfo: 0,
    education: 0,
    experience: 0,
    projects: 0,
    skills: 0
  };

  // 1. Personal Info Evaluation (Max 20 pts)
  const { personalInfo } = resume;
  if (personalInfo) {
    if (personalInfo.fullName && personalInfo.fullName.trim().length > 2) breakdown.personalInfo += 4;
    if (personalInfo.email && personalInfo.email.includes('@')) breakdown.personalInfo += 4;
    if (personalInfo.phone && personalInfo.phone.trim().length > 6) breakdown.personalInfo += 4;
    if (personalInfo.location && personalInfo.location.trim().length > 2) breakdown.personalInfo += 4;
    if (personalInfo.summary && personalInfo.summary.trim().split(/\s+/).length >= 20) {
      breakdown.personalInfo += 4;
    } else {
      suggestions.push({
        id: 'summary-length',
        category: 'Professional Summary',
        message: 'Write a professional summary of at least 20-30 words describing your core values and expertise.',
        impact: 'Medium'
      });
    }
  } else {
    suggestions.push({
      id: 'personal-missing',
      category: 'Contact Info',
      message: 'Fill in your contact information (name, email, and phone) so recruiters can reach out.',
      impact: 'Critical'
    });
  }
  score += breakdown.personalInfo;

  // 2. Education Evaluation (Max 20 pts)
  const { education } = resume;
  if (education && education.length > 0) {
    let validEduCount = 0;
    education.forEach(edu => {
      if (edu.institution && edu.degree && edu.year) validEduCount++;
    });

    if (validEduCount > 0) {
      breakdown.education = 20;
    } else {
      breakdown.education = 10;
      suggestions.push({
        id: 'education-incomplete',
        category: 'Education',
        message: 'Complete the institution, degree, and graduation year fields for your educational entries.',
        impact: 'High'
      });
    }
  } else {
    suggestions.push({
      id: 'education-missing',
      category: 'Education',
      message: 'Add at least one educational entry (college or school degree).',
      impact: 'High'
    });
  }
  score += breakdown.education;

  // 3. Experience Evaluation (Max 25 pts)
  const { experience } = resume;
  if (experience && experience.length > 0) {
    let descriptionDetailCount = 0;
    experience.forEach(exp => {
      if (exp.description && exp.description.trim().split(/\s+/).length >= 15) {
        descriptionDetailCount++;
      }
    });

    if (descriptionDetailCount === experience.length) {
      breakdown.experience = 25;
    } else {
      breakdown.experience = 18;
      suggestions.push({
        id: 'experience-detail',
        category: 'Experience',
        message: 'Use action verbs (e.g., Developed, Managed, Optimized) and add more details to your work experience description (15+ words per role).',
        impact: 'Medium'
      });
    }
  } else {
    suggestions.push({
      id: 'experience-missing',
      category: 'Experience',
      message: 'Add professional experiences or internships. Actionable details show impact.',
      impact: 'Critical'
    });
  }
  score += breakdown.experience;

  // 4. Projects Evaluation (Max 15 pts)
  const { projects } = resume;
  if (projects && projects.length > 0) {
    let validProjectCount = 0;
    projects.forEach(proj => {
      if (proj.title && proj.technologies && proj.description) validProjectCount++;
    });

    if (validProjectCount > 0) {
      breakdown.projects = 15;
    } else {
      breakdown.projects = 8;
      suggestions.push({
        id: 'projects-incomplete',
        category: 'Projects',
        message: 'Detail the technologies used and write a brief description for your project entries.',
        impact: 'Medium'
      });
    }
  } else {
    suggestions.push({
      id: 'projects-missing',
      category: 'Projects',
      message: 'Add at least one personal or academic project to demonstrate practical engineering capabilities.',
      impact: 'High'
    });
  }
  score += breakdown.projects;

  // 5. Skills Evaluation (Max 20 pts)
  const { skills } = resume;
  if (skills && skills.length > 0) {
    const uniqueSkills = [...new Set(skills.filter(s => s.trim().length > 0))];
    const skillScore = Math.min(20, uniqueSkills.length * 2.5); // 8 skills for max points
    breakdown.skills = skillScore;

    if (uniqueSkills.length < 6) {
      suggestions.push({
        id: 'skills-count',
        category: 'Skills',
        message: `Include at least 6 core technical skills on your resume (currently you have ${uniqueSkills.length}).`,
        impact: 'Medium'
      });
    }
  } else {
    suggestions.push({
      id: 'skills-missing',
      category: 'Skills',
      message: 'Add key industry skills. Recruiters search resumes using technical keywords.',
      impact: 'Critical'
    });
  }
  score += breakdown.skills;

  // Round off the total score
  const finalScore = Math.round(score);

  return {
    score: finalScore,
    suggestions: suggestions.sort((a, b) => {
      const order = { 'Critical': 0, 'High': 1, 'Medium': 2 };
      return order[a.impact] - order[b.impact];
    }),
    breakdown
  };
};

/**
 * Calculates Profile Completion Percentage.
 * Profile items:
 * - fullName (15%)
 * - profilePhoto (10%)
 * - college (15%)
 * - degree (15%)
 * - skills (15%)
 * - experience (10%)
 * - preferredRole (10%)
 * - preferredLocation / employmentType (10%)
 */
export const calculateProfileCompletion = (profileData) => {
  if (!profileData) return 0;
  let completion = 0;

  if (profileData.fullName && profileData.fullName.trim()) completion += 15;
  if (profileData.profilePhoto && profileData.profilePhoto.trim()) completion += 10;
  if (profileData.college && profileData.college.trim()) completion += 15;
  if (profileData.degree && profileData.degree.trim()) completion += 15;
  if (profileData.skills && profileData.skills.length > 0) completion += 15;
  if (profileData.experience && profileData.experience.trim()) completion += 10;
  if (profileData.preferredRole && profileData.preferredRole.trim()) completion += 10;
  if ((profileData.preferredLocation && profileData.preferredLocation.trim()) || 
      (profileData.employmentType && profileData.employmentType.trim())) {
    completion += 10;
  }

  return completion;
};
