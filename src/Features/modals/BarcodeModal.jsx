import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Plus,  Package2,Barcode, Search, Loader } from 'lucide-react';
import { Currency } from '../../utils/constants'; 
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../redux/cart/actions';
import { useToast } from '../../hooks/UseToast';
import { getRequest } from '../../services/apis/requests';
import { CloseBarcodeModal } from '../../redux/BarcodeModal/action';

const BarcodeItemModal = ({masterId,refresh=()=>{},onSuccess}) => {
  const [item, setItem] = useState();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const searchInputRef = useRef(null);

  const dispatch = useDispatch();
  const toast = useToast();

  const {isOpen} = useSelector(state=>state.barcodeModal)

  const onClose = ()=>{
    dispatch(CloseBarcodeModal())
  }

  useEffect(() => {
    if (isOpen) {
      setItem(null);
      setQuantity(1);
      setIsAdding(false);
      setBarcode('');
      setSearchMessage('');
      // Focus on search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);



  const onSuccessItemAdd=()=>{
    refresh()
    setIsAdding(false);
    setItem(null);
    setQuantity(1);
    setIsAdding(false);
    setBarcode('');
    setSearchMessage('');
    searchInputRef.current?.focus();
    // if(refresh){
    // }
    // if(onSuccess){
    //     onSuccess()
    // }
  }

  const handleSearch = async () => {
    if (!barcode.trim()) {
      setSearchMessage('Please enter a barcode to search');
      return;
    }

    setItem(null)

    setIsSearching(true);
    setSearchMessage('Searching...');

    try {
      const response = await getRequest(`ean/branch-item/?barcode=${barcode}`);
      
      if (response.success) {
        setItem(response.data);
        setSearchMessage('');
        toast.success('Item found successfully');
      } else {
        setSearchMessage('Item not found in the branch');
        toast.error('Item not found in the branch');
      }
    } catch (error) {
      setSearchMessage('Failed to search item');
      toast.error('Failed to search item');
    } finally {
      setIsSearching(false);
    }
  };

  const calculateTotal = () => {
    if (!item?.Rate) return 0;
    return (item.Rate * quantity).toFixed(2);
  };

  const handleAddToCart =async () => {
    setIsAdding(true);
      const cartItem = {
        sub_sku_code: item.SubSkuCode,
        is_addon: false,
        quantity: quantity,
        preferences: "",
        rate: item.Rate,
        barcode:barcode
      };

    dispatch(addItemToCart(cartItem, toast,masterId,onSuccessItemAdd,barcode));
    //   onClose();
  };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSearch();
//     }
//   };

  const onSubmitSearch = (e)=>{
    e.preventDefault()
    handleSearch()
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md relative shadow-2xl transform transition-all">
        {/* Header with Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Barcode className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Add Item
              </h2>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={onSubmitSearch}>
  <div className="flex gap-2">
    <input
      ref={searchInputRef}
      type="text"
      value={barcode}
      onChange={(e) => setBarcode(e.target.value)}
    //   onKeyPress={(e) => {
    //     if (e.key === 'Enter') {
    //       return; // Do not prevent default form submission
    //     }
    //   }}
      placeholder="Enter barcode to search..."
      className="flex-1 px-3 py-2 border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      disabled={isSearching}
    />
    <button
      type="submit"
      disabled={isSearching || !barcode.trim()}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
    >
      {isSearching ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Search className="h-4 w-4" />
      )}
    </button>
  </div>
</form>
          
          {searchMessage && (
            <p className={`mt-2 text-sm ${
              searchMessage.includes('not') ? 'text-red-500' : 
              searchMessage === 'Searching...' ? 'text-blue-500' : 
              'text-gray-500'
            }`}>
              {searchMessage}
            </p>
          )}
        </div>

        {/* Content */}
        {item && (
          <>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <Package2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item?.Name || "No SKU Name"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      {item?.SubSkuName || "No Sub SKU"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Unit Price</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {Currency} {parseFloat(item?.Rate)?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                <div className="flex items-end flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 dark:text-white text-center border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Currency} {calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isAdding ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeItemModal;