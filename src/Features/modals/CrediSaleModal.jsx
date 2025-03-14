import React, { useState } from 'react';
import { getRequest, postRequest } from '../../services/apis/requests';
import { useDispatch, useSelector } from 'react-redux';
import { CloseCreditSaleModal } from '../../redux/creditSaleModal/action';
import { Currency, KOT_TYEPES } from '../../utils/constants';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/UseToast';
// import toast from 'react-hot-toast';

const CreditSaleModal = ({
  orderCode,
  kotType,
  onSuccess,
  billDetails = {
    code: null,
    subtotal: 0,
    tax: 0,
    discount: 0,
    additionalCharges: 0,
    items: [],
  }
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { isOpen } = useSelector(state => state.creditSaleReducer);
  const dispatch = useDispatch();

  const toast= useToast()

  const netAmount = billDetails.subtotal + billDetails.tax + billDetails.additionalCharges - billDetails.discount;

  const onClose = () => {
    if (submitting) return;
    setSelectedCustomer(null);
    setMobileNumber('');
    setError('');
    dispatch(CloseCreditSaleModal());
  };

  const handleSearch = async () => {
    if (!mobileNumber.trim()) {
      setError('Please enter a mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await getRequest(`ledgers/ordinary-customers/?mobile=${mobileNumber}`);
      if (response.data && response.data.length > 0) {
        setSelectedCustomer(response.data[0]);
      } else {
        setError('No customer found with this mobile number');
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('Error fetching customer details');
      setSelectedCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || submitting) return;

    setSubmitting(true);
    try {
      const body = {
        customerCode: selectedCustomer.Code,
        credit: netAmount,
        charges: billDetails.additionalCharges
      }

      if (kotType != KOT_TYEPES.dineIn){
        const kotResponse = await postRequest(`kot/update-kot-no/${billDetails.code}/`);
        if (!kotResponse.success){
          return toast.error("Error printing kot")
        }
      }

      const response = await postRequest(`kot/${billDetails.code}/pay-credit-bill/`, body);

      if (response.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error processing sale:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">New Credit Sale</h2>
          <button 
            onClick={onClose} 
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 text-xl disabled:opacity-50"
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm bg-gray-50 p-3 rounded">
          <div>Bill: {billDetails.code}</div>
          <div>Subtotal: {Currency}{(billDetails.subtotal.toFixed(2))}</div>
          <div className="text-right">Tax: {Currency}{(billDetails.tax).toFixed(2)}</div>
          <div>Additional: {Currency}{billDetails.additionalCharges||0}</div>
          <div>Discount: {Currency}{billDetails.discount || 0}</div>
          <div className="text-right font-semibold">Net: {Currency}{netAmount.toFixed(2)}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  setError('');
                }}
                placeholder="Enter mobile number..."
                className="w-full pl-10 pr-3 py-2 border rounded text-base"
                disabled={submitting || loading}
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={submitting || loading}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Search'
              )}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {selectedCustomer && (
            <div className="text-sm bg-blue-50 p-2.5 rounded flex justify-between items-center">
              <span className="font-medium">Selected: {selectedCustomer.Name}</span>
              <span className="text-gray-600">{selectedCustomer.MobileNumber}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border rounded text-base hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedCustomer || submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded text-base hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditSaleModal;