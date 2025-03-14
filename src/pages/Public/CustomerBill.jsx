import React, { useState, useEffect } from 'react';
import { Star, Phone, User, Receipt } from 'lucide-react';
import { useToast } from '../../hooks/UseToast';
import { Currency } from '../../utils/constants';
import { getRequest, patchRequest, postRequest } from '../../services/apis/requests';
import { useParams } from 'react-router-dom';

const CustomerBill = () => {
  const { salesId } = useParams();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    customerName: '',
    customerPhone: ''
  });
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingReview, setExistingReview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getBillDetails = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`sales/item-details/${salesId}`);
      if (response.success) {
        setBillData(response.data);
      } else {
        toast.error("Invoice not found");
        setBillData(null);
      }
    } catch (error) {
      toast.error("Error fetching invoice details");
      setBillData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      const response = await getRequest(`customer-review/${salesId}/`);
      if (response.success) {
        const reviewData = {
          rating: response.data.Rating,
          comment: response.data.Feedback,
          customerName: response.data.Name,
          customerPhone: response.data.MobileNo
        };
        setFeedback(reviewData);
        setExistingReview(response.data);
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    }
  };

  useEffect(() => {
    getBillDetails();
    fetchReview();
  }, [salesId]);

  const StarRating = ({ rating, onRate, size = 5, readonly = false }) => (
    <div className="flex gap-1">
      {[...Array(size)].map((_, i) => (
        <Star
          key={i}
          className={`w-6 h-6 ${!readonly && 'cursor-pointer'} ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => !readonly && onRate?.(i + 1)}
        />
      ))}
    </div>
  );

  const handleSubmitFeedback = async () => {
    if (!feedback.customerPhone || !feedback.customerName) {
      toast.error('Please fill in all customer details');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        feedbackCode: existingReview?.Code,
        salesCode: salesId,
        name: feedback.customerName,
        mobile: feedback.customerPhone,
        rating: feedback.rating,
        feedback: feedback.comment
      };

      const endpoint = existingReview ? 'update-feedback/' : 'save-feedback/';
      const response = await postRequest(endpoint, body);

      if (response.success) {
        setExistingReview(response.data);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setIsModalOpen(false);
        toast.success(existingReview ? 'Feedback updated successfully' : 'Feedback submitted successfully');
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-green-600">Loading...</div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border border-green-200 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Receipt className="w-16 h-16 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-800">Invoice Not Found</h1>
            <p className="text-gray-600 mb-4">
              We couldn't find the invoice you're looking for. Please scan a valid QR-code and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border border-green-200">
        <div className="bg-green-600 text-white p-6">
          <h1 className="text-2xl font-bold">Invoice Details</h1>
          <div className="mt-2 flex justify-between">
            <p className="text-sm">Invoice #: {billData?.InvoiceNo}</p>
            <p className="text-sm">Date: {billData?.InvoiceDate}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-green-600">Subtotal</p>
              <p className="font-medium text-green-800">{Currency} {parseFloat(billData?.GrossAmount).toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-green-600">Tax</p>
              <p className="font-medium text-green-800">{Currency} {parseFloat(billData?.TotalTax).toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-green-600">Additional Charges</p>
              <p className="font-medium text-green-800">{Currency} {billData?.InvoiceCharges}</p>
            </div>
            <div className="border-t border-green-300 pt-3 flex justify-between items-center">
              <p className="font-bold text-lg text-green-900">Total</p>
              <p className="font-bold text-lg text-green-600">{Currency} {billData?.TotalBillAmount}</p>
            </div>
          </div>

          {existingReview && (
            <div className="bg-green-50 p-4 rounded-lg space-y-3">
              {/* <h3 className="font-semibold text-green-800">Review</h3> */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{existingReview.Name}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">Overall Rating</p>
                  <StarRating rating={existingReview.Rating} readonly />
                </div>
                <p className="text-sm text-green-700 italic">"{existingReview.Feedback}"</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            {existingReview ? 'Update Feedback' : 'Leave Feedback'}
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Feedback</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={feedback.customerName}
                      onChange={(e) => setFeedback({ ...feedback, customerName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={feedback.customerPhone}
                      onChange={(e) => setFeedback({ ...feedback, customerPhone: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Rating
                  </label>
                  <StarRating
                    rating={feedback.rating}
                    onRate={(rating) => setFeedback({ ...feedback, rating })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  {isSubmitting ? 'Submitting...' : existingReview ? 'Update Feedback' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-medium">Success!</p>
            <p className="text-sm">Your feedback has been submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBill;