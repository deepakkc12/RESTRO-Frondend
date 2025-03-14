import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearCart, createNewCart } from '../../../redux/cart/actions';
import { useToast } from '../../../hooks/UseToast';
import { useLoading } from '../../../hooks/UseLoading';
import NumericKeyboard from '../../../Features/KeyBoards/NumberKeyboard';


const TokenOrderModal = ({ onClose, tableCode, tableNo, noOfChairs }) => {
    const [tokenNo, setTokenNo] = useState('');
    const [error, setError] = useState('');

    const { isLoading, start } = useLoading(4000);

    const location = useLocation();

  // Extract state data
  const {refCode} = location.state;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const inputRef = useRef(null); // Create a ref for the input box

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus(); // Autofocus the input box on component mount
        }
        // dispatch(fetchSettings())
    }, []);

    const {cartId} = useSelector(state=>state.cart) 
    const handleProceed = async () => {


        // Basic validation
      if(!isLoading){

        const stopLoading = start();

        if (!tokenNo.trim()) {
            setError('Please enter a valid token number');
            return;
        }



        // Clear existing cart and create a new one with token
        dispatch(clearCart());
        // Assuming createNewCart can handle token number
        dispatch(createNewCart(tableCode, tokenNo, tableNo, toast,null,refCode ));
      }
    };

    if (cartId)return (navigate("/menu?category=0"))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                    New Order for table - {tableNo}
                </h2>
                <div className="mb-4">
                    <label 
                        htmlFor="tokenNo" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Token Number
                    </label>
                    <input 
                        type="number" 
                        id="tokenNo"
                        ref={inputRef} // Attach the ref to the input box
                        value={tokenNo}
                        onChange={(e) => {
                            setTokenNo(e.target.value);
                            setError(''); // Clear error when user starts typing
                        }}
                        placeholder="Enter token number"
                        className="
                            w-full 
                            px-3 
                            py-2 
                            border 
                            rounded-md 
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-blue-500
                            dark:bg-gray-700 
                            dark:border-gray-600 
                            dark:text-white
                        "
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                </div>

                <div className="flex space-x-4">
                    <button 
                        onClick={onClose}
                        className="
                            flex-1 
                            bg-gray-200 
                            dark:bg-gray-700
                            text-gray-700
                            dark:text-gray-200
                            py-2 
                            rounded 
                            hover:bg-gray-300 
                            dark:hover:bg-gray-600
                            transition-colors
                        "
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleProceed}
                        className="
                            flex-1 
                            bg-green-500 
                            text-white 
                            py-2 
                            rounded 
                            hover:bg-green-600 
                            transition-colors
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                        disabled={!tokenNo.trim()||isLoading}
                    >
                        {isLoading?"Proceeding..":"Proceed"}
                    </button>
                </div>
            </div>
            <NumericKeyboard variant='right'/>
        </div>
    );
};

export default TokenOrderModal;
