import HomeHeader from "../../../components/Headers/HomeHeader";
import printerService from "../../../Features/Printers/CloseRecieptPritService";
import { useToast } from "../../../hooks/UseToast";
import { logout } from "../../../redux/Authentication/action";
import { postRequest } from "../../../services/apis/requests";
import { Currency } from "../../../utils/constants";
import { Loader2, User } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PendingOrdersModal from "./PendingOrdersModal";

const CounterClosekeys = ({ onChange, onEnter }) => {
  const buttonClass =
    "w-14 h-12 m-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg shadow active:bg-gray-300 transition-colors";
  const actionButtonClass =
    "w-14 h-12 m-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-lg shadow active:bg-blue-300 transition-colors";

  const handleKeyPress = (value) => {
    if (onChange) {
      onChange(value);
    }
    if (value === "enter" && onEnter) {
      onEnter();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={() => handleKeyPress("1")}
            className={buttonClass}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("2")}
            className={buttonClass}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("3")}
            className={buttonClass}
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("4")}
            className={buttonClass}
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("5")}
            className={buttonClass}
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("backspace")}
            className={actionButtonClass}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("clear")}
            className={actionButtonClass}
          >
            Clear
          </button>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => handleKeyPress("6")}
            className={buttonClass}
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("7")}
            className={buttonClass}
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("8")}
            className={buttonClass}
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("9")}
            className={buttonClass}
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className={buttonClass}
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress(".")}
            className={actionButtonClass}
          >
            .
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("enter")}
            className={actionButtonClass}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};

const CloseCounter = () => {
  const [formData, setFormData] = useState({
    cashAmount: "",
    cardAmount: "",
    touchNgoAmount: "",
    bankQrAmount: "",
    numberOfBills: "",
    purchaseAmount: "",
    creditAmount: "",
  });

  const inputRefs = {
    cashAmount: useRef(),
    cardAmount: useRef(),
    touchNgoAmount: useRef(),
    bankQrAmount: useRef(),
    numberOfBills: useRef(),
    purchaseAmount: useRef(),
    creditAmount: useRef(),
  };

  const { user } = useSelector((state) => state.auth);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("cashAmount");

  const [showPendingOrdersModal, setShowPendingOrdersModal] = useState(false);



  const handleProceedToClose = () => {
    setShowPendingOrdersModal(false);
    setShowConfirmModal(true);
  };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleInputChange = (e, fieldName = null) => {
    const name = fieldName || e.target?.name;
    const value = e.target?.value ?? e;

    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (value && (parseFloat(value) < 0 || isNaN(value))) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Please enter a positive number",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputFocus = (fieldName) => {
    setFocusedField(fieldName);
    inputRefs[fieldName].current?.focus();
  };

  const handleKeyboardInput = (value) => {
    if (!focusedField) return;

    const currentValue = formData[focusedField] || "";

    let newValue = currentValue;
    if (value === "backspace") {
      newValue = currentValue.slice(0, -1);
    } else if (value === "clear") {
      newValue = "";
    } else if (value === "enter") {
      const fields = Object.keys(inputRefs);
      const currentIndex = fields.indexOf(focusedField);
      const nextField = fields[(currentIndex + 1) % fields.length];
      handleInputFocus(nextField);
      return;
    } else if (value === "." && currentValue.includes(".")) {
      return;
    } else {
      newValue = currentValue + value;
    }

    handleInputChange(newValue, focusedField);
  };

  const onConfirm = async () => {
    setIsLoading(true);
    const body = {
      cash: formData.cashAmount,
      card: formData.cardAmount,
      wallet1: formData.bankQrAmount,
      wallet2: formData.touchNgoAmount,
      purchaseAmount: formData.purchaseAmount,
      creditPurchase: formData.creditAmount,
      purchaseBillNo: formData.numberOfBills,
    };

    // await printerService.connect();
    try {
      const response = await postRequest("close-counter/", body);
      if (response.success) {
        // await PrinterService.printReceipt(formData, user);

        console.log(response.data)

        try {
    
    // Then print the receipt
      await printerService.printReceipt(response.data, user);
          toast.success("Shift closed and receipt printed");
        } catch (printError) {
          toast.error(`Printing failed: ${printError.message}`);
          return
        }
        dispatch(logout());
        navigate("/login");
      }
    } catch (error) {
      toast.error("Error closing shift");
    }
    setIsLoading(false);
  };

  const calculateTotal = () => {
    const values = [
      "cashAmount",
      "cardAmount",
      "touchNgoAmount",
      "bankQrAmount",
    ].map((key) => parseFloat(formData[key]) || 0);
    return values.reduce((sum, val) => sum + val, 0).toFixed(2);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        newErrors[key] = "This field is required";
        isValid = false;
      } else if (parseFloat(value) < 0 || isNaN(value)) {
        newErrors[key] = "Please enter a positive number";
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowPendingOrdersModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HomeHeader />

      <div className="mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Shift Closing
          </h1>
          <button className="flex items-center gap-2 ml-2">
            <div className="hidden md:block text-left">
              <p className="text-lg font-semibold text-gray-800">
                {user?.username}
              </p>
              <p className="text-sm font-semibold text-gray-500">
                {user.branchName}
              </p>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Sales Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Sales Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cash Amount
                  </label>
                  <input
                    ref={inputRefs.cashAmount}
                    type="text"
                    name="cashAmount"
                    value={formData.cashAmount}
                    onChange={handleInputChange}
                    onFocus={() => handleInputFocus("cashAmount")}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.cashAmount
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter cash amount"
                    readOnly
                  />
                  {/* {errors.cashAmount && (
                    <p className="mt-1 text-sm text-red-500">{errors.cashAmount}</p>
                  )} */}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Card Amount
                  </label>
                  <input
                    ref={inputRefs.cardAmount}
                    type="text"
                    name="cardAmount"
                    value={formData.cardAmount}
                    onChange={handleInputChange}
                    onFocus={() => handleInputFocus("cardAmount")}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.cardAmount
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter card amount"
                    readOnly
                  />
                  {/* {errors.cardAmount && (
                    <p className="mt-1 text-sm text-red-500">{errors.cardAmount}</p>
                  )} */}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Touch 'n Go
                  </label>
                  <input
                    ref={inputRefs.touchNgoAmount}
                    type="text"
                    name="touchNgoAmount"
                    value={formData.touchNgoAmount}
                    onChange={handleInputChange}
                    onFocus={() => handleInputFocus("touchNgoAmount")}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.touchNgoAmount
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter Touch 'n Go amount"
                    readOnly
                  />
                  {/* {errors.touchNgoAmount && (
                    <p className="mt-1 text-sm text-red-500">{errors.touchNgoAmount}</p>
                  )} */}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank QR
                  </label>
                  <input
                    ref={inputRefs.bankQrAmount}
                    type="text"
                    name="bankQrAmount"
                    value={formData.bankQrAmount}
                    onChange={handleInputChange}
                    onFocus={() => handleInputFocus("bankQrAmount")}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.bankQrAmount
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter Bank QR amount"
                    readOnly
                  />
                  {/* {errors.bankQrAmount && (
                    <p className="mt-1 text-sm text-red-500">{errors.bankQrAmount}</p>
                  )} */}
                </div>
              </div>
            </div>
          </div>

          {/* Inward Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Inward Details
            </h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Bills
                </label>
                <input
                  ref={inputRefs.numberOfBills}
                  type="text"
                  name="numberOfBills"
                  value={formData.numberOfBills}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus("numberOfBills")}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.numberOfBills
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter number of bills"
                  readOnly
                />
                {/* {errors.numberOfBills && (
                  <p className="mt-1 text-sm text-red-500">{errors.numberOfBills}</p>
                )} */}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Amount
                </label>
                <input
                  ref={inputRefs.purchaseAmount}
                  type="text"
                  name="purchaseAmount"
                  value={formData.purchaseAmount}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus("purchaseAmount")}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.purchaseAmount
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter purchase amount"
                  readOnly
                />
                {/* {errors.purchaseAmount && (
                  <p className="mt-1 text-sm text-red-500">{errors.purchaseAmount}</p>
                )} */}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Credit Amount
                </label>
                <input
                  ref={inputRefs.creditAmount}
                  type="text"
                  name="creditAmount"
                  value={formData.creditAmount}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus("creditAmount")}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.creditAmount
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter credit amount"
                  readOnly
                />
                {/* {errors.creditAmount && (
                  <p className="mt-1 text-sm text-red-500">{errors.creditAmount}</p>
                )} */}
              </div>
            </div>
          </div>

          <CounterClosekeys
            onChange={handleKeyboardInput}
            onEnter={() => {
              const fields = Object.keys(inputRefs);
              const currentIndex = fields.indexOf(focusedField);
              const nextField = fields[(currentIndex + 1) % fields.length];
              handleInputFocus(nextField);
            }}
          />

          <div className="flex">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Proceed
            </button>
          </div>
        </form>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Confirm Shift Close
                </h3>
                <button className="flex items-center gap-2 ml-2">
                  <User className="w-8 h-8 border-gray-200" />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.username}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">
                      {user.branchName}
                    </p>
                  </div>
                </button>
              </div>

              {/* Sales Details Section */}
              <div className="mb-2">
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  Sales Details
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Cash Amount
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Currency} {formData.cashAmount || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Card Amount
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Currency} {formData.cardAmount || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Touch 'n Go
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Currency} {formData.touchNgoAmount || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Bank QR
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Currency} {formData.bankQrAmount || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b-2 border-gray-300 dark:border-gray-600">
                    <span className="font-semibold text-gray-800 dark:text-gray-300">
                      Total Sales Amount
                    </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {Currency} {calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inward Details Section */}
              <div className="mb-2">
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  Inward Details
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Number of Bills
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formData.numberOfBills || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Purchase Amount
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Currency} {formData.purchaseAmount || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      Credit Amount
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Currency} {formData.creditAmount || "0"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showPendingOrdersModal && (
  <PendingOrdersModal
    isOpen={showPendingOrdersModal}
    onClose={() => setShowPendingOrdersModal(false)}
    onProceedToClose={handleProceedToClose}
    formData={formData}
  />
)}

    </div>
  );
};

export default CloseCounter;
