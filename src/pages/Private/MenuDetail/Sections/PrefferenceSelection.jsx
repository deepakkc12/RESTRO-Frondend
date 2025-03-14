import React from 'react';
import { Plus, Minus } from "lucide-react";

const PreferencesSection = ({ 
  food, 
  selectedPreferences, 
  preferenceQuantities, 
  customPreference,
  setCustomPreference,
  togglePreference,
  updatePreferenceQuantity,
  addCustomPreference 
}) => {
  return (
    <div>
      {/* Preset Preferences with Quantity Control */}
      <div className="flex flex-wrap gap-4 mb-4">
        {food.prefereces?.map((pref) => (
          <div
            key={pref.Code}
            className={`flex items-center justify-between space-x-2 rounded-lg text-sm border ${
              selectedPreferences.some((p) => p.Code === pref.Code)
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-500"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900 border-gray-300"
            }`}
          >
            <div
              onClick={() => togglePreference(pref)}
              className={`${
                selectedPreferences.some((p) => p.Code === pref.Code)
                  ? "pl-2 pr-1"
                  : "px-4"
              } py-2 cursor-pointer`}
            >
              <span>{pref.Details}</span>
            </div>

            {/* Quantity Control */}
            {selectedPreferences.some((p) => p.Code === pref.Code) && (
              <div className="flex items-center space-x-2 px-1">
                <button
                  className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full"
                  onClick={() => updatePreferenceQuantity(pref, -1)}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center">
                  × {preferenceQuantities[pref.Code] || 1}
                </span>
                <button
                  className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full"
                  onClick={() => updatePreferenceQuantity(pref, 1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Preference Input */}
      <form onSubmit={addCustomPreference} className="flex gap-2">
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
      </form>
    </div>
  );
};

export default PreferencesSection;