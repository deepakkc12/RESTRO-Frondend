import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Printer, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { 
  CloseBillPrintModal,
  openBillPrintModal 
} from '../../redux/billPreviewModal/action';
import { clearCart } from '../../redux/cart/actions';
import { useToast } from '../../hooks/UseToast';
import { postRequest } from '../../services/apis/requests';
import { Currency, KOT_TYEPES } from '../../utils/constants';
import { CloseCARTModal } from '../../redux/cartMoodal/action';
import { processKotAndBill } from '../../services/KotServices/Bill';

const PaymentDetails = React.memo(({ payments, totalAmount }) => {
  const cashPayment = payments.find((pay) => pay.method === 'cash')?.amount || 0;
  const change = cashPayment - totalAmount;
  
  return (
    <div className="mt-4 pt-2 border-t border-dashed border-black">
      <div className="font-bold mb-2">Payment Details:</div>
      {payments.map((payment, index) =>
        payment.amount > 0 && (
          <div key={index} className="flex justify-between mb-1">
            <span className="capitalize">{payment.method}:</span>
            <span>{Currency}{parseFloat(payment.amount).toFixed(2)}</span>
          </div>
        )
      )}
      {change > 0 && (
        <div className="flex justify-between mt-2">
          <span className="font-semibold">Change:</span>
          <span>{Currency}{parseFloat(change).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
});

const BillItem = React.memo(({ item }) => (
  <div className="mb-2 pb-1 border-b border-dashed border-gray-300">
    <div className="flex justify-between">
      <div>
        <span className="font-semibold text-black">{item.SkuName}</span>
      </div>
      <div className="text-right">
        <span className="font-bold">Qty: {Number(item.Qty)}</span>
        <br />
        <span>{Currency}{parseFloat(item.TotalAmount).toFixed(2)}</span>
      </div>
    </div>
  </div>
));

const BillPreview = ({
  masterCode,
  kotTypeCode,
  items = [],
  payments = [],
  billDetails = {},
  onSuccess,
  rePrint = false
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { isOpen } = useSelector(state => state.billPrintModal);
  const { isBillPrintFirst, isKotBased } = useSelector(state => state.settings);

  const [loading, setLoading] = React.useState(false);
  
  // Derive kotItems from props instead of keeping in state
  const kotItems = React.useMemo(() => {

    if (!items.length) return [];
    
    const filteredItems = kotTypeCode === KOT_TYEPES.dineIn
      ? items.filter(item => item.KOTNo !== 0)
      : items;
      
    return filteredItems.filter(item => item.SubSkuCode !== 'PACKING');
  }, [items, kotTypeCode]);


  const nonKotItems = React.useMemo(() => {
    
    if (!items.length) return [];
    
    const filteredItems = items.filter(item => item.KOTNo == 0)
  
    return filteredItems.filter(item => item.SubSkuCode !== 'PACKING');
  }, [items]);

  // Calculate totals from kotItems
  const totals = React.useMemo(() => {
    const totalTaxable = kotItems.reduce(
      (sum, item) => sum + parseFloat(item.TotalTaxable || 0),
      0
    );
    const totalTax = kotItems.reduce(
      (sum, item) => sum + parseFloat(item.TotalTax || 0),
      0
    );
    const additionalCharges = parseFloat(billDetails.additionalCharges || 0);
    const discount = parseFloat(billDetails.discount || 0);
    
    return {
      totalTaxable,
      totalTax,
      additionalCharges,
      discount,
      netTotal: totalTaxable + totalTax + additionalCharges - discount
    };
  }, [kotItems, billDetails]);

  const handleClose = React.useCallback(() => {
    dispatch(CloseBillPrintModal());
  }, [dispatch]);
 const handleReprint = React.useCallback(async () => {
    if (!masterCode) return;
    
    setLoading(true);
    try {
      const response = await postRequest(`sales/reprint-bill/${masterCode}/`);
      if (response.success) {
        toast.success("Re-printing...");
        onSuccess?.();
      } else {
        toast.error("Failed to reprint");
      }
    } catch (error) {
      toast.error("Failed to reprint bill");
    } finally {
      setLoading(false);
      handleClose();
    }
  }, [masterCode, onSuccess, toast, handleClose]);

  const handlePrint = React.useCallback(async () => {
    if (!kotItems.length) {
      toast.warning("No items in the order");
      return;
    }

    setLoading(true);
    try {
     await processKotAndBill({kotTypeCode,isKotBased,masterCode,isBillPrintFirst:true,onSuccess,dispatch,toast,nonKotItems})
    } catch (error) {
      toast.error("Failed to print bill");
    } finally {
      setLoading(false);
      handleClose();
    }
  }, [kotItems.length, kotTypeCode, masterCode, isKotBased, isBillPrintFirst, onSuccess, dispatch, toast, handleClose]);

  // Only render if we have required props and modal is open
  if (!isOpen || !masterCode || !kotTypeCode || !kotItems.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl text-black font-semibold">Bill Preview</h2>
          <div className="flex items-center gap-2">
            {rePrint ? (
              <button
                onClick={handleReprint}
                disabled={loading}
                className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Printer size={16} />
                {loading ? "Processing..." : "Re-Print"}
              </button>
            ) : (
              <button
                onClick={handlePrint}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Printer size={16} />
                {loading ? "Processing..." : "Print Bill"}
              </button>
            )}
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="w-full text-gray-800 bg-white p-4 font-mono text-xs border-2 border-black">
            <div className="text-center mb-2">
              <h1 className="text-base font-bold">Restaurant Name</h1>
              <p>Tax Invoice</p>
            </div>

            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="flex justify-between">
                <span>Bill #: {masterCode}</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>

            {kotItems.map((item) => (
              <BillItem key={item.Code} item={item} />
            ))}

            <div className="mt-4 pt-2 border-t border-dashed border-black">
              <div className="flex justify-between mb-1">
                <span>Subtotal (Taxable):</span>
                <span>{Currency}{totals.totalTaxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Total Tax:</span>
                <span>{Currency}{totals.totalTax.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between mb-1">
                  <span>Discount:</span>
                  <span>-{Currency}{totals.discount.toFixed(2)}</span>
                </div>
              )}
              {totals.additionalCharges > 0 && (
                <div className="flex justify-between mb-1">
                  <span>Additional Charges:</span>
                  <span>{Currency}{totals.additionalCharges.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Net Total:</span>
                <span>{Currency}{totals.netTotal.toFixed(2)}</span>
              </div>
            </div>

            <PaymentDetails payments={payments} totalAmount={totals.netTotal} />
          </div>
          
          {!rePrint && (
            <div className="flex justify-end mt-4">
              {/* <button
                onClick={() => {
                  navigate(`/cash-counter/${masterCode}`,{ state: { from: location.pathname } });
                  handleClose();
                  dispatch(clearCart());
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Go to Menu
              </button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BillPreview);