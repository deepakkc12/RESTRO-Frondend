import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import TableLayout from "../../../components/Table/TableLayout";
import { getRequest, patchRequest, postRequest } from "../../../services/apis/requests";
import { useToast } from "../../../hooks/UseToast";
import { Currency } from "../../../utils/constants";

const PaymentListModal = ({ 
    onPaymentSettled,
  isOpen, 
  onClose,
  isSettled=false,
  InwardCode, 
  totalPayableAmount,
  creditAmount 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [isCompleted, setIsCompleted] = useState(isSettled);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "Amount", label: "Amount" },
    { key: "Remarks", label: "Remarks" },
    { key: "PostedBy", label: "Posted By" },
  ];

  const totalPaidAmount = data.reduce((sum, item) => sum + (Number(item.Amount) || 0), 0);
  const remainingAmount = creditAmount - totalPaidAmount;

  const getData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`inward/${InwardCode}/payments/`);
      setData(response.data.map(item => ({ ...item })));
    //   setIsCompleted(response.data.Pa || false);
    } catch (error) {
      console.error("Error fetching payment list:", error);
      setError("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const toast = useToast()

  const handleSettlementSubmit = async () => {
    setError("");
    setIsSubmitting(true);
    
    try {
      if (!settlementAmount) {
        toast.error("Please enter a valid amount");
      }
      
      if (Number(settlementAmount) > remainingAmount) {
        toast.error("Settlement amount cannot exceed remaining amount");
      }

      const response = await postRequest(`inward/${InwardCode}/add-payment/`, {
        amount: Number(settlementAmount),
        remarks: remarks.trim()
      });

      if(response.success){
        setIsSettlementModalOpen(false);
        setSettlementAmount("");
        setRemarks("");
        setData([...data,response.data])
      }
    } catch (error) {
      setError(error.message || "Failed to process settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const markPaymentComplete = async () => {
    setError("");
    setIsSubmitting(true);
    
    try {
     const response = await patchRequest(`inward/${InwardCode}/payment-settled/`, {
        isCompleted: true
      });
      if(response.success){
          setIsCompleted(true);
          onClose()
          onPaymentSettled()
      }
    } catch (error) {
      setError("Failed to mark payment as completed");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getData();
    }
  }, [ isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Payment List</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <p className="text-lg font-medium flex justify-between">
                <span>Total Payable Amount:</span>
                <span className="text-gray-600">{Currency}{totalPayableAmount?.toLocaleString()}</span>
              </p>
              <p className="text-lg font-medium flex justify-between">
                <span>Credit Amount:</span>
                <span className="text-blue-600">{Currency}{creditAmount?.toLocaleString()}</span>
              </p>
              <p className="text-lg font-medium flex justify-between">
                <span>Total Paid:</span>
                <span className="text-green-600">{Currency}{totalPaidAmount?.toLocaleString()}</span>
              </p>
              <p className="text-lg font-medium flex justify-between border-t pt-2">
                <span>Remaining Balance:</span>
                <span className="text-red-600">{Currency}{remainingAmount?.toLocaleString()}</span>
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <button
                onClick={() => setIsSettlementModalOpen(true)}
                disabled={remainingAmount == 0 || isCompleted || isSubmitting}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Payment
              </button>
              <button
                onClick={markPaymentComplete}
                disabled={isCompleted || remainingAmount > 0 || isSubmitting}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCompleted ? <Check className="w-5 h-5" /> : null}
                {isCompleted ? "Payment Completed" : "Mark as Complete"}
              </button>
            </div>
          </div>

          <TableLayout
            loading={loading}
            // newRow
            // onNewRow={() => setIsSettlementModalOpen(true)}
            headers={headers}
            data={data}
            excel={false}
            pdf={false}
            title="Payments List"
            // datePickerOptions={{
            //   showDatePicker: true,
            //   pickerType: "single",
            //   value: date,
            //   onChange: setDate
            // }}
          />
        </div>
      </div>

      {isSettlementModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsSettlementModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-[480px] shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add Payment</h3>
              <button 
                onClick={() => setIsSettlementModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount * (Maximum: {Currency}{remainingAmount?.toLocaleString()})
                </label>
                <input
                  type="number"
                  value={settlementAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) <= remainingAmount) {
                      setSettlementAmount(value);
                      setError("");
                    } else {
                      setError("Amount cannot exceed remaining balance");
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  min="0"
                  max={remainingAmount}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter remarks"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSettlementSubmit}
                  disabled={!settlementAmount || isSubmitting || Number(settlementAmount) > remainingAmount}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentListModal;