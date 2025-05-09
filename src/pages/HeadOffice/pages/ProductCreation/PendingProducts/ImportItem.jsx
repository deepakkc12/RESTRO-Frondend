import React, { useState, useEffect } from "react";
import { getRequest, postRequest } from "../../../../../services/apis/requests";
import { useToast } from "../../../../../hooks/UseToast";

function ImportItemModal({ isOpen, onClose, item, onSuccess }) {
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [existingBranches, setExistingBranches] = useState([]);

  const toast = useToast();

  const getExistingBranches = async (itemId) => {
    try {
      const response = await getRequest(`menu/get-item-branches/?itemId=${itemId}`);
      if (response.success) {
        // Fixed: Use the response data properly without reassigning branches
        const existingBranchCodes = response.data.map(data => `${data.BranchCode}`);

        console.log(existingBranchCodes)
        setExistingBranches(existingBranchCodes);
      }
    } catch (error) {
      console.error("Error fetching existing branches:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
        console.log(item)
      fetchBranches();
      getExistingBranches(item.code);
    }
  }, [isOpen]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await getRequest("branch/list");
      if (response.success) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedBranches.length === branches.length) {
      setSelectedBranches([]);
    } else {
      // Only select branches that don't already have the item
      const availableBranches = branches
        .filter(branch => !existingBranches.includes(branch.Code))
        .map(branch => branch.Code);
      setSelectedBranches(availableBranches);
    }
  };

  const handleBranchToggle = (branchId) => {
    // Prevent toggling if branch already has the item
    if (existingBranches.includes(branchId)) {
      return;
    }
    
    setSelectedBranches(prev => {
      if (prev.includes(branchId)) {
        return prev.filter(id => id !== branchId);
      } else {
        return [...prev, branchId];
      }
    });
  };

  const handleImport = async () => {
    if (selectedBranches.length === 0) {
      alert("Please select at least one branch");
      return;
    }

    setImporting(true);
    try {
      const response = await postRequest("menu/import-item/", {
        itemId: item.code,
        branchIds: selectedBranches
      });

      if (response.success) {
          toast.success(`Item imported to live`)
        onSuccess();
        onClose();
      } else {
        toast(response.message || "Failed to import item");
      }
    } catch (error) {
      console.error("Error importing item:", error);
      alert("Failed to import item");
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Import Item to Live</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="font-medium text-lg">Item: {item?.item}</h3>
                <p className="text-gray-600">Select branches to import this item to:</p>
              </div>
              
              <div className="mb-4">
                <button 
                  onClick={handleSelectAll}
                  className={`px-4 py-2 rounded-md ${
                    selectedBranches.length === branches.filter(branch => !existingBranches.includes(branch.Code)).length 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {selectedBranches.length === branches.filter(branch => !existingBranches.includes(branch.Code)).length ? 
                    "Deselect All" : "Select All Available"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {branches.map(branch => {
                  const isDisabled = existingBranches.includes(branch.Code);
                  return (
                    <div 
                      key={branch.Code} 
                      className={`border border-gray-200 p-3 rounded ${
                        isDisabled ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <label className={`flex items-center space-x-2 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                        <input
                          type="checkbox"
                          className={`h-5 w-5 rounded focus:ring-blue-500 ${isDisabled ? "text-gray-400" : "text-blue-600"}`}
                          checked={selectedBranches.includes(branch.Code)}
                          onChange={() => handleBranchToggle(branch.Code)}
                          disabled={isDisabled}
                        />
                        <span className={isDisabled ? "text-gray-500" : ""}>
                          {branch.Name}
                          {isDisabled && <span className="ml-2 text-xs text-gray-500 italic">(Already exists)</span>}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
              
              {branches.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No branches available
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport}
            disabled={selectedBranches.length === 0 || importing}
            className={`px-4 py-2 rounded-md ${
              selectedBranches.length === 0 || importing
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {importing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </span>
            ) : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportItemModal;