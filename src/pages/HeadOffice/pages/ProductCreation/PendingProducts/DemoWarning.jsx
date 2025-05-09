import React, { useState } from 'react';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';

const DemoWarningModal = ({ isOpen, onClose, rowData, onTryDemo }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTryDemo = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Call the parent component's handler
      onTryDemo?.();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <h2 className="text-xl font-semibold">Demo Required</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
            <p className="text-amber-700">
              You need to perform demo sales before importing this product.
            </p>
          </div>
          
          {rowData && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Item Details:</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p><strong>Name:</strong> {rowData.item}</p>
                <p><strong>Category:</strong> {rowData.category}</p>
                <p><strong>Price 1:</strong> {rowData.Price1}</p>
                <p><strong>Demo Sales:</strong> {rowData.demoSales}</p>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mb-4">
            Testing on the demo server ensures that your item will work correctly 
            in the production environment without causing data issues.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleTryDemo}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2
              ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                <span>Go to Demo Server</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoWarningModal;