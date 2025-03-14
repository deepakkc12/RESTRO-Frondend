import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { data, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/UseToast";
import { openBillPrintModal } from "../../redux/billPreviewModal/action";
import { clearCart, fetchCart } from "../../redux/cart/actions";
import { postRequest } from "../../services/apis/requests";
import { KOT_TYEPES, userPrivileges } from "../../utils/constants";
import { hasPrivilege } from "../../utils/helper";
import { openRePrintKotModal } from "../../redux/RePrintKotModal/action";

const TakeAwayModal = ({
  isOpen,
  onClose,
  onProceed,
  phoneNumber,
  setPhoneNumber,
  handlePrintKot,
  isKotBased
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Take Away
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            type="number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              transition-all duration-200"
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 
              rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white 
              rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
          >
            Proceed to bill
          </button>
          {isKotBased&&<button
            onClick={handlePrintKot}
            className="px-4 py-2 
              rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 hover:shadow-md transition-colors"
          >
            Print KOT
          </button>}
        </div>
      </div>
    </div>
  );
};

const PrintButton = ({
  kotType,
  masterId,
  phone = "",
  isBillPrintFirst = false,

  billDetails = null,
  setBillDetails = () => {},
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const {isKotBased} = useSelector(state =>state.settings)


  const location = useLocation();

  const openBillPreview = () => {
    // dispatch(
    //   fetchCart(masterId,toast.success('khjb'))
    // )
    dispatch(
      fetchCart(masterId, (data) => {
        setBillDetails((prev) => ({
          code: data.Code,
          subtotal: parseFloat(data.TotalTaxable) || 0,
          tax: parseFloat(data.TotalTax) || 0,
          discount: parseFloat(data.InvoiceDiscount) || null,
          additionalCharges: parseFloat(data.InvoiceCharges) || 0,
          items: data.items,
          KotTypeCode: data.KotTypeCode,
        }));

        dispatch(openBillPrintModal());
      })
    );
  };

  const handlePhoneNumberUpdate = async () => {
    const response = await postRequest(`kot/${masterId}/update-customer-no/`, {
      phoneNo: phoneNumber,
    });

    if (response.success) {
      toast.success("Customer number updated");
    }
  };

  const navigateToBillStep = () => {
    if (isBillPrintFirst) {
      openBillPreview();
    } else {
      navigate(`/cash-counter/${masterId}`, {
        state: { from: location.pathname },
      });
    }
  };

  const navigateToPrintKotStep = ()=>{
    dispatch(openRePrintKotModal())
  }


  const handleProceed = async (nextStep = ()=>{}) => {
    if (kotType === KOT_TYEPES.takeAway && !phoneNumber) {
      toast.error("Enter customer phone number");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      if (phoneNumber && !phone) {
        await handlePhoneNumberUpdate();
      }

      nextStep()
      // navigateToNextStep();
    } catch (error) {
      toast.error("An error occurred while processing");
    } finally {
      setLoading(false);
    }
  };

  const openPreview = () => {
    dispatch(clearCart());
    dispatch(fetchCart(masterId));
    if (
      kotType === KOT_TYEPES.dineIn ||
      kotType === KOT_TYEPES.homeDelivery ||
      (kotType === KOT_TYEPES.takeAway && phone)
    ) {
      handleProceed(navigateToBillStep);
      return;
    }

    setIsModalOpen(true);
  };

  const handlePrintKot = ()=>{
    handleProceed(navigateToPrintKotStep)
  }

  if (!hasPrivilege(user.privileges, userPrivileges.cashCounter)) {
    return null;
  }

  return (
    <>
      <button
        onClick={openPreview}
        className="py-3 px-4 w-full rounded-lg flex items-center justify-center gap-2 
                   transition-all duration-300 
                   bg-green-500 dark:bg-green-600 
                   hover:bg-green-600 dark:hover:bg-green-700 
                   text-white font-medium shadow-sm"
        aria-label="Print Bill"
        disabled={loading}
      >
        {loading ? "Processing..." : "Print Bill"}
      </button>

      <TakeAwayModal
        isOpen={isModalOpen && kotType === KOT_TYEPES.takeAway}
        onClose={() => setIsModalOpen(false)}
        onProceed={()=>{handleProceed(navigateToBillStep)}}
        phoneNumber={phoneNumber}
        isKotBased = {isKotBased}
        setPhoneNumber={setPhoneNumber}
        handlePrintKot={handlePrintKot}
      />
    </>
  );
};

export default PrintButton;
