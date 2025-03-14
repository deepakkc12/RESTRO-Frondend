import React, { useState, useEffect } from 'react';
import { getRequest, postRequest } from '../../../services/apis/requests';
import { useToast } from '../../../hooks/UseToast';
import paymentPrinterService from '../../../Features/Printers/PayementPrintService';
import { useSelector } from 'react-redux';

const PaymentModal = ({ open, onClose,onSubmit }) => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {user} = useSelector(state=>state.auth)
  
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


        const expenseData = await getRequest('expense/ledgers/');
        
        setPaymentTypes(paymentData.data);
        setExpenseTypes(expenseData.data);
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
    setIsSaving(true);

    const body = {
        amount :formData.amount,
        remarks :formData.remarks,
        paymentLedgerCode :formData.paymentType,
        expenseLedgerCode :formData.expenseType,
    }
    
    try {
      // Replace with your actual save API endpoint
     const response = await postRequest('payment/save/',body);
      
      if (response.success){
        
        onClose();
      setFormData({
        paymentType: '',
        expenseType: '',
        amount: '',
        remarks: ''
      });

      console.log(response.data)

      const selectedPayment = paymentTypes.find(pay=>pay.Code==body.paymentLedgerCode)
      const selectedExpense = expenseTypes.find(exp=>exp.Code ==body.expenseLedgerCode)


      const printBody = {
        ...body,paymentTypeName:selectedPayment.Name,expenseTypeName:selectedExpense.Name,
      }
      await paymentPrinterService.printPaymentReceipt(printBody, user);
      onSubmit(response.data)

      }else{
        toast.error("Failed to save Payment")

      }
    } catch (error) {
        toast.error("Failed to save Payment")
      console.error('Error saving payment:', error);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">New Payment Entry</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
                  Expense Type
                </label>
                <select
                  name="expenseType"
                  value={formData.expenseType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select expense type</option>
                  {expenseTypes?.map((type) => (
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
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  required
                />
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

              <div className="flex justify-end">
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
                    'Save Payment'
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

export default PaymentModal;