import React, { createContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Define all possible toast positions
const TOAST_POSITIONS = [
  'top-left', 
  'top-center', 
  'top-right', 
  'bottom-left', 
  'bottom-center', 
  'bottom-right'
];

// Define toast types
const TOAST_TYPES = [
  'success', 
  'error', 
  'loading', 
  'info', 
  'warning'
];

// Custom toast options
const toastStyles = {
  success: {
    duration: 1000,
    theme: { primary: '#4CAF50' },
    icon: '✅'
  },
  error: {
    duration: 1000,
    theme: { primary: '#E57373' },
    icon: '❌'
  },
  loading: {
    duration: 2000,
    theme: { primary: '#2196F3' },
    icon: '⏳'
  },
  info: {
    duration: 2000,
    theme: { primary: '#2196F3' },
    icon: 'ℹ️'
  },
  warning: {
    duration: 3500,
    theme: { primary: '#FF9800' },
    icon: '⚠️'
  }
};

// Toast context to manage global and local toast settings
const ToastContext = createContext({
  success: () => {},
  error: () => {},
  loading: () => {},
  info: () => {},
  warning: () => {},
  custom: toast
});

// Toast provider component
export const ToastProvider = ({ 
  children, 
  defaultPosition = 'top-right' 
}) => {
  return (
    <ToastContext.Provider value={null}>
      {children}
      <Toaster 
        position={defaultPosition}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px',
          },
        }}
      />
    </ToastContext.Provider>
  );
};

// Custom hook for using toasts with optional positioning
export const useToast = (position) => {
  const createToast = (type) => {
    return (message, options = {}) => {
      const toastConfig = {
        ...toastStyles[type],
        ...(position ? { position } : {}),
        ...(options || {})
      };
      
      switch(type) {
        case 'success':
          return toast.success(message, toastConfig);
        case 'error':
          return toast.error(message, toastConfig);
        case 'loading':
          return toast.loading(message, toastConfig);
        case 'info':
          return toast.custom((t) => (
            <div 
              className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
              max-w-md w-full bg-blue-500 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ), toastConfig);
        case 'warning':
          return toast.custom((t) => (
            <div 
              className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
              max-w-md w-full bg-orange-500 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ), toastConfig);
        default:
          return toast(message, toastConfig);
      }
    };
  };

  return {
    success: createToast('success'),
    error: createToast('error'),
    loading: createToast('loading'),
    info: createToast('info'),
    warning: createToast('warning'),
    custom: toast
  };
};

// Optional utility functions if needed
export const getToastPositions = () => TOAST_POSITIONS;
export const getToastTypes = () => TOAST_TYPES;