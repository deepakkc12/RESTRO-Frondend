import React, { useEffect, useState } from 'react';
import { getRequest, postRequest } from '../../services/apis/requests';
import { useToast } from '../../hooks/UseToast';

const SalesAdjustmentModal = ({ isOpen = true, onClose, salesCode }) => {
  const [adjustmentType, setAdjustmentType] = useState('');
  const [remark, setRemark] = useState('');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [updatedLoginCode, setUpdatedLoginCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toast = useToast()

  const adjustmentTypes = [
    { id: 'CMPL', label: 'Complimentary', description: 'Free service or product' },
    { id: 'REJ', label: 'Rejection', description: 'Cancel or void sale' },
    { id: 'CR', label: 'Credit', description: 'Apply credit to account' }
  ];

  const getDetail = async () => {
    try {
      const response = await getRequest(`sales/adjustment/detail/?salesCode=${salesCode}`);
      if (response.success) {
        setAdjustmentType(response.data.TypeCode);
        setRemark(response.data.Remark);
        setUpdatedLoginCode(response.data.LoginCode);
      }
    } catch (err) {
      setError('Failed to load adjustment details');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      const body = {
        salesCode: salesCode,
        remark: remark,
        typeCode: adjustmentType
      };
      const response = await postRequest(`sales/adjustment/`, body);
      if (response.success) {
        toast.success("Updated Successfully")
        onClose();
      } else {
        setError('Failed to submit adjustment');
      }
    } catch (err) {
      setError('An error occurred while submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getDetail();
    }
  }, [isOpen, salesCode]);

  if (!isOpen) return null;

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setRemark(prev => prev.slice(0, -1));
    } else if (key === 'space') {
      setRemark(prev => prev + ' ');
    } else {
      setRemark(prev => prev + key);
    }
  };

  const renderKeyboard = () => {
    const keys = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
    ];

    return (
      <div className="mt-4 bg-gray-50 p-3 rounded-lg shadow-inner">
        {keys.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5 mb-1.5">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors min-w-[2.5rem] text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {key === 'backspace' ? '←' : key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center">
          <button
            onClick={() => handleKeyPress('space')}
            className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors w-48 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Space
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in fade-in duration-200">
        <div className="p-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Sales Adjustment</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {updatedLoginCode && (
              <div className="p-1 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  Already updated by <span className="font-semibold">{updatedLoginCode}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Adjustment Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {adjustmentTypes.map(({ id, label, description }) => (
                  <label
                    key={id}
                    className={`
                      relative flex flex-col p-2 rounded-lg cursor-pointer border-2 transition-all
                      ${adjustmentType === id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="adjustmentType"
                      value={id}
                      checked={adjustmentType === id}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                      className="sr-only"
                    />
                    <span className={` font-semibold mb-1 ${adjustmentType === id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {label}
                    </span>
                    {/* <span className="text-xs text-gray-500">{description}</span> */}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <button
                  onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {showVirtualKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
                  <span className="text-lg">⌨️</span>
                </button>
              </div>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full p-3 text-dark  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                rows={2}
                placeholder="Enter remarks here..."
              />
              {showVirtualKeyboard && renderKeyboard()}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!adjustmentType || !remark?.trim() || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAdjustmentModal;