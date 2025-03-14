import React, { useState, useEffect } from 'react';
import { getRequest } from '../../../services/apis/requests';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, createNewCart } from '../../../redux/cart/actions';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/UseToast';
// import { fetchSettings } from '../../../redux/Settings/reducer';

const OrderSelectionModal = ({ 
    onClose, 
    onOrderSelect, 
    tableCode, 
    noOfChairs, 
    tableNo,
    orderCount = null 
}) => {
    const [orders, setOrders] = useState([]);
    const [showChairSelection, setShowChairSelection] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    
    const { refCode } = location.state;
    const { cartId } = useSelector(state => state.cart);

    const handleNewOrderChairSelect = async (chairNo) => {
        if (isCreatingOrder || cartId) return; 
        
        try {
            setIsCreatingOrder(true);
            dispatch(clearCart());
            await dispatch(createNewCart(tableCode, chairNo, tableNo, toast, null, refCode));
        } catch (error) {
            toast.error('Failed to create new order. Please try again.');
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const getOrders = async () => {
        // If orderCount is 0, create new order directly without fetching
        if (orderCount === 0) {
            await handleNewOrderChairSelect(1);
            return;
        }

        try {
            setIsLoading(true);
            const response = await getRequest(`tables/orders/${tableCode}/`);
            if (response.success) {
                setOrders(response.data);
                
            }
        } catch (error) {
            toast.error('Failed to fetch orders. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getOrders();
    }, [orderCount]);

    const isChairTaken = (chairNo) => {
        return orders.some(order => {
            const tokenNumber = order.TokenNo.split(".")[1];
            return tokenNumber == chairNo;
        });
    };

    // Redirect to menu if cartId exists
    useEffect(() => {
        if (cartId) {
            navigate("/menu?category=0");
        }
    }, [cartId, navigate]);

    // Don't render the modal if orderCount is 0
    if (orderCount === 0) {
        return null;
    }

    // Show loading state while checking for orders
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        Loading orders...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                {!showChairSelection ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-white">Select Order</h2>
                            <button 
                                onClick={() => setShowChairSelection(true)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                                disabled={isCreatingOrder}
                            >
                                New Order
                            </button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto hide-scrollbar">
                            {orders.map((order) => (
                                <div 
                                    key={order.Code}
                                    onClick={() => !isCreatingOrder && onOrderSelect(order.Code, order.ChairNo)}
                                    className={`p-3 border rounded transition-colors ${
                                        isCreatingOrder 
                                            ? 'cursor-not-allowed opacity-50' 
                                            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex justify-between">
                                        <span className="font-medium dark:text-white">
                                            Token: {order.TokenNo}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-300">
                                            {order.TOT}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Order Code: {order.Code}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Select Chair for New Order</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(noOfChairs)].map((_, index) => {
                                const chairNo = index + 1;
                                const isTaken = isChairTaken(chairNo);
                                
                                return (
                                    <button
                                        key={chairNo}
                                        onClick={() => !isTaken && handleNewOrderChairSelect(chairNo)}
                                        disabled={isTaken || isCreatingOrder}
                                        className={`p-3 rounded transition-colors ${
                                            isTaken || isCreatingOrder
                                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
                                                : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                        }`}
                                    >
                                        Chair {chairNo} 
                                        {isTaken && <span className="ml-2">✓</span>}
                                        {isCreatingOrder && chairNo === 1 && <span className="ml-2">...</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <button 
                            onClick={() => !isCreatingOrder && setShowChairSelection(false)}
                            disabled={isCreatingOrder}
                            className={`mt-4 w-full py-2 rounded transition-colors ${
                                isCreatingOrder
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            Cancel
                        </button>
                    </>
                )}
                {!showChairSelection && (
                    <button 
                        onClick={onClose}
                        disabled={isCreatingOrder}
                        className={`mt-4 w-full py-2 rounded transition-colors ${
                            isCreatingOrder
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderSelectionModal;