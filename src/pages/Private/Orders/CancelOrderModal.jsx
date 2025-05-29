import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, AlertTriangle, ShoppingCart, Users, Clock, Loader2 } from 'lucide-react';
import { closeCancelOrderModal } from '../../../redux/cancelOrderModal/action';
import { postRequest } from '../../../services/apis/requests';
import VirtualKeyboard from './VirtualKayboard';
import { useToast } from '../../../hooks/UseToast';
const CancelOrderModal = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { isOpen, orderData } = useSelector(state => state.cancelOrderModal);
  
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCancelReason('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const toast = useToast()

  const handleClose = () => {
    if (!isSubmitting) {
      dispatch(closeCancelOrderModal());
      setShowKeyboard(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = [{
        code: orderData.Code,
        reason: cancelReason.trim()
      }];

      const response =  await postRequest('kot/delete-pending-orders/', {orders: payload});
      
      if (response.success){
        toast.success('Order cancelled successfully');
         if (onSuccess) {
        onSuccess();
      }
      } else {
        toast.error('Failed to cancel order. Please try again.');
      }
      // Success callback
     
      handleClose();
    } catch (err) {
      setError('Failed to cancel order. Please try again.');
      console.error('Cancel order error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyboardInput = (value) => {
    setCancelReason(value);
  };

  if (!isOpen || !orderData) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2"
        onClick={handleClose}
      >
        {/* Modal - Compact Design */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Compact Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-red-500" size={20} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Cancel Order
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Condensed Order Details */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              {/* Order Header - Single Line */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="text-emerald-600 dark:text-emerald-400" size={16} />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {orderData.TokenNo && `Token #${orderData.TokenNo}`}
                    {orderData.TokenNo && orderData.TableNo && ' • '}
                    {orderData.TableNo && `Table #${orderData.TableNo}`}
                  </span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  #{orderData.Code}
                </span>
              </div>

              {/* Compact Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Users className="text-emerald-600 dark:text-emerald-400" size={12} />
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {orderData.CustomerMobileNo || "Walk-in"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="text-emerald-600 dark:text-emerald-400" size={12} />
                  <span className="text-gray-700 dark:text-gray-300">
                    {orderData.TOT}
                  </span>
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Prepared:</span> {orderData.KotItems || 0}
                </div>
                <div className="text-orange-600 dark:text-orange-400">
                  <span className="font-medium">Pending:</span> {orderData.PendingItems || 0}
                </div>
              </div>
            </div>

            {/* Smart Warning Messages */}
            {(() => {
              const preparedItems = orderData.KotItems || 0;
              const pendingItems = orderData.PendingItems || 0;
              const totalItems = preparedItems + pendingItems;

              if (preparedItems > 0 && pendingItems > 0) {
                // Mixed scenario - some items prepared, some pending
                return (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                      <div className="text-xs text-red-700 dark:text-red-300">
                        <div className="font-semibold mb-1">⚠️ Critical Warning</div>
                        <div>
                          <strong>{preparedItems} items are already prepared</strong> in the kitchen and will be wasted. 
                          {pendingItems} items are still pending and can be cancelled without waste.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else if (preparedItems > 0 && pendingItems === 0) {
                // All items are prepared
                return (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                      <div className="text-xs text-red-700 dark:text-red-300">
                        <div className="font-semibold mb-1">🍽️ Food Waste Alert</div>
                        <div>
                          All <strong>{preparedItems} items are already prepared</strong> and ready. 
                          These items will be wasted if you cancel this order.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else if (preparedItems === 0 && pendingItems > 0) {
                // Only pending items - safe to cancel
                return (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-green-600 mt-0.5 flex-shrink-0">✅</div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        <div className="font-semibold mb-1">Safe to Cancel</div>
                        <div>
                          All <strong>{pendingItems} items are still pending</strong> and haven't been sent to the kitchen yet. 
                         
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Edge case - no items
                return (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-gray-500 mt-0.5 flex-shrink-0">ℹ️</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="font-semibold mb-1">Empty Order</div>
                        <div>This order appears to have no items. Safe to cancel.</div>
                      </div>
                    </div>
                  </div>
                );
              }
            })()}
          </div>

          {/* Compact Cancellation Reason */}
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancellation Reason *
            </label>
            
            <div className="space-y-2">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancelling this order..."
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                  rounded-md bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-white text-sm
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                  resize-none
                "
                rows={2}
                disabled={isSubmitting}
              />
              
              {/* Compact Virtual Keyboard Toggle */}
              <button
                type="button"
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="
                  px-3 py-1 bg-blue-500 text-white text-xs
                  rounded-md font-medium
                  hover:bg-blue-600 focus:outline-none 
                  focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
                disabled={isSubmitting}
              >
                ⌨️ {showKeyboard ? 'Hide' : 'Show'} Keyboard
              </button>
            </div>

            {error && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Compact Action Buttons */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="
                px-4 py-2 border border-gray-300 dark:border-gray-600 
                text-gray-700 dark:text-gray-300 text-sm
                bg-white dark:bg-gray-700 
                rounded-md font-medium 
                hover:bg-gray-50 dark:hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              Cancel
            </button>
            
            <button
              onClick={handleCancelOrder}
              disabled={isSubmitting || !cancelReason.trim()}
              className="
                px-4 py-2 bg-red-600 text-white text-sm
                rounded-md font-medium 
                hover:bg-red-700 focus:outline-none 
                focus:ring-2 focus:ring-red-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center space-x-2
              "
            >
              {isSubmitting && <Loader2 className="animate-spin" size={14} />}
              <span>{isSubmitting ? 'Cancelling...' : 'Confirm'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <VirtualKeyboard
          value={cancelReason}
          onChange={handleKeyboardInput}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </>
  );
};

export default CancelOrderModal;