import React, { useState } from 'react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useResume } from '../context/ResumeContext';
import { useToast } from '../components/common/Toast';
import { FiSave, FiDownload, FiPlus, FiTrash, FiAward, FiAlertCircle, FiChevronRight, FiBriefcase, FiBookOpen, FiUser, FiCode } from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';

const ResumeBuilder = () => {
  const {
    resume,
    loading,
    saving,
    resumeCompletion,
    atsScore,
    atsSuggestions,
    atsBreakdown,
    updatePersonalInfo,
    updateEducation,
    updateExperience,
    updateProjects,
    updateSkills,
    saveResume
  } = useResume();

  const { addToast } = useToast();

  // Accordion Expand State
  const [activeSection, setActiveSection] = useState('personal');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [compilingResume, setCompilingResume] = useState(false);

  // Local state for comma-separated skills input
  const [skillsInput, setSkillsInput] = useState(resume?.skills ? resume.skills.join(', ') : '');

  // Track skills input updates
  React.useEffect(() => {
    if (resume?.skills) {
      setSkillsInput(resume.skills.join(', '));
    }
  }, [resume]);

  if (loading || !resume) {
    return (
      <div className="flex justify-center items-center p-12">
        <svg className="animate-spin h-8 w-8 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Personal Info Form Handlers
  const handlePersonalChange = (field, val) => {
    updatePersonalInfo({ [field]: val });
  };

  // Education Form Handlers
  const handleEducationChange = (index, field, val) => {
    const updated = [...resume.education];
    updated[index][field] = val;
    updateEducation(updated);
  };

  const addEducation = () => {
    const updated = [...resume.education, { institution: '', degree: '', year: '', gpa: '' }];
    updateEducation(updated);
    addToast('New education entry added.', 'info');
  };

  const removeEducation = (index) => {
    const updated = resume.education.filter((_, i) => i !== index);
    updateEducation(updated);
    addToast('Education entry removed.', 'info');
  };

  // Experience Form Handlers
  const handleExperienceChange = (index, field, val) => {
    const updated = [...resume.experience];
    updated[index][field] = val;
    updateExperience(updated);
  };

  const addExperience = () => {
    const updated = [...resume.experience, { role: '', company: '', duration: '', description: '' }];
    updateExperience(updated);
    addToast('New experience entry added.', 'info');
  };

  const removeExperience = (index) => {
    const updated = resume.experience.filter((_, i) => i !== index);
    updateExperience(updated);
    addToast('Experience entry removed.', 'info');
  };

  // Projects Form Handlers
  const handleProjectChange = (index, field, val) => {
    const updated = [...resume.projects];
    updated[index][field] = val;
    updateProjects(updated);
  };

  const addProject = () => {
    const updated = [...resume.projects, { title: '', technologies: '', description: '' }];
    updateProjects(updated);
    addToast('New project entry added.', 'info');
  };

  const removeProject = (index) => {
    const updated = resume.projects.filter((_, i) => i !== index);
    updateProjects(updated);
    addToast('Project entry removed.', 'info');
  };

  // Skills change
  const handleSkillsInputChange = (e) => {
    const val = e.target.value;
    setSkillsInput(val);
    const skillsArr = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    updateSkills(skillsArr);
  };

  const handleSaveResume = async () => {
    try {
      await saveResume();
      addToast('Resume changes saved and compiled successfully!', 'success');
    } catch (err) {
      addToast('Failed to save resume details.', 'error');
    }
  };

  const handleDownloadTrigger = () => {
    setDownloadModalOpen(true);
    setCompilingResume(true);

    setTimeout(() => {
      setCompilingResume(false);
    }, 2000);
  };

  const handleConfirmDownload = async () => {
  setDownloadModalOpen(false);

  const resumeElement = document.getElementById("resume-preview");

  if (!resumeElement) {
    addToast("Resume preview not found!", "error");
    return;
  }

  try {
    const canvas = await html2canvas(resumeElement, {
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save("ATS_Resume.pdf");

    addToast("Resume downloaded successfully!", "success");
  } catch (error) {
      console.error("PDF Error:", error);
      alert(error.message);
      addToast("Failed to download resume.", "error");
    }
};

  const accordionHeaders = [
    { id: 'personal', label: '1. Personal Information', icon: FiUser },
    { id: 'education', label: '2. Education Details', icon: FiBookOpen },
    { id: 'experience', label: '3. Professional Experience', icon: FiBriefcase },
    { id: 'projects', label: '4. Project Experience', icon: FiCode },
    { id: 'skills', label: '5. Skills Inventory', icon: FiAward },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full animate-slide-up">
      
      {/* LEFT COLUMN: Input Panels & Suggestions (xl:col-span-5) */}
      <div className="xl:col-span-5 flex flex-col gap-6 w-full">
        
        {/* ATS Score Card Widget */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Resume Completion</h3>
              <p className="text-xs text-slate-400">Completion updates as you fill your resume</p>
            </div>
            <span className={`text-2xl font-black px-3 py-1.5 rounded-2xl border ${
              resumeCompletion >= 80 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : resumeCompletion >= 50
                ? 'bg-amber-50 text-amber-700 border-amber-100'
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              {resumeCompletion}%
            </span>
          </div>

          <ProgressBar value={resumeCompletion} showPercentage={true} size="sm" />
          
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" className="flex-1 shadow-sm font-bold" onClick={handleSaveResume} loading={saving}>
              <FiSave className="mr-1.5" /> Save Changes
            </Button>
            <Button variant="outline" size="sm" className="bg-white" onClick={handleDownloadTrigger}>
              <FiDownload />
            </Button>
          </div>
        </div>

        {/* Dynamic Suggestions List */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">ATS Recommendations ({atsSuggestions.length})</h4>
          
          {atsSuggestions.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
              {atsSuggestions.map((sug) => (
                <div key={sug.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex gap-2.5 items-start">
                  <FiAlertCircle className={`shrink-0 w-4 h-4 mt-0.5 ${
                    sug.impact === 'Critical' ? 'text-rose-500' : sug.impact === 'High' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{sug.category}</span>
                      <span className={`text-[8px] font-black uppercase px-1 rounded ${
                        sug.impact === 'Critical' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : sug.impact === 'High'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {sug.impact} Impact
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{sug.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex gap-2.5 items-center">
              <FiAward className="text-emerald-500 w-5 h-5 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                Excellent! Your resume satisfies all baseline ATS parser checks. Ready to apply!
              </p>
            </div>
          )}
        </div>

        {/* Input Accordions */}
        <div className="flex flex-col gap-2">
          {accordionHeaders.map((hdr) => {
            const Icon = hdr.icon;
            const isOpen = activeSection === hdr.id;

            return (
              <div key={hdr.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                
                {/* Header trigger */}
                <button
                  onClick={() => setActiveSection(isOpen ? '' : hdr.id)}
                  className={`w-full flex items-center justify-between p-4 font-extrabold text-sm text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none ${
                    isOpen ? 'border-b border-slate-100 bg-slate-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="text-slate-400 w-4 h-4" />
                    <span>{hdr.label}</span>
                  </div>
                  <FiChevronRight className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Form Panels */}
                {isOpen && (
                  <div className="p-5 flex flex-col gap-4 animate-fade-in">
                    
                    {/* Personal Info section */}
                    {hdr.id === 'personal' && (
                      <div className="flex flex-col gap-4">
                        <Input
                          label="Full Name"
                          id="resName"
                          value={resume.personalInfo.fullName}
                          onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Email Address"
                            id="resEmail"
                            value={resume.personalInfo.email}
                            onChange={(e) => handlePersonalChange('email', e.target.value)}
                          />
                          <Input
                            label="Phone Number"
                            id="resPhone"
                            value={resume.personalInfo.phone}
                            onChange={(e) => handlePersonalChange('phone', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Location"
                            id="resLoc"
                            value={resume.personalInfo.location}
                            onChange={(e) => handlePersonalChange('location', e.target.value)}
                          />
                          <Input
                            label="Website Portfolio"
                            id="resWeb"
                            value={resume.personalInfo.website}
                            onChange={(e) => handlePersonalChange('website', e.target.value)}
                          />
                        </div>
                        <Input
                          label="Professional Summary"
                          id="resSum"
                          type="textarea"
                          rows={4}
                          value={resume.personalInfo.summary}
                          onChange={(e) => handlePersonalChange('summary', e.target.value)}
                        />
                      </div>
                    )}

                    {/* Education details section */}
                    {hdr.id === 'education' && (
                      <div className="flex flex-col gap-6">
                        {resume.education.map((edu, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4 relative">
                            <button
                              onClick={() => removeEducation(idx)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 focus:outline-none p-1"
                            >
                              <FiTrash className="w-4 h-4" />
                            </button>
                            
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entry #{idx + 1}</span>

                            <Input
                              label="Institution / University"
                              id={`eduInst-${idx}`}
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                            />

                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-2">
                                <Input
                                  label="Degree / Field"
                                  id={`eduDeg-${idx}`}
                                  value={edu.degree}
                                  onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                                />
                              </div>
                              <div>
                                <Input
                                  label="Graduation Year"
                                  id={`eduYr-${idx}`}
                                  value={edu.year}
                                  onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                                />
                              </div>
                            </div>

                            <Input
                              label="GPA / Grade"
                              id={`eduGpa-${idx}`}
                              value={edu.gpa}
                              onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                            />
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full py-2.5 border-dashed bg-white" onClick={addEducation}>
                          <FiPlus className="mr-1.5" /> Add Education Entry
                        </Button>
                      </div>
                    )}

                    {/* Work experience section */}
                    {hdr.id === 'experience' && (
                      <div className="flex flex-col gap-6">
                        {resume.experience.map((exp, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4 relative">
                            <button
                              onClick={() => removeExperience(idx)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 focus:outline-none p-1"
                            >
                              <FiTrash className="w-4 h-4" />
                            </button>

                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entry #{idx + 1}</span>

                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="Job Role Title"
                                id={`expRole-${idx}`}
                                value={exp.role}
                                onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                              />
                              <Input
                                label="Company Name"
                                id={`expComp-${idx}`}
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                              />
                            </div>

                            <Input
                              label="Duration / Period"
                              id={`expDur-${idx}`}
                              placeholder="e.g. June 2022 - Present"
                              value={exp.duration}
                              onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                            />

                            <Input
                              label="Role Description"
                              id={`expDesc-${idx}`}
                              type="textarea"
                              rows={4}
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                            />
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full py-2.5 border-dashed bg-white" onClick={addExperience}>
                          <FiPlus className="mr-1.5" /> Add Experience Entry
                        </Button>
                      </div>
                    )}

                    {/* Projects section */}
                    {hdr.id === 'projects' && (
                      <div className="flex flex-col gap-6">
                        {resume.projects.map((proj, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4 relative">
                            <button
                              onClick={() => removeProject(idx)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 focus:outline-none p-1"
                            >
                              <FiTrash className="w-4 h-4" />
                            </button>

                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entry #{idx + 1}</span>

                            <Input
                              label="Project Title"
                              id={`projTitle-${idx}`}
                              value={proj.title}
                              onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                            />

                            <Input
                              label="Core Technologies"
                              id={`projTech-${idx}`}
                              placeholder="e.g. React, Redux, Node.js"
                              value={proj.technologies}
                              onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value)}
                            />

                            <Input
                              label="Project Description"
                              id={`projDesc-${idx}`}
                              type="textarea"
                              rows={4}
                              value={proj.description}
                              onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                            />
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full py-2.5 border-dashed bg-white" onClick={addProject}>
                          <FiPlus className="mr-1.5" /> Add Project Entry
                        </Button>
                      </div>
                    )}

                    {/* Skills section */}
                    {hdr.id === 'skills' && (
                      <div className="flex flex-col gap-4">
                        <Input
                          label="Technical Skills (Comma-separated)"
                          id="resSkills"
                          placeholder="e.g. React, JavaScript, TypeScript, CSS, Node.js, REST APIs"
                          value={skillsInput}
                          onChange={handleSkillsInputChange}
                        />
                        <span className="text-[10px] -mt-2 text-slate-400 font-medium">Keywords are critical. Enter technical skills separating each by a comma.</span>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: Document A4 Sheet Preview (xl:col-span-7) */}
      <div className="xl:col-span-7 flex flex-col gap-4 items-center w-full sticky top-20">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 px-3 py-1 rounded-full self-center">
          📄 Live Document Preview (A4 Aspect Ratio)
        </span>

        {/* A4 Paper Container */}
        <div
          id="resume-preview" 
          className="w-full max-w-[210mm] aspect-[1/1.4142] bg-white shadow-2xl border border-slate-100 p-[15mm] flex flex-col gap-[8mm] text-slate-800 text-[10px] select-text overflow-y-auto max-h-[85vh] leading-normal font-sans">
          
          {/* Document Header */}
          <div className="text-center flex flex-col gap-1 border-b border-slate-200 pb-4">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none uppercase">
              {resume.personalInfo.fullName || 'Full Name'}
            </h1>
            
            {/* Contact row */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-500 font-medium mt-1">
              {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
              {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
              {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
              {resume.personalInfo.website && <span>• {resume.personalInfo.website}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {resume.personalInfo.summary && (
            <div className="flex flex-col gap-1">
              <h2 className="text-[10px] font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-0.5 tracking-wider">Professional Summary</h2>
              <p className="text-slate-600 text-justify text-[9px] leading-relaxed font-light mt-0.5">{resume.personalInfo.summary}</p>
            </div>
          )}

          {/* Education Details list */}
          {resume.education && resume.education.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-[10px] font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-0.5 tracking-wider">Education</h2>
              <div className="flex flex-col gap-2">
                {resume.education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-[9px]">{edu.institution || 'University Name'}</h4>
                      <p className="text-slate-500 font-semibold">{edu.degree || 'Degree Title'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-600">{edu.year || 'Graduation Period'}</span>
                      {edu.gpa && <p className="text-slate-400 mt-0.5">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional experience list */}
          {resume.experience && resume.experience.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-[10px] font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-0.5 tracking-wider">Professional Experience</h2>
              <div className="flex flex-col gap-3">
                {resume.experience.map((exp, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-[9px]">{exp.role || 'Job Role Title'}</h4>
                        <p className="text-slate-500 font-semibold">{exp.company || 'Company Name'}</p>
                      </div>
                      <span className="font-bold text-slate-600 text-right">{exp.duration || 'Period'}</span>
                    </div>
                    {exp.description && (
                      <p className="text-slate-600 text-[9px] leading-relaxed mt-0.5">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects experience list */}
          {resume.projects && resume.projects.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-[10px] font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-0.5 tracking-wider">Projects</h2>
              <div className="flex flex-col gap-3">
                {resume.projects.map((proj, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-900 text-[9px]">{proj.title || 'Project Title'}</h4>
                      {proj.technologies && (
                        <span className="font-bold text-slate-500 italic text-[8px]">Tech: {proj.technologies}</span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-slate-600 text-[9px] leading-relaxed mt-0.5">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills details pills */}
          {resume.skills && resume.skills.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[10px] font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-0.5 tracking-wider">Key Skills</h2>
              <p className="text-slate-600 font-medium leading-relaxed leading-snug mt-0.5">
                {resume.skills.join(' • ')}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Compile & Download Modal */}
      <Modal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Compile PDF Document"
        footer={
          !compilingResume && (
            <>
              <Button variant="outline" onClick={() => setDownloadModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmDownload}>
                Download PDF
              </Button>
            </>
          )
        }
      >
        {compilingResume ? (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <svg className="animate-spin h-10 w-10 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-700">Compiling ATS Resume PDF</h4>
              <p className="text-xs text-slate-400 mt-1">Applying layout parameters, styles formatting, and cleaning margins...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <div>
              <h3 className="font-extrabold text-slate-700 text-sm">Compilation Successful!</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Your resume scored <b>{atsScore}/100</b>. Click below to download the standard formatted PDF.
              </p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default ResumeBuilder;
