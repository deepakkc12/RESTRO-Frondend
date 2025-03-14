import React, { useEffect, useState } from "react";
import { Coffee, ShoppingCart, Printer, ListOrdered, Info, Plus, X, Gift, Save, Edit } from "lucide-react";
import { postRequest } from "../../../../services/apis/requests";
import { useDispatch } from "react-redux";
import { updateItemCompimentry } from "../../../../redux/cart/actions";

const ComplementaryDetailsModal = ({ isOpen, onClose, item }) => {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [loading, setLoading] = useState(false);
  
    // Reset details when item changes
    useEffect(() => {
      setSelectedStatus(null);
    }, [item, isOpen]);
  
    const dispatch = useDispatch();
    const handleSave = async() => {
      setLoading(true);
      
      const response = await postRequest(`kot-items/${item.Code}/update-complimentary/`, {
        details: selectedStatus === 'complementary' ? 'Item is Complementary' : 'Item Rejected'
      });

      if(response.success){
        dispatch(updateItemCompimentry(response.data));
      }
      setLoading(false);
      onClose();
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-w-[90%] relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
          >
            <X size={24} />
          </button>
  
          {/* Modal Header */}
          <div className="flex items-center mb-4">
            {/* <Gift size={24} className="text-purple-600 mr-3" /> */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
             Make item Discount
            </h2>
          </div>
  
          {/* Modal Content */}
          <div className="space-y-4">
            {/* Item Code (static) */}
            <div className="flex justify-between mb-4">
              <span className="text-gray-600 dark:text-gray-300">Item :</span>
              <span className="font-medium dark:text-white ">{item.SkuName || item.AddOnSubSkuCode}</span>
            </div>
  
            {/* Complementary Status Buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={() => setSelectedStatus('complementary')}
                className={`flex-1 py-3 rounded-lg border-2 transition-all duration-300 ${
                  selectedStatus === 'complementary' 
                    ? 'bg-blue-500 text-white border-blue-700' 
                    : 'bg-white text-green-600 border-green-300 hover:bg-green-100'
                }`}
              >
                Item is Complementary
              </button>
              <button
                onClick={() => setSelectedStatus('rejected')}
                className={`flex-1 py-3 rounded-lg border-2 transition-all duration-300 ${
                  selectedStatus === 'rejected' 
                    ? 'bg-blue-500 text-white border-blue-700' 
                    : 'bg-white text-green-600 border-green-300 hover:bg-green-100'
                }`}
              >
                Item Rejected
              </button>
            </div>
  
            {/* Save Button */}
            <div className="flex justify-end mt-4">
              <button
                disabled={loading || !selectedStatus}
                onClick={handleSave}
                className={`
                  ${selectedStatus 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } 
                  px-4 py-2 rounded flex items-center
                `}
              >
                {loading ? "Saving..." : "Save"} 
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ComplementaryDetailsModal;