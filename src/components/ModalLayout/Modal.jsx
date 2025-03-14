import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children ,size = 'xl',h=""}) => {
  if (!isOpen) return null;


  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  

  return (
    <div 
      className={"fixed inset-0 bg-black/50 flex items-center justify-center z-50 "+h}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white overflow-y-auto rounded-lg shadow-lg w-full ${size=='xl'?'max-w-5xl':'w-full'} mx-4 relative animate-in fade-in zoom-in duration-200`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;