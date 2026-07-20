import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiCheck, FiSearch } from 'react-icons/fi';

const FilterDropdown = ({
  label,
  id,
  value,
  onChange,
  options = [],
  isOpen = false,
  onToggle,
  onClose,
  placeholder = 'Select...',
  searchable = false,
  searchPlaceholder = 'Search...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Sync search input with value state
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const opt = options.find(o => (typeof o === 'object' ? o.value : o) === value);
      if (opt && typeof opt === 'object' && opt.value !== '') {
        setSearchTerm(opt.label);
      } else if (typeof value === 'string' && value.trim() !== '') {
        setSearchTerm(value);
      } else {
        setSearchTerm('');
      }
    }
  }, [value, isOpen, options]);

  // Set highlight index to 0 when dropdown opens or search term changes
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(0);
    }
  }, [isOpen, searchTerm]);

  const selectedOption = options.find(opt => (typeof opt === 'object' ? opt.value : opt) === value) || options[0];

  const handleSelect = (optValue) => {
    onChange(optValue);
    onClose();
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
  };

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter(opt => {
        const optLabel = typeof opt === 'object' ? opt.label : String(opt);
        const optVal = typeof opt === 'object' ? opt.value : String(opt);
        const query = searchTerm.toLowerCase().trim();
        return (
          optLabel.toLowerCase().includes(query) ||
          optVal.toLowerCase().includes(query)
        );
      })
    : options;

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        onToggle();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex(prev => {
        if (prev < 0) return 0;
        return prev < filteredOptions.length - 1 ? prev + 1 : prev;
      });
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length === 0) return;

      const validIndex = highlightedIndex >= 0 && highlightedIndex < filteredOptions.length ? highlightedIndex : 0;
      const targetOpt = filteredOptions[validIndex];

      if (targetOpt) {
        const optVal = typeof targetOpt === 'object' ? targetOpt.value : targetOpt;
        handleSelect(optVal);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative" onKeyDown={handleKeyDown}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between gap-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer ${
            isOpen
              ? 'bg-brand-50/50 dark:bg-brand-950/30 border-brand-500 text-brand-700 dark:text-brand-400 ring-2 ring-brand-500/20'
              : value
                ? 'bg-brand-50/30 dark:bg-slate-900 border-brand-300 dark:border-brand-800 text-slate-900 dark:text-slate-100 font-bold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <span className="truncate">
            {value ? (selectedOption ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption) : value) : placeholder}
          </span>
          <FiChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            tabIndex="-1"
            className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1.5 max-h-64 overflow-y-auto animate-in fade-in-50 zoom-in-95 custom-scrollbar min-w-[160px]"
          >
            {searchable && (
              <div className="px-2 pb-1.5 mb-1 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="relative flex items-center">
                  <FiSearch className="absolute left-2.5 text-slate-400 dark:text-slate-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const isSelected = optVal === value || (value && optVal && String(value).toLowerCase() === String(optVal).toLowerCase());
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={optVal}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    ref={(el) => {
                      if (isHighlighted && el) {
                        el.scrollIntoView({ block: 'nearest' });
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(optVal);
                    }}
                    className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer ${
                      isHighlighted
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-bold'
                        : isSelected
                          ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">{optLabel}</span>
                    {isSelected && <FiCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 ml-1.5" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
                No matching roles found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterDropdown;
