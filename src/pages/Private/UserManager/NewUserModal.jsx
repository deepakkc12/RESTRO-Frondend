import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { postRequest } from '../../../services/apis/requests';
import { useToast } from '../../../hooks/UseToast';

const NewUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    loginCode: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [createdUserPin, setCreatedUserPin] = useState(null);
  const [showSuccessState, setShowSuccessState] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toast = useToast();

  const handleCreateUser = async (userData) => {
    try {
      setIsLoading(true);
      const response = await postRequest("user/new/", userData);

      if (response.success) {
        setCreatedUserPin(response.data.Pin); // Assuming the PIN comes in the response
        setShowSuccessState(true);
        toast.success("User created successfully");
        await onSuccess();
      } else {
        toast.error(`${response.errors[0]}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleCreateUser(formData);
  };

  const handleClose = () => {
    setFormData({ username: '', loginCode: '' });
    setCreatedUserPin(null);
    setShowSuccessState(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {showSuccessState ? 'User Created Successfully' : 'Create New User'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showSuccessState ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="font-medium mb-2">User Login PIN</div>
                <div className="text-2xl font-bold text-blue-600">{createdUserPin}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Please save this PIN. It will be needed for user login.
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login Code
                </label>
                <input
                  type="text"
                  name="loginCode"
                  value={formData.loginCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-white ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewUserModal;