// import { getRequest } from "../../../../services/apis/requests";
// import { Plus, X } from "lucide-react";
// import React, { useEffect, useState } from "react";

// const KotNoteSelection = ({ onPreferenceChange, Prefferences = [] }) => {
//   const [selectedVerb, setSelectedVerb] = useState("");
//   const [selectedPreference, setSelectedPreference] = useState("");
//   const [customPreference, setCustomPreference] = useState("");
//   const [preferences, setPreferences] = useState([]);
//   const [showCustomInput, setShowCustomInput] = useState(false);

//   const [commonNotes, setCommonNotes] = useState([]);
//   const [packingPreferences, setSkuPrefferences] = useState(Prefferences);

//   const getCommonPrefference = async () => {
//     const response = await getRequest("menu/common-prefference-list/");
//     setCommonNotes(response.data);
//   };

//   useEffect(() => {
//     getCommonPrefference();
//   }, []);

//   const handleVerbSelect = (verb) => {
//     setSelectedVerb(verb);
//   };

//   const handlePreferenceSelect = (pref) => {
//     setSelectedPreference(pref);
//     addComma()
//   };

//   const addComma = (pref) => {
//     // if (selectedVerb || selectedPreference) {
//     //   const newPreference = `${selectedVerb} ${selectedPreference}`;
//     //   setPreferences([...preferences, newPreference]);
//     //   setSelectedVerb("");
//     //   setSelectedPreference("");
//     //   onPreferenceChange([...preferences, newPreference]);
//     // }
//     const newPreference = ` ${pref}`;
//       setPreferences([...preferences, newPreference]);
//       setSelectedVerb("");
//       setSelectedPreference("");
//       onPreferenceChange([...preferences, newPreference]);
//   };

//   const handleCustomPreference = () => {
//     if (customPreference.trim()) {
//       setPreferences([...preferences, customPreference.trim()]);
//       setCustomPreference("");
//       setShowCustomInput(false);
//       onPreferenceChange([...preferences, customPreference.trim()]);
//     }
//   };

//   const removePreference = (index) => {
//     const newPreferences = preferences.filter((_, i) => i !== index);
//     setPreferences(newPreferences);
//     onPreferenceChange(newPreferences);
//   };

//   return (
//     <div className="space-y-4">
//       {/* Selected Preferences Display */}
//       {preferences.length > 0 && (
//         <div className="flex flex-wrap gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
//           {preferences.map((pref, index) => (
//             <div
//               key={index}
//               className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
//             >
//               <span>{pref}</span>
//               <button
//                 onClick={() => removePreference(index)}
//                 className="text-red-500 hover:text-red-700"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Common Verbs */}
//       {/* <div>
//         <h3 className="text-sm font-medium mb-2">Select Action</h3>
//         <div className="flex flex-wrap gap-2">
//           {commonNotes?.map((verb) => (
//             <button
//               key={verb?.code}
//               onClick={() => handleVerbSelect(verb?.Description)}
//               className={`px-3 py-1 rounded-md text-sm ${
//                 selectedVerb === verb?.Description
//                   ? "bg-green-500 text-white"
//                   : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//               }`}
//             >
//               {verb?.Description}
//             </button>
//           ))}
//         </div>
//       </div> */}

//       {/* SKU Preferences */}
//       <div>
//         <h3 className="text-sm font-medium mb-2">Select Preference</h3>
//         <div className="flex flex-wrap gap-2">
//           {skuPrefferences?.length > 0 ? (
//             skuPrefferences.map((pref) => (
//               <button
//                 key={pref?.Code}
//                 onClick={() => handlePreferenceSelect(pref?.Name)}
//                 className={`px-3 py-1 rounded-md text-sm ${
//                   selectedPreference === pref?.Details
//                     ? "bg-green-500 text-white"
//                     : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//                 }`}
//               >
//                 {pref?.Details}
//               </button>
//             ))
//           ) : (
//             <span className="text-sm text-gray-400 text-center">
//               --No Preference set on the item--
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex gap-2">
//         {/* <button
//           onClick={addComma}
//           //   disabled={!selectedVerb || !selectedPreference}
//           className={`px-4 w-full py-2 rounded-lg text-white ${
//             selectedVerb || selectedPreference
//               ? "bg-green-500 hover:bg-green-600"
//               : "bg-gray-400 cursor-not-allowed"
//           }`}
//         >
//           Add Preference
//         </button> */}
//         {/* <button
//           onClick={() => setShowCustomInput(!showCustomInput)}
//           className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
//         >
//           Custom
//         </button> */}
//       </div>

//       {/* Custom Preference Input */}
//       {/* {showCustomInput && (
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={customPreference}
//             onChange={(e) => setCustomPreference(e.target.value)}
//             placeholder="Enter custom preference..."
//             className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
//           />
//           <button
//             onClick={handleCustomPreference}
//             disabled={!customPreference.trim()}
//             className={`px-4 py-2 rounded-lg text-white ${
//               customPreference.trim()
//                 ? 'bg-green-500 hover:bg-green-600'
//                 : 'bg-gray-400 cursor-not-allowed'
//             }`}
//           >
//             Add
//           </button>
//         </div>
//       )} */}
//     </div>
//   );
// };

// export default KotNoteSelection;


import { getRequest } from "../../../services/apis/requests";
import { Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";


const KotNoteSelection = ({ onPreferenceChange, packingPreferences=[], Prefferences = [],clearTrigger,selectedList=[] }) => {
  const [selectedVerb, setSelectedVerb] = useState("");
  const [selectedPreference, setSelectedPreference] = useState("");
  const [customPreference, setCustomPreference] = useState("");
  const [preferences, setPreferences] = useState(selectedList);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [commonNotes, setCommonNotes] = useState([]);
  const [skuPrefferences, setSkuPrefferences] = useState(Prefferences);

  const getCommonPrefference = async () => {
    const response = await getRequest("menu/common-prefference-list/");
    setCommonNotes(response.data);
  };

  useEffect(() => {
    getCommonPrefference();
  }, []);

  const handleVerbSelect = (verb) => {
    setSelectedVerb(verb);
  };

  const clearPreference = ()=>{
    setPreferences([])
  }

  useEffect(()=>{
    clearPreference()
  },[clearTrigger])

  const handlePreferenceSelect = (pref) => {
    addComma(pref);
  };

  const addComma = (pref) => {
    let newPreference;
    
    // If there are existing preferences, add a comma before the new one
    if (preferences.length > 0) {
      newPreference = `${pref}`;
    } else {
      newPreference = pref;
    }
    
    setPreferences([...preferences, newPreference]);
    setSelectedVerb("");
    setSelectedPreference("");
    onPreferenceChange([...preferences, newPreference]);
  };

  const handleCustomPreference = () => {
    if (customPreference.trim()) {
      const newPreference = preferences.length > 0 
        ? `, ${customPreference.trim()}`
        : customPreference.trim();
      
      setPreferences([...preferences, newPreference]);
      setCustomPreference("");
      setShowCustomInput(false);
      onPreferenceChange([...preferences, newPreference]);
    }
  };

  const removePreference = (index) => {
    const newPreferences = preferences.filter((_, i) => i !== index);
    setPreferences(newPreferences);
    onPreferenceChange(newPreferences);
  };

  return (
    <div className="space-y-4">
      {/* Selected Preferences Display */}
      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-100  rounded-lg">
          {selectedList.map((pref, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white  px-3 py-1 rounded-full text-sm"
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

      {/* SKU Preferences */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex">Select Food Preference</h3>
        <div className="flex flex-wrap gap-2">
          {skuPrefferences?.length > 0 ? (
            skuPrefferences.map((pref) => (
              <button
                key={pref?.Code}
                onClick={() => handlePreferenceSelect(pref?.Details)}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedPreference === pref?.Details
                    ? "bg-green-500 text-white"
                    : "bg-gray-200  hover:bg-gray-300 "
                }`}
              >
                {pref?.Details}
              </button>
            )
        )
          ) : (
            <span className="text-sm text-gray-400 text-center">
              --No Preference set on the item--
            </span>
          )}
        </div>
      </div>
     {packingPreferences.length>0&& <div>
        <h3 className="text-sm font-medium mb-2">Select Packing Preference</h3>
        <div className="flex flex-wrap gap-2">
          {packingPreferences?.length > 0 ? (
            packingPreferences.map((pref) => (
              <button
                key={pref?.Code}
                onClick={() => handlePreferenceSelect(pref?.Name)}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedPreference === pref?.Name
                    ? "bg-green-500 text-white"
                    : "bg-gray-200  hover:bg-gray-300 "
                }`}
              >
                {pref?.Name } {` (${pref.EnglishName})`}
              </button>
            )
        )
          ) : (
            <span className="text-sm text-gray-400 text-center">
              --No Packing preference found--
            </span>
          )}
        </div>
      </div>}
    </div>
  );
};

export default KotNoteSelection;
