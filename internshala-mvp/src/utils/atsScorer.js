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
// Bonus: Action Verbs
const actionWords = [
  "developed",
  "built",
  "implemented",
  "optimized",
  "designed",
  "created",
  "managed",
  "led",
  "improved",
  "collaborated"
];

const expText = (experience || [])
  .map(e => e.description || "")
  .join(" ")
  .toLowerCase();

const actionMatches = actionWords.filter(word =>
  expText.includes(word)
);

if (actionMatches.length >= 3) {
  score += 5;
} else {
  suggestions.push({
    id: "action-verbs",
    category: "Experience",
    message:
      "Use more action verbs like Developed, Built, Designed, Optimized and Led.",
    impact: "Medium"
  });
}
// Bonus: Technical Keywords
const keywords = [
  "react",
  "javascript",
  "html",
  "css",
  "node",
  "express",
  "mongodb",
  "sql",
  "python",
  "java",
  "git"
];

const skillText = (skills || [])
  .join(" ")
  .toLowerCase();

const keywordMatches = keywords.filter(word =>
  skillText.includes(word)
);

if (keywordMatches.length >= 6) {
  score += 5;
} else {
  suggestions.push({
    id: "keywords",
    category: "Skills",
    message:
      "Add more technical keywords relevant to your target job.",
    impact: "High"
  });
}
  // Round off the total score
  const finalScore = Math.min(100, Math.round(score));

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
 * Analyzes raw resume text (extracted from PDF upload) and returns an ATS score.
 * Uses keyword matching, section detection, and length heuristics.
 */
export const calculateTextAtsScore = (text, profileSkills = []) => {
  if (!text || text.trim().length < 20) {
    return { score: 0, suggestions: [{ id: 'no-text', category: 'Parsing', message: 'Could not extract enough text from the uploaded file. Try the Resume Builder instead.', impact: 'Critical' }], breakdown: {} };
  }

  const lower = text.toLowerCase();
  const suggestions = [];
  const breakdown = { contact: 0, sections: 0, skills: 0, experience: 0, keywords: 0 };
  let score = 0;

  // 1. Contact Info (max 20)
  const hasEmail = /\S+@\S+\.\S+/.test(lower);
  const hasPhone = /[\+]?[\d\s\-\(\)]{7,}/.test(text);
  if (hasEmail) breakdown.contact += 10;
  if (hasPhone) breakdown.contact += 10;
  if (!hasEmail) suggestions.push({ id: 'upload-email', category: 'Contact', message: 'No email address detected in your resume.', impact: 'High' });
  if (!hasPhone) suggestions.push({ id: 'upload-phone', category: 'Contact', message: 'No phone number detected in your resume.', impact: 'Medium' });
  score += breakdown.contact;

  // 2. Section Detection (max 15)
  const sections = ['education', 'experience', 'skills', 'projects', 'summary'];
  const foundSections = sections.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(text));
  breakdown.sections = Math.min(15, foundSections.length * 3);
  if (foundSections.length < 3) {
    suggestions.push({ id: 'upload-sections', category: 'Structure', message: 'Add clear section headings (Education, Experience, Skills, Projects) to improve ATS readability.', impact: 'High' });
  }
  score += breakdown.sections;

  // 3. Skills Match (max 25)
  if (profileSkills.length > 0) {
    const matched = profileSkills.filter(s => lower.includes(s.toLowerCase()));
    const matchRate = matched.length / profileSkills.length;
    breakdown.skills = Math.round(Math.min(25, matchRate * 25));
    if (matchRate < 0.5) {
      suggestions.push({ id: 'upload-skills', category: 'Skills', message: `Only ${matched.length}/${profileSkills.length} of your listed skills were found in the resume. Add more relevant keywords.`, impact: 'High' });
    }
  } else {
    const wordCount = text.split(/\s+/).length;
    breakdown.skills = Math.min(25, Math.round(wordCount / 200) * 5);
  }
  score += breakdown.skills;

  // 4. Experience Depth (max 20)
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 400) {
    breakdown.experience = 20;
  } else if (wordCount > 200) {
    breakdown.experience = 12;
  } else {
    breakdown.experience = 5;
    suggestions.push({ id: 'upload-length', category: 'Content', message: 'Your resume seems short (' + wordCount + ' words). Aim for 300-500 words with detailed experience descriptions.', impact: 'Medium' });
  }
  score += breakdown.experience;

  // 5. Technical Keywords & Action Verbs (max 20)
  const actionWords = ['developed', 'built', 'implemented', 'designed', 'managed', 'led', 'created', 'optimized', 'improved', 'delivered'];
  const actionMatches = actionWords.filter(w => lower.includes(w));
  const techKeywords = ['react', 'javascript', 'python', 'java', 'sql', 'node', 'html', 'css', 'git', 'docker', 'aws', 'api', 'mongodb', 'typescript', 'angular'];
  const techMatches = techKeywords.filter(w => lower.includes(w));
  breakdown.keywords = Math.min(20, actionMatches.length * 2 + techMatches.length);

  if (actionMatches.length < 2) {
    suggestions.push({ id: 'upload-verbs', category: 'Experience', message: 'Use strong action verbs (Developed, Built, Managed, Optimized) to describe your accomplishments.', impact: 'Medium' });
  }
  if (techMatches.length < 4) {
    suggestions.push({ id: 'upload-tech', category: 'Skills', message: 'Include more technical keywords relevant to your target role.', impact: 'Medium' });
  }
  score += breakdown.keywords;

  const finalScore = Math.min(100, Math.round(score));

  return {
    score: finalScore,
    suggestions: suggestions.sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2 };
      return (order[a.impact] || 3) - (order[b.impact] || 3);
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
