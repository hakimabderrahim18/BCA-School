import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4500) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showToast = useCallback(
    (message, type = 'info', duration = 4500) => {
      addToast(message, type, duration);
    },
    [addToast]
  );

  const value = useMemo(() => {
    const fn = (message, type, duration) => addToast(message, type, duration);

    fn.showToast = showToast;
    fn.addToast = addToast;
    fn.success = (msg, duration) => addToast(msg, 'success', duration);
    fn.error = (msg, duration) => addToast(msg, 'error', duration);
    fn.warning = (msg, duration) => addToast(msg, 'warning', duration);
    fn.info = (msg, duration) => addToast(msg, 'info', duration);
    fn.toast = {
      success: fn.success,
      error: fn.error,
      warning: fn.warning,
      info: fn.info,
    };

    return fn;
  }, [addToast, showToast]);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-200 bg-rose-50/95 text-rose-900 shadow-rose-500/10';
      case 'warning':
        return 'border-amber-200 bg-amber-50/95 text-amber-900 shadow-amber-500/10';
      default:
        return 'border-sky-200 bg-sky-50/95 text-sky-900 shadow-sky-500/10';
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Conteneur flottant des notifications (Toasts) */}
      <div
        aria-live="polite"
        className="fixed bottom-5 end-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${getToastStyles(
              t.type
            )}`}
          >
            {getToastIcon(t.type)}
            <div className="flex-1 text-sm font-medium leading-relaxed">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded-lg cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
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
    throw new Error('useToast doit être utilisé à l’intérieur d’un ToastProvider');
  }
  return context;
};

export default useToast;
