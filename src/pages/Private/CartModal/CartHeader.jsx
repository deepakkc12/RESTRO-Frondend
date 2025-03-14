import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, Plus, Loader } from 'lucide-react';
import CartInfo from '../../../Features/Badges/CartNoInfo';
import TableInfo from '../../../Features/Badges/TableInfo';
import { useDispatch } from 'react-redux';
import { useToast } from '../../../hooks/UseToast';
import DeleteCartButton from '../../../Features/Buttons/DeleteCartButton';
import { getRequest } from '../../../services/apis/requests';
import ScannOpenButton from '../../../Features/Buttons/ScannOpenButton';
import VegToggle from '../../../Features/Buttons/VegToggleButton';

const CartHeader = ({ isVeg,onClose,items, title, cartId,setBarcodeItem,openBarcodeModal,showScan=true }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef(null);
  const toast = useToast();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning]);


// const [item,setItem] = useState(null)


//   const handleAddItem = async () => {
//     if (!barcode) return;
    
//     setIsLoading(true);
//     try {

//       const response = await getRequest(`ean/branch-item/?barcode=${barcode}`)

//       if(response.success){
//         setBarcodeItem(response.data)
//         openBarcodeModal()
//       }
//       else{
//         toast.error("Item not found in the branch")
//       }
     
//       // dispatch({ type: 'ADD_ITEM_TO_CART', payload: item });
//       // toast.success('Item added to cart');
//     } catch (error) {
//       toast.error('Failed to add item');
//     } finally {
//       setIsLoading(false);
//       setBarcode('');
//       setIsScanning(false);
//     }
//   };


  return (
    <div className="p-4 flex items-center justify-between border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        {/* <CartInfo /> */}
        <TableInfo />        
         
          {showScan&&<ScannOpenButton/>}
          <VegToggle orderCode={cartId} isVeg={isVeg} items={items}/>
   
 
        
      </div>
      <button 
        onClick={onClose} 
        className="text-gray-500 dark:text-gray-400 hover:text-red-500 
          dark:hover:text-red-400 transition-colors p-2 rounded-lg
          hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Close
      </button>
    </div>
  );
};

export default CartHeader;