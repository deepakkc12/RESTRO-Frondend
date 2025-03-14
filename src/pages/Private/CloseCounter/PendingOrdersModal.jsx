import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckSquare, Square, X, XCircle, Delete } from 'lucide-react';
import { getRequest, postRequest } from '../../../services/apis/requests';
import toast from 'react-hot-toast';

const PendingOrdersModal = ({ 
  isOpen, 
  onClose, 
  onProceedToClose,
  formData 
}) => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [reasons, setReasons] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [currentEditingOrderId, setCurrentEditingOrderId] = useState(null);
  const [recentReasons, setRecentReasons] = useState([]);
  const [errors, setErrors] = useState({});
  const keyboardRef = useRef(null);
  const modalRef = useRef(null);
  
  // Initial common reasons
  const commonReasons = [
    "Order Cancelled", 
    "Customer Left", 
    "Kitchen Error", 
    "Duplicate Order",
    "Out of Stock"
  ];

  // Load saved recent reasons from localStorage
  useEffect(() => {
    try {
      const savedReasons = localStorage.getItem('recentDeleteReasons');
      if (savedReasons) {
        setRecentReasons(JSON.parse(savedReasons));
      }
    } catch (error) {
      console.error('Error loading recent reasons:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPendingOrders();
      
      // Reset states when modal opens
      setSelectedOrders([]);
      setShowVirtualKeyboard(false);
      setCurrentEditingOrderId(null);
      setErrors({});
    }
  }, [isOpen]);

  // Handle small screen keyboard positioning
  useEffect(() => {
    if (showVirtualKeyboard && modalRef.current && keyboardRef.current) {
      // Check if modal content is larger than viewport
      const modalRect = modalRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (modalRect.height > viewportHeight * 0.8) {
        // Scroll to keyboard
        keyboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [showVirtualKeyboard, currentEditingOrderId]);

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getRequest('kot/pendig-list/');
      if (response.success) {
        setPendingOrders(response.data);
        // Initialize reasons object with empty strings
        const initialReasons = {};
        const initialErrors = {};
        response.data.forEach(order => {
          initialReasons[order.Code] = "";
          initialErrors[order.Code] = false;
        });
        setReasons(initialReasons);
        setErrors(initialErrors);
        if(response.data.length == 0){
          onProceedToClose()
        }
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
    setIsLoading(false);
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === pendingOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(pendingOrders.map(order => order.Code));
    }
  };

  const handleSelectOrder = (orderId) => {
    // First check if order has a reason if it's being selected
    if (!selectedOrders.includes(orderId)) {
      if (!reasons[orderId] || reasons[orderId].trim() === '') {
        // Focus the reason field for this order
        handleReasonFocus(orderId);
        // Show error
        setErrors(prev => ({
          ...prev,
          [orderId]: true
        }));
        return;
      }
    }

    
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      }
      return [...prev, orderId];
    });
  };

  const handleDeleteSelected = async (deletion=true) => {
    if (selectedOrders.length === 0) return;
    
    // Validate that all selected orders have reasons
    const missingReasons = selectedOrders.filter(orderId => !reasons[orderId] || reasons[orderId].trim() === '');
    if (missingReasons.length > 0) {
      // Mark missing reasons as errors
      const newErrors = {...errors};
      missingReasons.forEach(id => {
        newErrors[id] = true;
      });
      setErrors(newErrors);
      
      // Focus on the first missing reason
      if (missingReasons.length > 0) {
        handleReasonFocus(missingReasons[0]);
      }
      
      return;
    }
    
    setIsDeleting(true);
    try {
      // Create an array of objects with code and reason
      const orderData = selectedOrders.map(orderId => ({
        code: orderId,
        reason: reasons[orderId].trim()
      }));

      let response = {success:true}
      if(deletion){
         response = await postRequest('kot/delete-pending-orders/', {
          orders: orderData
        });
      }
      
      
      if (response.success) {
        // Save new reasons to recent list
        const newReasons = [...recentReasons];
        selectedOrders.forEach(orderId => {
          const reason = reasons[orderId].trim();
          if (reason && !commonReasons.includes(reason) && !newReasons.includes(reason)) {
            newReasons.unshift(reason);
          }
        });
        
        // Keep only the 5 most recent reasons
        const updatedRecentReasons = newReasons.slice(0, 5);
        setRecentReasons(updatedRecentReasons);
        
        // Save to localStorage
        try {
          // localStorage.setItem('recentDeleteReasons', JSON.stringify(updatedRecentReasons));
        } catch (error) {
          console.error('Error saving recent reasons:', error);
        }
        
        // Remove deleted orders from the list
        setPendingOrders(prev => 
          prev.filter(order => !selectedOrders.includes(order.Code))
        );
        setSelectedOrders([]);
        
        // If no more pending orders, proceed to shift close
        if (pendingOrders.length === selectedOrders.length) {
          onProceedToClose();
        }
      }
    } catch (error) {
      console.error('Error deleting orders:', error);
    }
    setIsDeleting(false);
  };

  const handleReasonChange = (orderId, value) => {

    setReasons(prev => ({
      ...prev,
      [orderId]: value
    }));


    // Clear error if value is not empty
    if (value.trim() !== '') {
      setSelectedOrders(prev => {
        if (prev.includes(orderId)) {
          return prev
        }
        return [...prev, orderId];
      });
      
      setErrors(prev => ({
        ...prev,
        [orderId]: false
      }));
    }else{
          setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      }
      
    });
    
    }
  };

  const handleReasonFocus = (orderId) => {
    setCurrentEditingOrderId(orderId);
    setShowVirtualKeyboard(true);
  };

  // Modified to prevent keyboard from closing unexpectedly
  const handleReasonBlur = (e) => {
    // Don't hide keyboard if clicking on a virtual key
    if (e.relatedTarget && (
      e.relatedTarget.classList.contains('virtual-key') || 
      e.relatedTarget.closest('.virtual-keyboard')
    )) {
      return;
    }
    
    // Only close if we're not clicking within the keyboard
    if (keyboardRef.current && !keyboardRef.current.contains(e.relatedTarget)) {

      
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isVirtualKey = activeElement && (
          activeElement.classList.contains('virtual-key') || 
          activeElement.closest('.virtual-keyboard')
        );
        
        if (!isVirtualKey) {
          setShowVirtualKeyboard(true);
          setCurrentEditingOrderId(null);
        }
      }, 100);
    }
  };

  const handleKeyPress = (key) => {
    if (!currentEditingOrderId) return;

    if (key === 'backspace') {

     const currentReason = reasons[currentEditingOrderId]

      if(currentReason.length ==1){
        setSelectedOrders(prev => {
          if (prev.includes(currentEditingOrderId)) {
            return prev.filter(id => id !== currentEditingOrderId);
          }})
      }

      setReasons(prev => ({
        ...prev,
        [currentEditingOrderId]: prev[currentEditingOrderId].slice(0, -1)
      }));
    } else if (key === 'space') {
      setReasons(prev => ({
        ...prev,
        [currentEditingOrderId]: prev[currentEditingOrderId] + ' '
      }));
    } else {
      // handleSelectOrder(currentEditingOrderId)
      setSelectedOrders(prev => {
        if (prev.includes(currentEditingOrderId)) {
          return prev
        }
        return [...prev, currentEditingOrderId];
      });
      

      setReasons(prev => ({
        ...prev,
        [currentEditingOrderId]: prev[currentEditingOrderId] + key
      }));
    }
    
    // Clear error for this order id as user is typing
    setErrors(prev => ({
      ...prev,
      [currentEditingOrderId]: false
    }));
  };

  const selectReason = (reason) => {
    if (!currentEditingOrderId) return;
    
    setReasons(prev => ({
      ...prev,
      [currentEditingOrderId]: reason
    }));
    
    // Clear error for this order
    setErrors(prev => ({
      ...prev,
      [currentEditingOrderId]: false
    }));
    
    // Check if this order is not yet selected
    if (!selectedOrders.includes(currentEditingOrderId)) {
      // Auto-select the order when a reason is chosen
      setSelectedOrders(prev => [...prev, currentEditingOrderId]);
    }
  };

  const handleDoneKeyboard = () => {
    setShowVirtualKeyboard(false);
    setCurrentEditingOrderId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-2 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pending Orders
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {pendingOrders.length > 0 ? (
              <>
                <div className="mb-2 flex justify-between items-center sticky top-12 bg-white dark:bg-gray-800 z-10 pb-2">
                  {/* <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedOrders.length === pendingOrders.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Select All
                  </button> */}
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                    * Reason is required to select an order for deletion
                  </div>

                  <button
                    onClick={()=>{handleDeleteSelected(false)}}
                    disabled={selectedOrders.length === 0 || isDeleting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                   Verify Selected
                  </button>
                  <button
                    onClick={()=>{handleDeleteSelected()}}
                    disabled={selectedOrders.length === 0 || isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Delete Selected
                  </button>
                </div>

              

                <div className="max-h-64 overflow-y-auto border rounded-md mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="w-12 px-3 py-3"></th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Table
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Token
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reason*
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {pendingOrders.map((order) => (
                        <tr 
                          key={order.Code}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-3 py-4">
                            <button
                              onClick={() => handleSelectOrder(order.Code)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {selectedOrders.includes(order.Code) ? (
                                <CheckSquare className="w-5 h-5" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {order.TableNo}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {order.TokenNo}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {order.KotItems}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                            <div className="relative">
                              <input
                                type="text"
                                value={reasons[order.Code] || ""}
                                onChange={(e) => handleReasonChange(order.Code, e.target.value)}
                                onFocus={() => handleReasonFocus(order.Code)}
                                onBlur={handleReasonBlur}
                                placeholder="Required"
                                className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors[order.Code] ? 'border-red-500 bg-red-50' : ''
                                }`}
                              />
                              {errors[order.Code] && (
                                <div className="text-xs text-red-500 mt-1">
                                  Reason is required
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {order.TOT}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showVirtualKeyboard && (
                  <div 
                    ref={keyboardRef} 
                    className="virtual-keyboard  p-3 bg-gray-100 dark:bg-gray-700 rounded-lg sticky bottom-0 z-20 border-t-2 border-blue-500"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">
                        Entering reason for: 
                        <span className="text-blue-600 ml-1">
                          {currentEditingOrderId && pendingOrders.find(o => o.Code === currentEditingOrderId)?.TableNo} 
                          - Token {currentEditingOrderId && pendingOrders.find(o => o.Code === currentEditingOrderId)?.TokenNo}
                        </span>
                      </div>
                      <button 
                        onClick={handleDoneKeyboard}
                        className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
                      >
                        Done
                      </button>
                    </div>
                    
                    {/* <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Common Reasons:</h4>
                      <div className="flex flex-wrap gap-2">
                        {commonReasons.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => selectReason(reason)}
                            className="virtual-key px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {recentReasons.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-2">Recent Reasons:</h4>
                        <div className="flex flex-wrap gap-2">
                          {recentReasons.map((reason) => (
                            <button
                              key={reason}
                              onClick={() => selectReason(reason)}
                              className="virtual-key px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md text-sm hover:bg-green-200 dark:hover:bg-green-800"
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                     */}
                   <div className='flex flex-col items-center'>
                   <div className="flex justify-between mb-2">
                      <div className="flex-1 flex flex-wrap gap-1">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((key) => (
                          <button
                            key={key}
                            onClick={() => handleKeyPress(key)}
                            className="virtual-key w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow text-gray-800 dark:text-gray-200"
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <div className="flex-1 flex flex-wrap gap-1">
                        {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((key) => (
                          <button
                            key={key}
                            onClick={() => handleKeyPress(key)}
                            className="virtual-key text-lg w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow text-gray-800 dark:text-gray-200"
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex  justify-between mb-2">
                      <div className="flex-1 flex flex-wrap gap-1">
                        {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((key) => (
                          <button
                            key={key}
                            onClick={() => handleKeyPress(key)}
                            className="virtual-key text-lg w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow text-gray-800 dark:text-gray-200"
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex-1 flex flex-wrap gap-1">
                        {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((key) => (
                          <button
                            key={key}
                            onClick={() => handleKeyPress(key)}
                            className="virtual-key text-lg w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow text-gray-800 dark:text-gray-200"
                          >
                            {key}
                          </button>
                        ))}
                        <button 
                          onClick={() => handleKeyPress('backspace')}
                          className="virtual-key w-12 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow text-gray-800 dark:text-gray-200"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleKeyPress('space')}
                          className="virtual-key w-24 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded shadow text-gray-800 dark:text-gray-200"
                        >
                          Space
                        </button>
                      </div>
                    </div>
                   </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No pending orders found
                </p>
                <button
                  onClick={onProceedToClose}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Proceed to Close Shift
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PendingOrdersModal;