import React, { useState, useEffect } from 'react';
import { getRequest, postRequest } from '../../../../services/apis/requests';
import { useDispatch, useSelector } from 'react-redux';
import { changeBranch } from '../../../../redux/Authentication/action';
import { useToast } from '../../../../hooks/UseToast';

const BranchSelectionModal = ({ isOpen, onClose, onBranchSelect }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [updating, setUpdating] = useState(false);

  const {user} = useSelector(state=>state.auth)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        // Replace with your actual API endpoint
        const response = await getRequest(`user/${user.code}/assigned-branches/`);
        // if (!response.ok) throw new Error('Failed to fetch branches');
        // const data = await response.json();
        if(response.success){

            setBranches(response.data);
        }else{
            setBranches([])
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  const dispatch = useDispatch()

  const toast = useToast()

  const handleUpdate = async () => {
    if (!selectedBranch) return;

    try {
      setUpdating(true);
      // Replace with your actual update API endpoint

      const response = await postRequest(`user/${user.code}/update-branch/`, {
      branchCode:selectedBranch.BranchCode
      });

    //   if (!response.ok) throw new Error('Failed to update branch');
      if(response.success){
        dispatch(changeBranch(selectedBranch.Code,selectedBranch.BranchName))
        toast.success("Branch updated successfully")
      }
      onBranchSelect(selectedBranch);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Branch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          /* Branch Grid */
          branches.length>0?<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {branches.map((branch) => (
            <button
              key={branch.Code}
              onClick={() => setSelectedBranch(branch)}
              className={`p-4 rounded-lg border transition-all ${
                selectedBranch?.Code === branch.Code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900">
                {branch.BranchName}
              </h3>
            </button>
          ))}
        </div>:<h3 className="text-lg text-center py-4 text-gray-900">
              No branches found
              </h3>
        )}

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={!selectedBranch || updating}
            className={`px-4 py-2 rounded-lg text-white min-w-[100px] flex items-center justify-center
              ${!selectedBranch || updating
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {updating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Update'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchSelectionModal;