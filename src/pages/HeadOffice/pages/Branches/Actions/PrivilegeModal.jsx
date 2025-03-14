import { getRequest, postRequest } from "../../../../../services/apis/requests";
import React, { useEffect, useState } from "react";
import { Loader, Plus, Minus } from "lucide-react";
import { useToast } from "../../../../../hooks/UseToast";

const PrivilegeModal = ({ isOpen, onClose, userId, userName }) => {
  const [masterPrivileges, setMasterPrivileges] = useState([]);
  const [userPrivileges, setUserPrivileges] = useState([]);
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
      const masterResponse = await getRequest('user/master-privileges/');
      // Fetch user privileges
      const userResponse = await getRequest(`user/${userId}/user-privileges/`);
      
      const userPrivs = userResponse.data || [];
      setUserPrivileges(userPrivs);
      
      // Filter out privileges that user already has
      const filteredMasterPrivs = (masterResponse.data || []).filter(
        priv => !userPrivs.some(userPriv => userPriv.menuOptionCode === priv.code)
      );
      setMasterPrivileges(filteredMasterPrivs);
    } catch (error) {
      console.error('Error fetching privileges:', error);
    } finally {
      setLoadingMaster(false);
      setLoadingUser(false);
    }
  };

  const handleAddPrivilege = async (privilegeCode) => {
    setActionLoading(true);
    try {
      const response = await postRequest(`user/update-privileges/`, {
        userCode: userId,
        menuOptionCode: privilegeCode
      });
      
      if (response.success) {
        // Update lists after successful addition
        setMasterPrivileges(prev => prev.filter(p => p.code !== privilegeCode));
        const addedPrivilege = masterPrivileges.find(p => p.code === privilegeCode);
        if (addedPrivilege) {
          const userPrivilege = {
            code: response.data,
            menuOptionCode: addedPrivilege.code,
            userCode: userId,
            name: addedPrivilege.name
          };
          setUserPrivileges(prev => [...prev, userPrivilege]);
        }
      } else {
        toast.error('Error adding privilege');
      }
    } catch (error) {
      toast.error('Error adding privilege');
      console.error('Error adding privilege:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePrivilege = async (privilegeCode) => {
    setActionLoading(true);
    console.log(privilegeCode)
    try {
      const response = await postRequest(`user/remove-privileges/`, {
        userCode: userId,
        userMenuOptionCode: privilegeCode
      });
      
      if (response.success) {
        // Update lists after successful removal
        setUserPrivileges(prev => prev.filter(p => p.code !== privilegeCode));
        const removedPrivilege = userPrivileges.find(p => p.code === privilegeCode);
        if (removedPrivilege) {
          const masterPrivilege = {
            code: removedPrivilege.menuOptionCode,
            name: removedPrivilege.name
          };
          setMasterPrivileges(prev => [...prev, masterPrivilege]);
        }
      } else {
        toast.error('Error removing privilege');
      }
    } catch (error) {
      toast.error('Error removing privilege');
      console.error('Error removing privilege:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage Privileges - {userName}</h2>
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
            <h3 className="font-medium mb-4">Available Privileges</h3>
            {loadingMaster ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <ul className="space-y-2">
                {masterPrivileges.map((privilege) => (
                  <li
                    key={privilege.code}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <span>{privilege.name}</span>
                    <button
                      onClick={() => handleAddPrivilege(privilege.code)}
                      disabled={actionLoading}
                      className="p-1 hover:bg-blue-50 rounded text-blue-600"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {!loadingMaster && masterPrivileges.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No available privileges</p>
                )}
              </ul>
            )}
          </div>

          {/* User Privileges */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">User Privileges</h3>
            {loadingUser ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <ul className="space-y-2">
                {userPrivileges.map((privilege) => (
                  <li
                    key={privilege.code}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <span>{privilege.name}</span>
                    <button
                      onClick={() => handleRemovePrivilege(privilege.code)}
                      disabled={actionLoading}
                      className="p-1 hover:bg-red-50 rounded text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {!loadingUser && userPrivileges.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No assigned privileges</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivilegeModal;