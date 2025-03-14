import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, PrinterIcon, DollarSign, BanknoteIcon, QrCode, 
  CreditCard, ArrowRight 
} from 'lucide-react';
import { Currency } from '../../utils/constants';

// Mock data - replace with actual data fetching
const SAMPLE_SALES_MASTERS = [
  { 
    id: 134, 
    customerName: 'John Doe', 
    items: [
      { name: 'Burger', quantity: 2, price: 150, total: 300 },
      { name: 'Fries', quantity: 1, price: 100, total: 100 },
      { name: 'Soda', quantity: 2, price: 50, total: 100 },
    ],
    subtotal: 500,
    tax: 90,
    discount: 50,
    netAmount: 540 
  },
  { 
    id: 135, 
    customerName: 'Jane Smith', 
    items: [
      { name: 'Pizza', quantity: 1, price: 250, total: 250 },
      { name: 'Salad', quantity: 1, price: 120, total: 120 }
    ],
    subtotal: 370,
    tax: 60,
    discount: 30,
    netAmount: 400 
  }
];

const AdvancedPOSCashCounter = () => {
  // State management
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState([
    { type: null, amount: 0 }
  ]);
  const [tenderAmount, setTenderAmount] = useState(0);

  // Payment method options
  const paymentMethodOptions = [
    { 
      type: 'cash', 
      label: 'Cash', 
      icon: <DollarSign className="w-5 h-5 mr-2" /> 
    },
    { 
      type: 'bank', 
      label: 'Bank Transfer', 
      icon: <BanknoteIcon className="w-5 h-5 mr-2" /> 
    },
    { 
      type: 'gpay', 
      label: 'Google Pay', 
      icon: <QrCode className="w-5 h-5 mr-2" /> 
    },
    { 
      type: 'card', 
      label: 'Credit Card', 
      icon: <CreditCard className="w-5 h-5 mr-2" /> 
    }
  ];

  // Calculations using useMemo
  const totalPaid = useMemo(() => 
    paymentMethods.reduce((sum, method) => sum + (method.amount || 0), 0),
    [paymentMethods]
  );

  const remainingBalance = useMemo(() => 
    selectedOrder 
      ? selectedOrder.netAmount - totalPaid 
      : 0,
    [selectedOrder, totalPaid]
  );

  const returnAmount = useMemo(() => 
    tenderAmount > (selectedOrder?.netAmount || 0)
      ? tenderAmount - (selectedOrder?.netAmount || 0)
      : 0,
    [tenderAmount, selectedOrder]
  );

  // Check URL parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentOrderParam = urlParams.get('current-order');
    
    if (currentOrderParam) {
      const matchedOrder = SAMPLE_SALES_MASTERS.find(
        order => order.id === parseInt(currentOrderParam)
      );
      if (matchedOrder) {
        setSelectedOrder(matchedOrder);
      }
    }
  }, []);

  // Payment method management
  const addPaymentMethod = () => {
    if (paymentMethods.length < 3) {
      const newMethods = [...paymentMethods, { type: null, amount: 0 }];
      
      // If only one method exists before and it's cash, auto-fill remaining balance
      if (paymentMethods.length === 1 && paymentMethods[0].type === 'cash') {
        newMethods[1] = { 
          type: null, 
          amount: remainingBalance 
        };
      }
      
      setPaymentMethods(newMethods);
    }
  };

  const updatePaymentMethod = (index, updates) => {
    const newMethods = [...paymentMethods];
    
    // If type is changed to cash and no cash method exists
    if (updates.type === 'cash' && !paymentMethods.some(m => m.type === 'cash')) {
      // Set tender amount to bill amount or previous amount
      setTenderAmount(selectedOrder?.netAmount || 0);
    }
    
    newMethods[index] = { ...newMethods[index], ...updates };
    setPaymentMethods(newMethods);
  };

  const removePaymentMethod = (index) => {
    if (paymentMethods.length > 1) {
      const newMethods = paymentMethods.filter((_, i) => i !== index);
      setPaymentMethods(newMethods);
    }
  };

  // Reset all states
  const resetStates = () => {
    setSelectedOrder(null);
    setCurrentStep(1);
    setPaymentMethods([{ type: null, amount: 0 }]);
    setTenderAmount(0);
  };

  // Handle payment completion
  const handleCompletePayment = () => {
    if (selectedOrder) {
      alert(`Payment Completed!
        Order: #${selectedOrder.id}
        Total: {Currency}${selectedOrder.netAmount}
        Payment Methods: ${paymentMethods.map(m => m.type).join(', ')}
        Total Paid: {Currency}${totalPaid}
        Return Amount: {Currency}${returnAmount}`);
      // In a real app, you'd call a payment processing function here
      resetStates();
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 p-4 space-x-4">
      {/* Order Selection / Details Panel */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <PrinterIcon className="w-6 h-6 mr-2 text-green-500" />
          {currentStep === 1 ? 'Bill Details' : 'Payment Methods'}
        </h2>

        {currentStep === 1 ? (
          !selectedOrder ? (
            <div className="space-y-2">
              {SAMPLE_SALES_MASTERS.map(order => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer bg-gray-100 hover:bg-blue-100 p-3 rounded-lg transition"
                >
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-gray-600">{order.customerName}</p>
                  <p className="text-blue-600 font-bold">{Currency}{order.netAmount}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Bill Items */}
              <div className="mb-4">
                <div className="border rounded">
                  <div className="grid grid-cols-4 bg-gray-100 p-2 font-medium text-gray-700">
                    <div>Item</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-center">Price</div>
                    <div className="text-right">Total</div>
                  </div>
                  {selectedOrder.items.map((item, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-4 p-2 border-t text-gray-800"
                    >
                      <div>{item.name}</div>
                      <div className="text-center">{item.quantity}</div>
                      <div className="text-center">{Currency}{item.price}</div>
                      <div className="text-right">{Currency}{item.total}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-green-50 p-4 rounded-lg mt-4">
                <div className="flex justify-between mb-2 text-gray-700">
                  <span>Subtotal</span>
                  <span>{Currency}{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-700">
                  <span>Tax</span>
                  <span>{Currency}{selectedOrder.tax}</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-700">
                  <span>Discount</span>
                  <span>-{Currency}{selectedOrder.discount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 text-green-700">
                  <span>Net Amount</span>
                  <span>{Currency}{selectedOrder.netAmount}</span>
                </div>
              </div>
            </>
          )
        ) : (
          // Payment Methods Section (Second Step)
          <div>
            {paymentMethods.map((method, index) => (
              <div 
                key={index} 
                className="flex items-center mb-3 space-x-2"
              >
                <select
                  value={method.type || ''}
                  onChange={(e) => updatePaymentMethod(index, { type: e.target.value, amount: 0 })}
                  className="flex-grow p-2 border rounded"
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethodOptions.map((option) => (
                    <option key={option.type} value={option.type}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={method.amount || ''}
                  onChange={(e) => updatePaymentMethod(index, { amount: Number(e.target.value) })}
                  className="w-32 p-2 border rounded"
                />
                {paymentMethods.length > 1 && (
                  <button 
                    onClick={() => removePaymentMethod(index)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {paymentMethods.length < 3 && (
              <button 
                onClick={addPaymentMethod}
                className="text-green-600 hover:underline"
              >
                + Add Another Payment Method
              </button>
            )}

            {/* Tender Amount Section */}
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between mb-3">
                <label className="font-semibold text-gray-800">
                  Tender Amount (Cash)
                </label>
                <input
                  type="number"
                  value={tenderAmount}
                  onChange={(e) => setTenderAmount(Number(e.target.value))}
                  className="w-32 p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-100 p-3 rounded">
                  <span className="block text-sm text-gray-600">Amount Received</span>
                  <span className="font-bold text-green-700">
                    {Currency}{Math.min(tenderAmount, selectedOrder?.netAmount || 0)}
                  </span>
                </div>
                <div className="bg-blue-100 p-3 rounded">
                  <span className="block text-sm text-gray-600">Return Amount</span>
                  <span className="font-bold text-blue-700">
                    {Currency}{returnAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Navigation Buttons */}
        <div className="mt-4 flex justify-between">
          {currentStep === 1 ? (
            selectedOrder && (
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              >
                Proceed to Payment <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            )
          ) : (
            <>
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 text-gray-600 rounded hover:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={handleCompletePayment}
                disabled={remainingBalance > 0}
                className={`px-6 py-2 text-white rounded ${
                  remainingBalance === 0 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedPOSCashCounter;