import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  rows = 3, // For textarea
  options = [], // For select dropdown
  icon: Icon
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const baseInputStyle = `w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400 text-sm dark:bg-gray-800 dark:text-slate-100 dark:disabled:bg-gray-700 dark:disabled:text-slate-500 ${
    error ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 dark:border-rose-700' : 'border-slate-200 dark:border-slate-600'
  } ${Icon ? 'pl-10' : ''} ${isPasswordType ? 'pr-10' : ''}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            id={id}
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseInputStyle} py-2`}
          />
        ) : type === 'select' ? (
          <select
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseInputStyle} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat`}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
                {typeof opt === 'object' ? opt.label : opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={baseInputStyle}
          />
        )}

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
          >
            {showPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
