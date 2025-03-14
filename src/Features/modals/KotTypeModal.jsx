// import React from "react";
// import { X } from "lucide-react";

// const KotTypeModal = ({ kotTypes, selectedKotType, setSelectedKotType, onClose, onProceed }) => {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="relative w-auto max-w-3xl mx-auto my-6 shadow-lg">
//         <div className="relative flex flex-col w-full bg-white rounded-lg shadow-lg">
//           {/* Header */}
//           <div className="flex items-start justify-between p-5 border-b border-gray-200">
//             <h3 className="text-3xl font-semibold">Take new order</h3>
//             <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           {/* Content */}
//           <div className="p-6">
//             <p className="mb-4">Please select a Kitchen Order Type to proceed:</p>
//             <div className="grid grid-cols-2 gap-4">
//               {kotTypes.map((kotType) => (
//                 <button
//                   key={kotType.Code}
//                   onClick={() => setSelectedKotType(kotType)}
//                   className={`p-4 rounded-lg text-center ${
//                     selectedKotType?.Code === kotType.Code ? "bg-blue-600 text-white" : "bg-gray-200"
//                   }`}
//                 >
//                   {kotType.Name}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex items-center justify-end p-6 border-t border-gray-200">
//             <button className="px-6 py-2 text-gray-600" onClick={onClose}>
//               Close
//             </button>
//             <button
//               className={`px-6 py-2 text-white rounded ${
//                 selectedKotType ? "bg-blue-500" : "bg-gray-400 cursor-not-allowed"
//               }`}
//               onClick={onProceed}
//               disabled={!selectedKotType}
//             >
//               Proceed
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default KotTypeModal;
