import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getRequest } from '../../../../services/apis/requests';

const PreferencesModal = ({ 
  isOpen, 
  onClose, 
  item,
  onSave 
}) => {
  const [preferences, setPreferences] = useState([]);
  const [availablePreferences, setAvailablePreferences] = useState([]);
  const [customPreference, setCustomPreference] = useState('');

  // Get preferences from API
  const getPreferences = async () => {
    try {
      const response = await getRequest(`menu/${item.SkuCode}/preferences/`);
      if (response.success) {
        setAvailablePreferences([...response.data,{Code:0,Details:"/"}] || []);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  // Initialize preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      getPreferences();
      // Parse existing preferences from item.Details
      if (item.Details) {
        const existingPrefs = item.Details.split('/').map(pref => pref.trim());
        setPreferences(existingPrefs);
      } else {
        setPreferences([]);
      }
    }
  }, [isOpen, item]);

  const handlePreferenceSelect = (pref) => {
    if (!preferences.includes(pref)) {
      const newPreferences = [...preferences, pref];
      setPreferences(newPreferences);
    }
  };

  const removePreference = (index) => {
    const newPreferences = preferences.filter((_, i) => i !== index);
    setPreferences(newPreferences);
  };

  const addCustomPreference = (e) => {
    e.preventDefault();
    if (customPreference.trim() && !preferences.includes(customPreference.trim())) {
      setPreferences([...preferences, customPreference.trim()]);
      setCustomPreference('');
    }
  };
  
  const handleSave = () => {
    const pref = preferences.join(' ')
    onSave(
      pref
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-w-[90%] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Preferences
        </h2>

        <div className="space-y-4">
          {/* Selected Preferences Display */}
          {preferences.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {preferences.map((pref, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white dark:text-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  <span>{pref}</span>
                  <button
                    onClick={() => removePreference(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Available Preferences */}
          <div>
            <h3 className="text-sm font-medium mb-2">Select Preference</h3>
            <div className="flex flex-wrap gap-2">
              {availablePreferences.length > 0 ? (
                availablePreferences.map((pref) => (
                  <button
                    key={pref.Code}
                    onClick={() => handlePreferenceSelect(pref.Details)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      preferences.includes(pref.Details)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {pref.Details}
                  </button>
                ))
              ) : (
                <span className="text-sm dark:text-gray-200 text-gray-400 text-center">
                  --No Preference set on the item--
                </span>
              )}
            </div>
          </div>

          {/* Custom Preference Input */}
          {/* <form onSubmit={addCustomPreference} className="flex gap-2">
            <input
              type="text"
              value={customPreference}
              onChange={(e) => setCustomPreference(e.target.value)}
              placeholder="Add custom preference..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              +
            </button>
          </form> */}

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;