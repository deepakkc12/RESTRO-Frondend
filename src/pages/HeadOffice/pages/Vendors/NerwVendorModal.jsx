import React, { useEffect, useState } from 'react';
import { useToast } from "../../../../hooks/UseToast";
import { getRequest, postRequest } from "../../../../services/apis/requests";

// Move FormField outside the main component
const FormField = ({ label, name, required, type = "text", value, onChange, error }) => (
  <div className="mb-4">
    <label 
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
        ${error 
          ? 'border-red-500 bg-red-50' 
          : 'border-gray-300'
        }`}
    />
    {error && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const NewVendorModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNo: "",
    mobileNo: "",
    adress: "",
    taxNo: "",
  });
  const toast = useToast();

  const [errors, setErrors] = useState({});
  const [similarVendors, setSimilarVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const save = async (formData) => {
    const response = await postRequest(`vendors/save/`, formData);

    if (response.success) {
      onSave(response.data);
      toast.success("New vendor saved successfully");
     closeModal()
    } else {
      toast.error(response.errors?.[0] || "Failed to save vendor");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobileNo.trim()) newErrors.mobileNo = "Mobile number is required";
    if (!formData.adress.trim()) newErrors.adress = "Address is required";
    if (!formData.taxNo.trim()) newErrors.taxNo = "Tax number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkSimilarVendors = async () => {
    try {
      setIsLoading(true);
      const response = await getRequest(
        `vendors/check-similar?name=${encodeURIComponent(formData.name)}`
      );
      setSimilarVendors(response.data);
      return response.data.length === 0;
    } catch (error) {
      console.error("Error checking similar vendors:", error);
      toast.error("Failed to check for similar vendors");
      return true;
    } finally {
      setIsLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const noSimilarVendors = await checkSimilarVendors();
    if (noSimilarVendors) {
      save(formData);
    }
  };

  const closeModal = ()=>{
    setFormData((prev) => ({
      ...prev,
      name: "",
      phoneNo: "",
      mobileNo: "",
      adress: "",
      taxNo: "",
    }));
    setErrors(() => ({}));
    setSimilarVendors(() => []);
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add New Vendor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <FormField 
            label="Name" 
            name="name" 
            required 
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="Mobile Number" 
              name="mobileNo" 
              required 
              value={formData.mobileNo}
              onChange={handleChange}
              error={errors.mobileNo}
            />
            <FormField 
              label="Phone Number" 
              name="phoneNo" 
              value={formData.phoneNo}
              onChange={handleChange}
              error={errors.phoneNo}
            />
          </div>
          
          <FormField 
            label="Address" 
            name="adress" 
            required 
            value={formData.adress}
            onChange={handleChange}
            error={errors.adress}
          />
          <FormField 
            label="Tax Number" 
            name="taxNo" 
            required 
            value={formData.taxNo}
            onChange={handleChange}
            error={errors.taxNo}
          />

          {/* Similar Vendors Alert */}
          {similarVendors.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Similar vendors found:
              </div>
              <ul className="mt-2 space-y-1">
                {similarVendors.map((vendor, index) => (
                  <li key={index} className="text-sm text-yellow-700">
                    {vendor.Name} - {vendor.MobileNumber}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            {similarVendors.length == 0 ?<button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[5rem]"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "Save"
              )}
            </button>:
            <button
            onClick={()=>{save(formData)}}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[5rem]"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Continue Save"
            )}
          </button>
            
            }
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewVendorModal;