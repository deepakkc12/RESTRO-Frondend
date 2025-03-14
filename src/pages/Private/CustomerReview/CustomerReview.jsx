import React, { useState } from 'react';
import { Star } from 'lucide-react';

const CustomerFeedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [mobile, setMobile] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const billData = {
    "InvoiceNo": "507",
    "InvoiceDate": "2025-01-10",
    "GrossAmount": "15.00",
    "InvoiceCharges": "20.00",
    "InvoiceDiscount": "0.00",
    "TotalBillAmount": "35.00",
    "Cash": "15.00",
    "Card": "10.00",
    "wallet": "10.00"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log({ rating, feedback, mobile, invoiceNo: billData.InvoiceNo });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-900">Bill Summary</h1>
            <span className="text-sm text-blue-600">#{billData.InvoiceNo}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{billData.InvoiceDate}</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Amount Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-600">
              <span>Gross Amount</span>
              <span className="font-medium">₹{billData.GrossAmount}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Charges</span>
              <span className="font-medium">₹{billData.InvoiceCharges}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Discount</span>
              <span className="font-medium text-green-600">-₹{billData.InvoiceDiscount}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center text-lg font-semibold text-blue-900">
                <span>Total Amount</span>
                <span>₹{billData.TotalBillAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Cash</div>
                <div className="font-medium text-blue-900">₹{billData.Cash}</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Card</div>
                <div className="font-medium text-blue-900">₹{billData.Card}</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Wallet</div>
                <div className="font-medium text-blue-900">₹{billData.wallet}</div>
              </div>
            </div>
          </div>

          {!submitted ? (
            <div className="space-y-6 pt-4">
              <h2 className="text-lg font-semibold text-blue-900">Share Your Experience</h2>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="focus:outline-none transform transition-transform hover:scale-110"
                    >
                      <Star
                        size={36}
                        className={`${
                          star <= (hover || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  rows="3"
                  placeholder="Tell us about your experience..."
                />

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-green-600 text-xl font-semibold mb-2">
                Thank you for your feedback!
              </div>
              <p className="text-gray-600">
                We appreciate you taking the time to share your experience with us.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedback;