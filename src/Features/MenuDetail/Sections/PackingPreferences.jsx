import { getRequest } from "../../../services/apis/requests";
import { Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const PackingPreference = ({ onPreferenceChange,selectedPreference, Prefferences = [], clearTrigger }) => {


    // console.log(Prefferences) 

//   const [selectedPreference, setSelectedPreference] = useState("");
  const [customPreference, setCustomPreference] = useState("");
  const [preferences, setPreferences] = useState([]); // Keep only one selected preference
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [commonNotes, setCommonNotes] = useState([]);
  const [skuPrefferences, setPackingPreference] = useState(Prefferences);


//   const getCommonPrefference = async () => {
//     const response = await getRequest("menu/common-prefference-list/");
//     setCommonNotes(response.data);
//   };


  const clearPreference = () => {
    setPreferences([]);
    // setSelectedPreference("");
  };

  useEffect(() => {
    clearPreference();
  }, [clearTrigger]);

  const handlePreferenceSelect = (pref) => {
    onPreferenceChange(pref); // Notify parent component
  };

  return (
    <div className="space-y-4">
      {/* Selected Preference Display */}
      {/* {preferences.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div
            className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
          >
            <span>{preferences[0]}</span>
            <button
              onClick={clearPreference}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )} */}

      {/* SKU Preferences */}
      <div>
        <h3 className="text-sm font-medium mb-2">Select Preference</h3>
        <div className="flex flex-wrap gap-2">
          {skuPrefferences?.length > 0 ? (
            skuPrefferences.map((pref) => (
              <button
                key={pref?.Code}
                onClick={() => handlePreferenceSelect(pref?.Name)}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedPreference === pref?.Name
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {pref?.Name } {` (${pref.EnglishName})`}
              </button>
            ))
          ) : (
            <span className="text-sm text-gray-400 text-center">
              --No Preference set on the item--
            </span>
          )}
        </div>
      </div>

      {/* Custom Preference Input */}
     
    </div>
  );
};

export default PackingPreference;
