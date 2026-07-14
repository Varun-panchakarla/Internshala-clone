import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Portal/Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 animate-slide-up border ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                : 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
            }`}
            role="alert"
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <FiCheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <FiAlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />}
              {toast.type === 'info' && <FiInfo className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors ml-4 focus:outline-none"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
