import { useToast } from "../../../hooks/UseToast";
import { getRequest, patchRequest } from "../../../services/apis/requests";
import { Currency } from "../../../utils/constants";
import PaymentListModal from "./PaymentList";
import { CheckCircle, Cross, Search, X, AlertCircle } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";

const EditInwardDetail = ({
  onStatusUpdate,
  isOpen,
  onClose,
  defaultValues = null,
  onSuccessUpdate,
}) => {
  // State Management
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showVendorList, setShowVendorList] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [openPaymentModal, setOpenPaymentMOdal] = useState(false);

  const [formData, setFormData] = useState({
    VendorCode: "",
    VendorName: "",
    TaxNumber: "",
    InvoiceNumber: "",
    InvoiceDate: "",
    TaxableAmount: "",
    Tax: "",
    Charges: "",
    Discount: "",
    Cash: "",
    Credit: "",
    BranchCode: "",
    Code: "",
    PayableAmount: "",
    InventoryValue: "",
    DOT: "",
    DueDate: "",
    TOT: "",
    LoginId: "",
    sortSlno: "",
  });


  const [initailDueDate,setInitialDueDate] = useState(defaultValues.DueDate)


  const [status, setStatus] = useState({
    completed: false,
    paymentSettled: false,
    submitToAudit: false,
    auditedBy: "",
    closed: false,
  });

  const toast = useToast();
  // toast.success(initailDueDate)

  const onSubmit = async (body) => {
    const response = await patchRequest(
      `inward/${defaultValues.Code}/update/`,
      body
    );
    if (response.success) {
      toast.success("updated succefully");
      onSuccessUpdate({ ...response.data, VendorName: selectedVendor.Name });
      onClose();
    } else {
      toast.error("Updation failed");
    }
  };

  // Fetch vendors on component mount
  useEffect(() => {
    const loadVendors = async () => {
      setLoading(true);
      try {
        const response = await getRequest("vendors/list/");
        if (response.success) {
          setVendors(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
        setErrors((prev) => ({ ...prev, vendor: "Failed to load vendors" }));
      } finally {
        setLoading(false);
      }
    };
    loadVendors();
  }, []);

  // Handle default values
  useEffect(() => {
    if (defaultValues) {
      const processedData = {
        ...defaultValues,
        TaxableAmount: parseFloat(defaultValues.TaxableAmount) || 0,
        Tax: parseFloat(defaultValues.Tax) || 0,
        Charges: parseFloat(defaultValues.Charges) || 0,
        Discount: parseFloat(defaultValues.Discount) || 0,
        Cash: parseFloat(defaultValues.Cash) || 0,
        Credit: parseFloat(defaultValues.Credit) || 0,
        PayableAmount: parseFloat(defaultValues.PayableAmount) || 0,
      };

      setFormData(processedData);
      if (defaultValues.VendorCode && defaultValues.VendorName) {
        handleVendorSelect({
          Code: defaultValues.VendorCode,
          Name: defaultValues.VendorName,
        });
      }

      setStatus({
        completed: defaultValues.Completed == 1,
        paymentSettled: defaultValues.PaymentSettled == 1,
        submitToAudit: defaultValues.SubmitToAudit == 1,
        auditedBy: defaultValues.AuditedBy || "",
        closed: defaultValues.Closed == 1,
      });
    }

    setInitialDueDate(defaultValues.DueDate)
  }, [defaultValues]);

  // Computed values
  const totalAmount = useMemo(() => {
    const taxable = parseFloat(formData.TaxableAmount) || 0;
    const tax = parseFloat(formData.Tax) || 0;
    const charges = parseFloat(formData.Charges) || 0;
    const discount = parseFloat(formData.Discount) || 0;

    return taxable + tax + charges - discount;
  }, [formData.TaxableAmount, formData.Tax, formData.Charges]);

  const balanceAmount = useMemo(() => {
    const cash = parseFloat(formData.Cash) || 0;
    const credit = parseFloat(formData.Credit) || 0;
    
    return totalAmount -  cash - credit;
  }, [totalAmount, formData.Discount, formData.Cash, formData.Credit]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!selectedVendor) {
      newErrors.vendor = "Vendor selection is required";
    }
    if (!formData.InvoiceNumber?.trim()) {
      newErrors.InvoiceNumber = "Invoice number is required";
    }
    if (!formData.InvoiceDate) {
      newErrors.InvoiceDate = "Invoice date is required";
    }
    if (balanceAmount < 0) {
      newErrors.payment = "Total payments cannot exceed invoice amount";
    }
    if (balanceAmount > 0) {
      newErrors.payment = "Remaining balance must be fully paid.";
    }
    const firstErrorKey = Object.keys(newErrors)[0]; // Get the first error key
    if (firstErrorKey) {
      toast.error(newErrors[firstErrorKey]); // Display the corresponding error message
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Event handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
     
      return;
    }
  
    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors((prev) => ({ ...prev, submit: "Failed to save invoice" }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (status.completed && name !== "DueDate") return;

    const numericFields = [
      "TaxableAmount",
      "Tax",
      "Charges",
      "Discount",
      "Cash",
      "Credit",
    ];
    const processedValue = numericFields.includes(name)
      ? parseFloat(value)
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleStatusUpdate = async (statusType) => {
    if (statusType === "paymentSettled") {
      setOpenPaymentMOdal(true);
    }

    // Validate before status update
    if (statusType === "completed" && !validateForm()) return;

    if (statusType === "completed") {
      const response = await patchRequest(
        `inward/${defaultValues.Code}/complete/`
      );
      if (response.success) {
        setStatus((prev) => ({
          ...prev,
          [statusType]: true,
        }));
        onStatusUpdate("Completed", defaultValues.Code);
      }
    }
    if (statusType == "submitToAudit") {
      const response = await patchRequest(
        `inward/${defaultValues.Code}/submit-to-audit/`
      );
      if (response.success) {
        setStatus((prev) => ({
          ...prev,
          [statusType]: true,
        }));
        onStatusUpdate("SubmitToAudit", defaultValues.Code);
      }
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setFormData((prev) => ({
      ...prev,
      VendorCode: vendor.Code,
      VendorName: vendor.Name,
    }));
    setShowVendorList(false);
    setSearchTerm("");

    // Clear vendor error if exists
    if (errors.vendor) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.vendor;
        return newErrors;
      });
    }
  };

  const handleManagePayments = () => {
    setOpenPaymentMOdal(true);
  };

  const markPaymentSettled = () => {
    setStatus((prev) => ({
      ...prev,
      paymentSettled: true,
    }));
    onStatusUpdate("PaymentSettled", defaultValues.Code);
  };
  const today = new Date().toISOString().split("T")[0];

  // useEffect(()=>{
  //   toast.success(formData.DueDate, initailDueDate)
  // },[formData,initailDueDate])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              {status.completed ? "View Invoice" : "Edit Invoice"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Error Banner */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Status Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h3 className="font-semibold text-gray-800 text-lg">
                  Invoice Status
                </h3>
                {status.completed && (
                  <button
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    onClick={handleManagePayments} // Add your function for managing payments here
                  >
                    Manage Payments
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "completed", label: "Post Accounts" },
                  { key: "paymentSettled", label: "Payment Settled" },
                  { key: "submitToAudit", label: "Submit to HO" },
                ].map(({ key, label }) => (
                  <div key={key} className="text-center">
                    <div className="mb-3 text-sm font-medium text-gray-600">
                      {label}
                    </div>
                    {status[key] ? (
                      <div className="text-green-500 flex justify-center">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(key)}
                        disabled={
                          (key === "paymentSettled" && !status.completed) ||
                          (key === "submitToAudit" && !status.paymentSettled)
                        }
                        className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                      >
                        {key == "paymentSettled"
                          ? "Manage payments to settle"
                          : key == "submitToAudit"
                          ? "Submit"
                          : "Post Account"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Vendor Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vendor
                    {errors.vendor && (
                      <span className="text-red-500 ml-2">{errors.vendor}</span>
                    )}
                  </label>

                  {selectedVendor ? (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-900">
                            {selectedVendor.Name}
                          </div>
                          <div className="text-sm text-blue-700">
                            Code: {selectedVendor.Code}
                          </div>
                        </div>
                        {!status.completed && (
                          <button
                            type="button"
                            onClick={() => setSelectedVendor(null)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Change
                          </button>
                        )}
                      </div>
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
                        placeholder="Search vendors..."
                        className="w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Search className="absolute right-3 top-2 h-5 w-5 text-gray-400" />

                      {showVendorList && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-64 overflow-y-auto">
                          {loading ? (
                            <div className="p-4 text-center text-gray-500">
                              Loading vendors...
                            </div>
                          ) : vendors.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No vendors found
                            </div>
                          ) : (
                            vendors
                              .filter(
                                (v) =>
                                  v.Name.toLowerCase().includes(
                                    searchTerm.toLowerCase()
                                  ) ||
                                  v.Code.toLowerCase().includes(
                                    searchTerm.toLowerCase()
                                  )
                              )
                              .map((vendor) => (
                                <div
                                  key={vendor.Code}
                                  onClick={() => handleVendorSelect(vendor)}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                >
                                  <div className="font-medium">
                                    {vendor.Name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Code: {vendor.Code}
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount Summary Cards */}
                {/* <div className="flex"> */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-800 mb-1">
                          Total Amount
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {Currency}
                          {totalAmount.toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-800 mb-1">
                          Balance Due
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {Currency}
                          {balanceAmount.toFixed(2)}
                        </div>
                        {balanceAmount < 0 && (
                          <div className="text-red-500 text-sm mt-1">
                            Payment exceeds invoice amount
                          </div>
                        )}
                      </div>
                    {/* </div> */}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Invoice Details */}
                <div className="space-y-4 col-span-2">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Invoice Details
                  </h3>
                  <div></div>
                  <div className="flex gap-4 justify-between">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Number
                      </label>
                      <input
                        type="text"
                        name="TaxNumber"
                        value={formData.TaxNumber}
                        onChange={handleInputChange}
                        disabled={status.completed}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Number
                        {errors.InvoiceNumber && (
                          <span className="text-red-500 text-sm ml-2">
                            {errors.InvoiceNumber}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="InvoiceNumber"
                        value={formData.InvoiceNumber}
                        onChange={handleInputChange}
                        disabled={status.completed}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                        {errors.InvoiceDate && (
                          <span className="text-red-500 text-sm ml-2">
                            {errors.InvoiceDate}
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        name="InvoiceDate"
                        value={formData.InvoiceDate}
                        onChange={handleInputChange}
                        disabled={status.completed}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Date
                        {errors.DOT && (
                          <span className="text-red-500 text-sm ml-2">
                            {errors.DOT}
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        name="DOT"
                        value={formData.DOT}
                        onChange={handleInputChange}
                        disabled={status.completed}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                        {errors.DueDate && (
                          <span className="text-red-500 text-sm ml-2">
                            {errors.DueDate}
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        name="DueDate"
                        min={today}
                        value={formData.DueDate}
                        onChange={handleInputChange}
                        // disabled={status.completed}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Amount Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {["TaxableAmount", "Tax", "Charges", "Discount"].map(
                      (field) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.replace(/([A-Z])/g, " $1").trim()}
                          </label>
                          <div className="relative">
                            <span className="absolute left-1 top-2 text-gray-500">
                              {Currency}
                            </span>
                            <input
                              type="number"
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                              disabled={status.completed}
                              className="w-full pl-8 pr-4 py-2 border rounded-lg disabled:bg-gray-100"
                              step="0.01"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Payment Details
                  </h3>
                  <div className="flex gap-4  ">
                    <div className="w-full space-y-4 gap-4">
                      {["Cash", "Credit"].map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.replace(/([A-Z])/g, " $1").trim()}
                          </label>
                          <div className="relative">
                            <span className="absolute left-1 top-2 text-gray-500">
                              {Currency}
                            </span>
                            <input
                              type="number"
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                              disabled={status.completed}
                              className="w-full pl-8 pr-4 py-2 border rounded-lg disabled:bg-gray-100"
                              step="0.01"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="w-3/4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-800 mb-1">
                          Total Amount
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {Currency}
                          {totalAmount.toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-800 mb-1">
                          Balance Due
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {Currency}
                          {balanceAmount.toFixed(2)}
                        </div>
                        {balanceAmount < 0 && (
                          <div className="text-red-500 text-sm mt-1">
                            Payment exceeds invoice amount
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {(!status?.completed || formData.DueDate !== initailDueDate) && (
                <div className="sticky bottom-0 bg-white border-t mt-8 -mx-6 -mb-6 px-6 py-4 flex justify-end items-center">
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? "Saving..." : "Update Invoice"}
                    </button>
                    {/* <button
                      type="button"
                      disabled={loading}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      onClick={() => {
                        // Handle add payment logic
                      }}
                    >
                      Add Payment
                    </button> */}
                  </div>
                  <button
                  
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <PaymentListModal
        isSettled={defaultValues.PaymentSettled}
        onPaymentSettled={markPaymentSettled}
        totalPayableAmount={defaultValues.PayableAmount || 0}
        creditAmount={defaultValues.Credit || 0}
        InwardCode={defaultValues.Code}
        isOpen={openPaymentModal}
        onClose={() => {
          setOpenPaymentMOdal(false);
        }}
      />
    </div>
  );
};

export default EditInwardDetail;
