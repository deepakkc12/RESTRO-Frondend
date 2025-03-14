import { getRequest, postRequest } from "../../../../../services/apis/requests";
import React, { useEffect, useState } from "react";
import { Loader, Plus, Minus } from "lucide-react";
import { useToast } from "../../../../../hooks/UseToast";

const BranchAssignModal = ({ isOpen, onClose, userId, userName }) => {
  const [masterBranches, setMasterBranches] = useState([]);
  const [userBranches, setUserBranches] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPrivileges();
    }
  }, [isOpen]);

  const toast = useToast();
  
  const fetchPrivileges = async () => {
    setLoadingMaster(true);
    setLoadingUser(true);
    try {
      // Fetch master privileges
      const masterResponse = await getRequest('branch/list/');
      // Fetch user privileges
      const userResponse = await getRequest(`user/${userId}/assigned-branches/`);
      
      const userBranches = userResponse.data || [];
      setUserBranches(userBranches);
      
      // Filter out privileges that user already has
      const filteredMasterBranches = (masterResponse.data || []).filter(
        branch => !userBranches.some(userbranch => userbranch.BranchCode == branch.Code)
      );
      setMasterBranches(filteredMasterBranches);
    } catch (error) {
      console.error('Error fetching privileges:', error);
    } finally {
      setLoadingMaster(false);
      setLoadingUser(false);
    }
  };

  const handleAddPrivilege = async (branchCOde) => {
    setActionLoading(true);
    try {
      const response = await postRequest(`user/assign-new-branch/`, {
        userCode: userId,
        branchCode: branchCOde
      });
      
      if (response.success) {
        // Update lists after successful addition
        setMasterBranches(prev => prev.filter(p => p.Code !== branchCOde));
        const addedBranch = masterBranches.find(p => p.Code === branchCOde);
        if (addedBranch) {
          const userBranch = {
           BranchName : addedBranch.Name,
           Code:response.data.Code
          };
          setUserBranches(prev => [...prev, userBranch]);
        }
      } else {
        toast.error('Error adding branch');
      }
    } catch (error) {
      toast.error('Error adding branch');
      console.error('Error adding branch:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePrivilege = async (userbranchCOde) => {
    setActionLoading(true);
    // console.log(branchCOde)
    try {
      const response = await postRequest(`user/remove-assigned-branch/`, {
       userBranchCode:userbranchCOde
      });
      
      if (response.success) {
        // Update lists after successful removal
        setUserBranches(prev => prev.filter(p => p.Code !== userbranchCOde));
        const removedPrivilege = userBranches.find(p => p.Code === userbranchCOde);
        if (removedPrivilege) {
          const masterPrivilege = {
            Code: removedPrivilege.BranchCode,
            Name: removedPrivilege.BranchName
          };
          setMasterBranches(prev => [...prev, masterPrivilege]);
        }
      } else {
        toast.error('Error removing branch');
      }
    } catch (error) {
      toast.error('Error removing branch');
      console.error('Error removing branch:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage user branches - {userName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Available Privileges */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Available Branches</h3>
            {loadingMaster ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-500" />
              </div>
        ) : (
              <ul className="space-y-2">
                {masterBranches.map((branch) => (
                  <li
                    key={branch.Code}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <span>{branch.Name}</span>
                    <button
                      onClick={() => handleAddPrivilege(branch.Code)}
                      disabled={actionLoading}
                      className="p-1 hover:bg-blue-50 rounded text-blue-600"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {!loadingMaster && masterBranches.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No available Branches</p>
                )}
              </ul>
            )}
          </div>

          {/* User Privileges */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">User Branches</h3>
            {loadingUser ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <ul className="space-y-2">
                {userBranches.map((userBranch) => (
                  <li
                    key={userBranch.Code}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <span>{userBranch.BranchName}</span>
                    <button
                      onClick={() => handleRemovePrivilege(userBranch.Code)}
                      disabled={actionLoading}
                      className="p-1 hover:bg-red-50 rounded text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {!loadingUser && userBranches.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No assigned Braches</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchAssignModal;