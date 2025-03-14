import { useState, useEffect } from 'react';

const useSpiltScreen = (shouldInitialize = false) => {
  const [order, setOrder] = useState({
    GrossAmount: "0.00",
    TOT: "0.00",
    TotalBillAmount: "0.00",
    TotalTax: "0.00",
    InvoiceDiscount: "0.00",
    items: [],
  });
  
  const [payments, setPayments] = useState([
    { method: "cash", amount: null },
    { method: "card", amount: null },
    { method: "touchngo", amount: null },
    { method: "bankqr", amount: null },
  ]);

  const [isCashCounterOpen, setIsCashCounterOpen] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

  // Read from localStorage
  useEffect(() => {
    const initializeStorage = () => {
      try {
        if (shouldInitialize) {
          // Only set initial counter status if this is the initializing component
          localStorage.setItem('pos_counter_status', JSON.stringify({ isOpen: true }));
          localStorage.setItem('pos_payment_success', JSON.stringify({ success: false }));
          setIsCashCounterOpen(true);
          setIsPaymentSuccessful(false);
        }
      } catch (error) {
        console.error('Error initializing localStorage:', error);
      }
    };

    const checkForUpdates = () => {
      try {
        // Check order updates
        const storedOrder = localStorage.getItem('pos_current_order');
        if (storedOrder) {
          const parsedOrder = JSON.parse(storedOrder);
          setOrder(parsedOrder);
        }

        // Check payment updates
        const storedPayments = localStorage.getItem('pos_current_payments');
        if (storedPayments) {
          setPayments(JSON.parse(storedPayments));
        }

        // Check cash counter status
        const counterStatus = localStorage.getItem('pos_counter_status');
        if (counterStatus) {
          setIsCashCounterOpen(JSON.parse(counterStatus).isOpen);
        }

        // Check payment success status
        const paymentSuccess = localStorage.getItem('pos_payment_success');
        if (paymentSuccess) {
          setIsPaymentSuccessful(JSON.parse(paymentSuccess).success);
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
    };

    // Initialize storage only if this is the initializing component
    initializeStorage();
    // Initial check
    checkForUpdates();

    // Set up interval for checking updates
    const interval = setInterval(checkForUpdates, 500);

    return () => {
      clearInterval(interval);
      // Clean up on unmount
      try {
        if (shouldInitialize) {
          // Only clear counter status if this is the initializing component
          localStorage.setItem('pos_counter_status', JSON.stringify({ isOpen: false }));
          localStorage.setItem('pos_payment_success', JSON.stringify({ success: false }));
        }
      } catch (error) {
        console.error('Error cleaning up localStorage:', error);
      }
    };
  }, [shouldInitialize]);

  const clearStorage = () => {
    try {
      localStorage.removeItem('pos_current_order');
      localStorage.removeItem('pos_current_payments');
      localStorage.removeItem('pos_counter_status');
      localStorage.removeItem('pos_payment_success');
      setOrder({
        GrossAmount: "0.00",
        TOT: "0.00",
        TotalBillAmount: "0.00",
        TotalTax: "0.00",
        InvoiceDiscount: "0.00",
        items: []
      });
      setPayments([
        { method: "cash", amount: null },
        { method: "card", amount: null },
        { method: "touchngo", amount: null },
        { method: "bankqr", amount: null }
      ]);
      setIsCashCounterOpen(false);
      setIsPaymentSuccessful(false);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Write to localStorage
  const updateStorage = {
    setOrder: (newOrder) => {
      try {
        localStorage.setItem('pos_current_order', JSON.stringify(newOrder));
        setOrder(newOrder);
      } catch (error) {
        console.error('Error writing order to localStorage:', error);
      }
    },
    
    setPayments: (newPayments) => {
      try {
        localStorage.setItem('pos_current_payments', JSON.stringify(newPayments));
        setPayments(newPayments);
      } catch (error) {
        console.error('Error writing payments to localStorage:', error);
      }
    },
    
    setCashCounterStatus: (isOpen) => {
      try {
        localStorage.setItem('pos_counter_status', JSON.stringify({ isOpen }));
        setIsCashCounterOpen(isOpen);
      } catch (error) {
        console.error('Error writing counter status to localStorage:', error);
      }
    },

    setPaymentSuccess: (success) => {
      try {
        localStorage.setItem('pos_payment_success', JSON.stringify({ success }));
        setIsPaymentSuccessful(success);

        
        
        // Automatically reset payment success after 3 seconds
        if (success) {
          setTimeout(() => {
            localStorage.setItem('pos_payment_success', JSON.stringify({ success: false }));
            clearStorage();
            setIsPaymentSuccessful(false);
          }, 3000);
        }
      } catch (error) {
        console.error('Error writing payment success status to localStorage:', error);
      }
    },

    clearStorage
  };

  return {
    order,
    payments,
    isCashCounterOpen,
    isPaymentSuccessful,
    updateStorage
  };
};

export default useSpiltScreen;