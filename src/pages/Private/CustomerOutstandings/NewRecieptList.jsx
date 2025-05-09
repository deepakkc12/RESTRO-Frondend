import React, { useState, useEffect } from 'react';
import { getRequest, postRequest } from '../../../services/apis/requests';
import { useToast } from '../../../hooks/UseToast';
import receiptPrinterService from '../../../Features/Printers/ReceiptPrint';
import { useSelector } from 'react-redux';

const RecieptModal = ({ open, onClose, onSubmit, selectedLedger }) => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useSelector(state => state.auth)

  const maxPayable = selectedLedger.OutstandingAmount
  const customerName = selectedLedger.CustomerName
  
  const [formData, setFormData] = useState({
    paymentType: '',
    expenseType: '',
    amount: '',
    remarks: ''
  });

  useEffect(() => {
    const fetchLedgerTypes = async () => {
      setIsLoading(true);
      try {
        const paymentData = await getRequest('payment/types/')
        setPaymentTypes(paymentData.data);
      } catch (error) {
        console.error('Error fetching ledger types:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchLedgerTypes();
    }
  }, [open]);

  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount doesn't exceed max payable
    if (Number(formData.amount) > Number(maxPayable)) {
      toast.error(`Amount cannot exceed maximum payable amount of ${maxPayable}`);
      return;
    }
    
    setIsSaving(true);

    const body = {
        amount: formData.amount,
        remarks: formData.remarks,
        customerCode: selectedLedger.CustomerCode,
        paymentTypeCode: formData.paymentType,
    }
    
    try {
      const response = await postRequest('ledgers/new-receipt/', body);
      
      if (response.success) {
        // Prepare data for receipt printing
        const printData = {
          receiptId: response.data?.receiptId || `R-${Date.now()}`,
          customerCode: selectedLedger.CustomerCode,
          customerName: customerName,
          CustomerMobile:selectedLedger.CustomerMobile,
          paymentTypeName: paymentTypes.find(p => p.Code === formData.paymentType)?.Name || 'Unknown',
          amount: formData.amount,
          totalDue: maxPayable,
          remarks: formData.remarks,
          date: new Date()
        };
        
        // Print the receipt
        try {
          await receiptPrinterService.printReceiptVoucher(printData, user);
        } catch (printError) {
          console.error('Error printing receipt:', printError);
          // Continue even if printing fails
        }
        
        onClose();
        setFormData({
          paymentType: '',
          expenseType: '',
          amount: '',
          remarks: ''
        });

        toast.success("Receipt saved")
        onSubmit()
      } else {
        toast.error("Failed to save Receipt")
      }
    } catch (error) {
        toast.error("Failed to save Receipt")
        console.error('Error saving Receipt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">New Receipt Entry</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Customer Info Section */}
          <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700">Customer:</span>
              <span className="font-semibold text-gray-800">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Maximum Payable:</span>
              <span className="font-semibold text-blue-700">{maxPayable.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'INR',
                minimumFractionDigits: 2
              })}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-4">
              <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select payment type</option>
                  {paymentTypes?.map((type) => (
                    <option key={type.Code} value={type.Code}>
                      {type.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <input
                  min={0}
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    max={maxPayable}
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute right-2 top-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
                    onClick={() => setFormData(prev => ({...prev, amount: maxPayable}))}
                  >
                    Max
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter an amount up to {maxPayable.toLocaleString('en-US', { 
                    style: 'currency', 
                    currency: 'INR',
                    minimumFractionDigits: 2
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter remarks"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-md text-white font-medium 
                    ${isSaving 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                    }
                    transition-colors duration-200`}
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    'Save Receipt'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecieptModal;