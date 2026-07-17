import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import { FiPlus, FiCheck, FiArrowRight, FiArrowLeft, FiSearch, FiX } from 'react-icons/fi';

const PREDEFINED_INTERESTS = [
  'Sales', 'Data Entry', 'Digital Marketing', 'Web Development', 'Graphic Design',
  'Marketing', 'Human Resources (HR)', 'General Management', 'Social Media Marketing',
  'Finance', 'Software Development', 'Telecalling', 'Market/Business Research',
  'Content Writing', 'Accounts', 'Project Management', 'Operations', 'Client Servicing',
  'Programming', 'Teaching', 'Data Science', 'Video Making/Editing', 'Interior Design',
  'Python/Django Development', 'UI/UX Design', 'Software Testing'
];

const OnboardingStep2 = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Selected interests state
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const containerRef = useRef(null);

  // Filter suggestions when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = PREDEFINED_INTERESTS.filter(interest => 
      interest.toLowerCase().includes(query) && !selectedInterests.includes(interest)
    );
    setSuggestions(filtered);
  }, [searchQuery, selectedInterests]);

  // Click outside listener to close search dropdown suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle interest selection
  const handleToggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(item => item !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  // Add custom interest
  const handleAddCustomInterest = () => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    // Find casing match in predefined list to avoid duplicates
    const matchedPredefined = PREDEFINED_INTERESTS.find(
      item => item.toLowerCase() === cleanQuery.toLowerCase()
    );

    const finalInterest = matchedPredefined || cleanQuery;

    if (selectedInterests.includes(finalInterest)) {
      addToast(`"${finalInterest}" is already selected.`, 'warning');
    } else {
      setSelectedInterests(prev => [...prev, finalInterest]);
      addToast(`Added "${finalInterest}" to interests.`, 'success');
    }

    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Click suggestion handler
  const handleSelectSuggestion = (interest) => {
    if (!selectedInterests.includes(interest)) {
      setSelectedInterests(prev => [...prev, interest]);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (selectedInterests.length === 0) {
      addToast('Please select at least one interest to proceed.', 'error');
      return;
    }
    addToast('Preferences saved successfully!', 'success');
    navigate('/onboarding/step3');
  };

  return (
    <div className="max-w-3xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
      {/* ── Progress Bar ── */}
      <div className="mb-10 w-full animate-fade-in">
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out" 
            style={{ width: '66.6%' }}
          />
        </div>
        <div className="flex justify-between items-center mt-2.5 text-xs text-slate-400 dark:text-slate-500 font-bold">
          <span>Step 2 of 3</span>
          <span>66% Complete</span>
        </div>
      </div>

      {/* ── Main Preferences Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl animate-slide-up">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your Preferences
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
            Help us match you with the best career opportunities.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-8">
          
          {/* Section: Search and Selectable input */}
          <div className="flex flex-col gap-3 relative" ref={containerRef}>
            <label htmlFor="interestSearch" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Area(s) of Interest
            </label>

            {/* Selected interests chips inside search container wrapper */}
            {selectedInterests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl animate-fade-in">
                {selectedInterests.map(interest => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className="hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded-full p-0.5"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 dark:text-slate-550 pointer-events-none">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                id="interestSearch"
                type="text"
                placeholder="Areas you want to work in or learn about"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (suggestions.length > 0) {
                      handleSelectSuggestion(suggestions[0]);
                    } else {
                      handleAddCustomInterest();
                    }
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-gray-800 dark:border-slate-600 dark:text-slate-100"
              />
            </div>

            {/* Filter Search Dropdown suggestions */}
            {showSuggestions && (searchQuery.trim() !== '') && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-scale-in">
                {suggestions.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleSelectSuggestion(interest)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold transition-colors flex items-center justify-between"
                  >
                    <span>{interest}</span>
                    <span className="text-xs text-slate-400">Predefined Interest</span>
                  </button>
                ))}

                {/* Add Custom choice option */}
                <button
                  type="button"
                  onClick={handleAddCustomInterest}
                  className="w-full text-left px-4 py-2.5 text-sm text-brand-650 dark:text-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-950/10 font-bold transition-colors flex items-center gap-1.5"
                >
                  <FiPlus className="w-4 h-4" /> Add custom interest "{searchQuery.trim()}"
                </button>
              </div>
            )}
          </div>

          {/* Section: Predefined popular interests */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider">
              Popular Career Interests
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {PREDEFINED_INTERESTS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleToggleInterest(interest)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 hover:scale-[1.01] ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSelected ? <FiCheck className="w-3.5 h-3.5" /> : <FiPlus className="w-3.5 h-3.5" />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
            <Button
              variant="outline"
              size="lg"
              className="py-3 rounded-2xl text-sm font-bold w-full sm:w-auto flex items-center justify-center gap-2"
              onClick={() => navigate('/onboarding')}
            >
              <FiArrowLeft className="shrink-0 w-4 h-4" /> Previous
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="py-3 rounded-2xl text-sm font-black tracking-wide w-full sm:w-auto flex items-center justify-center gap-2"
              disabled={selectedInterests.length === 0}
            >
              Save & Continue <FiArrowRight className="shrink-0 w-4 h-4" />
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default OnboardingStep2;
