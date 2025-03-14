import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle } from 'lucide-react';
import { getRequest, postRequest } from '../../../services/apis/requests';
import { Currency } from '../../../utils/constants';
import { useToast } from '../../../hooks/UseToast';

const InvoiceFormModal = ({ 
  isOpen, 
  onClose, 
  isEditable = false, 
  defaultValues = null,
  onSubmit = () => {}
}) => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVendorList, setShowVendorList] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [submiting,setSubmiting] = useState(false)
  const [formData, setFormData] = useState({
    vendorCode: '',
    vendorName: '',
    taxNumber: '',
    invoiceNumber: '',
    invoiceDate: '',
    taxableAmount: '',
    tax: '',
    charges: '',
    discount: '',
    cash: '',
    credit: '',
    date:'',
    dueDate:null
  });

  const toast = useToast();

  useEffect(() => {
    const getVendors = async () => {
      const response = await getRequest('vendors/list/');
      if (response.success) {
        setVendors(response.data);
      }
    };
    getVendors();
  }, []);

  useEffect(() => {
    if (defaultValues && !isEditable) {
      setFormData(defaultValues);
      if (defaultValues.vendorCode && defaultValues.vendorName) {
        setSelectedVendor({
          code: defaultValues.vendorCode,
          name: defaultValues.vendorName
        });
      }
    }
  }, [defaultValues, isEditable]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedVendor) {
      newErrors.vendor = "Vendor selection is required";
    }
    if (!formData.invoiceNumber?.trim()) {
      newErrors.invoiceNumber = "Invoice number is required";
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = "Invoice date is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.taxNumber) {
      newErrors.taxNumber = "Tax Number is required";
    }
    if (calculateBalanceAmount() < 0) {
      newErrors.payment = "Total payments cannot exceed invoice amount";
    }
    if (calculateBalanceAmount() > 0) {
      newErrors.payment = "Remaining balance must be fully paid.";
    }
    const firstErrorKey = Object.keys(newErrors)[0]; // Get the first error key
    if (firstErrorKey) {
      toast.error(newErrors[firstErrorKey]); // Display the corresponding error message
    }
    // setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.credit >0 && formData.dueDate == null){
      toast.error("Due Date is required")
      return
    }

    if(!validateForm()){
      return
    }
    setSubmiting(true)
    const body = { ...formData, vendorCode: selectedVendor.Code };

    console.log(body)
    const response = await postRequest("inward/save/", body);
    if (response.success) {
      toast.success("Inward saved");
      onSubmit({...response.data,VendorName:selectedVendor.Name});
      onClose();
    } else {
      toast.error("Failed to save inward");
    }
    setSubmiting(false)
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredVendors = vendors?.filter(vendor =>
    vendor.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.Code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setFormData(prev => ({
      ...prev,
      vendorCode: vendor.Code,
      vendorName: vendor.Name
    }));
    setShowVendorList(false);
    setSearchTerm('');
  };

  const calculateTotalAmount = () => {
    return Number(formData.taxableAmount) + Number(formData.tax) + Number(formData.charges) - Number(formData.discount);
  };

  const calculateBalanceAmount = () => {
    return calculateTotalAmount()  - Number(formData.cash) - Number(formData.credit);
  };
  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const buttonClass = "px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditable ? 'Edit Invoice' : 'New Invoice'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-6 py-4 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vendor Selection */}
              <div className="max-w-md mb-6">
                <label className={labelClass}>Select Vendor</label>
                {selectedVendor ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                    <div>
                      <div className="font-medium text-blue-900">{selectedVendor.Name}</div>
                      <div className="text-sm text-blue-700">Code: {selectedVendor.Code}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedVendor(null)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowVendorList(true);
                      }}
                      onFocus={() => setShowVendorList(true)}
                      placeholder="Search vendors by name or code..."
                      className={`${inputClass} pr-10`}
                    />
                    <Search className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                    
                    {showVendorList && filteredVendors.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-64 overflow-y-auto">
                        {filteredVendors?.map(vendor => (
                          <div
                            key={vendor.Code}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                            onClick={() => handleVendorSelect(vendor)}
                          >
                            <div>
                              <div className="font-medium">{vendor.Name}</div>
                              <div className="text-sm text-gray-600">Code: {vendor.Code}</div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Main Form Content */}
              <div className="grid grid-cols-4 gap-6">
                {/* Invoice Details Row */}
                <div>
                  <label className={labelClass}>Tax Number</label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    name="date"
                    max={today}
                    value={formData.date}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Invoice Date</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    max={today}
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Amount Details and Totals */}
              <div className="grid grid-cols-4 gap-6">
                {/* Left Section - Amount Details */}
                <div className="col-span-3 grid grid-cols-2 gap-6">
                  {/* First Row */}
                  <div>
                    <label className={labelClass}>Taxable Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">{Currency}</span>
                      <input
                        type="number"
                        name="taxableAmount"
                        value={formData.taxableAmount}
                        onChange={handleInputChange}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Tax</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">{Currency}</span>
                      <input
                        type="number"
                        name="tax"
                        value={formData.tax}
                        onChange={handleInputChange}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  {/* Second Row */}
                  <div>
                    <label className={labelClass}>Additional Charges</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">{Currency}</span>
                      <input
                        type="number"
                        name="charges"
                        value={formData.charges}
                        onChange={handleInputChange}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Discount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">{Currency}</span>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        disabled={!isEditable && defaultValues}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Section - Total Amount */}
                <div className="col-span-1">
                  <div className="bg-blue-50 rounded-lg p-4 h-full flex flex-col justify-center">
                    <div className="text-sm font-medium text-blue-800 mb-1">Total Amount</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {Currency}{calculateTotalAmount().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="grid grid-cols-4 gap-6">
                {/* Left Section - Payment Inputs */}
                <div className="col-span-3 grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Cash Payment</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">{Currency}</span>
                      <input
                        type="number"
                        name="cash"
                        value={formData.cash}
                        onChange={handleInputChange}
                        disabled={!isEditable && defaultValues}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div className='flex gap-2'>
                  <div>
                    <label className={labelClass}>Credit Payment</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">{Currency}</span>
                      <input
                        type="number"
                        name="credit"
                        value={formData.credit}
                        onChange={handleInputChange}
                        disabled={!isEditable && defaultValues}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                   
                  </div>
                  <div>
                  <label className={labelClass}>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    
                    min={today}
                    disabled = {(!formData.credit ||formData.credit ==0 )}
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                  </div>
                </div>

                {/* Right Section - Balance Amount */}
                <div className="col-span-1">
                  <div className="bg-blue-50 rounded-lg p-4 h-full flex flex-col justify-center">
                    <div className="text-sm font-medium text-blue-800 mb-1">Balance Due</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {Currency}{calculateBalanceAmount().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`${buttonClass} border border-gray-300 hover:bg-gray-50 text-gray-700`}
                >
                  Cancel
                </button>
                <button
      type="submit"
      disabled={!selectedVendor || submiting}
      className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={handleSubmit}
    >
      {submiting ? (
        <span className="flex items-center">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Saving...
        </span>
      ) : (
        "Save Invoice"
      )}
    </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormModal;