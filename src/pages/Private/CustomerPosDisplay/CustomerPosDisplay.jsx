import React, { useState, useEffect, useRef } from 'react';
import { Calculator, ShoppingCart, CreditCard, Phone, QrCode, Check } from 'lucide-react';
import { Currency } from '../../../utils/constants';
import useSpiltScreen from '../../../hooks/UseSplitScrren';
import { getRequest } from '../../../services/apis/requests';
import { IMAGE_BASE_URL } from '../../../utils/constants';
import FullscreenToggle from '../../../Features/Buttons/FullScreenToggle';
import { Helmet } from 'react-helmet';
import { useToast } from '../../../hooks/UseToast';

const PaymentSuccessModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="bg-white rounded-lg p-8 transform transition-all relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Thank you for your purchase</p>
      </div>
    </div>
  );
};

const CustomerDisplay = () => {

    const fullscreenRef = useRef();


      function roundOffBill(amount) {
    if (amount === null || amount === undefined) return null;

    // Round to the nearest 0.10
    let rounded = Math.round(amount * 10) / 10;

    return (amount - rounded).toFixed(2); // Return difference rounded to 2 decimal places
}


  const { order, payments, isCashCounterOpen, isPaymentSuccessful } = useSpiltScreen();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [advertisements, setAdvertisement] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [billDetails, setBillDetails] = useState({
    code: null,
    subtotal: 0,
    tax: 0,
    discount: null,
    additionalCharges: null,
    items: []
  });

  const getBanners = async () => {
    const response = await getRequest("banner-images");
    setAdvertisement(response.data);
  };

  const toast = useToast()

  // useEffect(() => {
  //   toast.success(isPaymentSuccessful)
  //   console.log(isPaymentSuccessful)
  
  // }, [order]);

  useEffect(() => {
    // alert(isPaymentSuccessful)

    if (order) {
      const transformedItems = order.items.map((item) => ({
        id: item.Code,
        name: item.SkuName,
        quantity: parseFloat(item.Qty) || 0,
        unitPrice: parseFloat(item.Rate) || 0,
        details: item.Details,
      }));

      setBillDetails({
        code: order.Code,
        subtotal: parseFloat(order.TotalTaxable) || 0,
        tax: parseFloat(order.TotalTax) || 0,
        discount: parseFloat(order.InvoiceDiscount) || null,
        additionalCharges: parseFloat(order.InvoiceCharges) || null,
        items: transformedItems,
      });
    }

    // if (isPaymentSuccessful) {
    //   setShowSuccessModal(true);
    //   const timer = setTimeout(() => {
    //     setShowSuccessModal(false);
    //   }, 3000);
    //   return () => clearTimeout(timer);
    // }

    
  }, [order]);

  useEffect(() => {
    getBanners();
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % advertisements?.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [advertisements?.length]);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    return () => clearInterval(timer);
  }, [isCashCounterOpen]);

  const calculateNetTotal = () => {
    const { subtotal = 0, tax = 0, discount = 0, additionalCharges = 0 } = billDetails;
    
       const amount = subtotal + tax - (discount || 0) + (additionalCharges || 0);
    
       const rounded_discount = roundOffBill(amount)

    return amount - rounded_discount
  };

  const calculateTotalPaid = () => {
    return payments.reduce((total, payment) => total + (parseFloat(payment.amount) || 0), 0);
  };

  const calculateRemainingBalance = () => {
    return Math.max(calculateNetTotal() - calculateTotalPaid(), 0);
  };

  const calculateChangeAmount = () => {
    const totalPaid = calculateTotalPaid();
    const netTotal = calculateNetTotal();
    return totalPaid > netTotal ? (totalPaid - netTotal).toFixed(2) : "0.00";
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'cash': return <ShoppingCart className="w-6 h-6" />;
      case 'card': return <CreditCard className="w-6 h-6" />;
      case 'touchngo': return <Phone className="w-6 h-6" />;
      case 'bankqr': return <QrCode className="w-6 h-6" />;
      default: return null;
    }
  };

  const AdvertisementSection = () => (
    <div className="relative h-full flex-1">
      <FullscreenToggle visible={true} defaultMode={false}/>
     {advertisements?.length > 0 && (
    <img
      src={IMAGE_BASE_URL + advertisements[currentAdIndex].url}
      alt="Advertisement"
      className="w-full h-full object-contain transition-opacity duration-500"
    />
  )}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {advertisements?.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentAdIndex ? 'bg-white scale-110' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
   <div ref={fullscreenRef}>
    <Helmet>
      <title>BackDisplay</title>
    </Helmet>
     <div   className="relative h-screen overflow-hidden bg-gray-900">
      <div
        className={`flex h-full transition-transform duration-500 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {isCashCounterOpen && (
          <div className="w-1/2 min-w-[50%] p-6 bg-white shadow-lg transition-all duration-500 ease-in-out overflow-y-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Bill</h1>
              <div className="text-5xl font-bold text-green-600 flex items-center justify-center">
                <Calculator className="mr-3 w-8 h-8" />
                {Currency} {calculateNetTotal().toFixed(2)}
              </div>
            </div>

            <div className="mb-6 max-h-48 overflow-y-auto">
              {billDetails.items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between py-2 border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="text-gray-800">
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                    {item.details && (
                      <span className="block text-xs text-gray-500">{item.details}</span>
                    )}
                  </div>
                  <span className="text-gray-800">
                    {Currency} {(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              {[
                { label: 'Subtotal', value: billDetails.subtotal },
                { label: 'Tax', value: billDetails.tax },
                ...(billDetails.discount > 0 ? [{ label: 'Discount', value: -billDetails.discount }] : []),
                ...(billDetails.additionalCharges > 0 ? [{ label: 'Additional Charges', value: billDetails.additionalCharges }] : [])
              ].map((item, index) => (
                <div key={index} className="flex justify-between text-gray-700 hover:bg-gray-50 p-2 rounded transition-colors duration-200">
                  <span>{item.label}:</span>
                  <span>{Currency} {Math.abs(item.value).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              {payments.filter(p => p.amount > 0).map((payment, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-md"
                >
                  <div className="flex items-center">
                    {getPaymentIcon(payment.method)}
                    <span className="ml-2 capitalize text-gray-800">
                      {payment.method.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <span className="text-xl font-semibold text-gray-800">
                    {Currency} {parseFloat(payment.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-xl border-t pt-4">
              <div className="flex justify-between text-gray-800">
                <span>Remaining:</span>
                <span className={`font-bold ${calculateRemainingBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {Currency} {calculateRemainingBalance().toFixed(2)}
                </span>
              </div>
              {parseFloat(calculateChangeAmount()) > 0 && (
                <div className="flex justify-between text-gray-800">
                  <span>Change:</span>
                  <span className="font-bold text-green-600">
                    {Currency} {calculateChangeAmount()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        <AdvertisementSection />
      </div>
      <PaymentSuccessModal isOpen={showSuccessModal} />
    </div>
   </div>
  );
};

export default CustomerDisplay;