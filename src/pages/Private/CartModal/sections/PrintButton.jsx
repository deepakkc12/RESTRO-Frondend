import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openPaymentModal } from "../../../../redux/paymentModal/action";
import {
  clearCart,
  PrintBill,
  updateCustomerNo,
} from "../../../../redux/cart/actions";
import { openKotPrintModal } from "../../../../redux/KotPrintModal/action";
import { postRequest } from "../../../../services/apis/requests";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../../../hooks/UseToast";
import { openBillPrintModal } from "../../../../redux/billPreviewModal/action";
import { KOT_TYEPES, userPrivileges } from "../../../../utils/constants";
import { hasPrivilege } from "../../../../utils/helper";
import { openRePrintKotModal } from "../../../../redux/RePrintKotModal/action";

const CartPrintButton = ({
  kotType,
  withoutKOT = [],
  withKOT = [],
  masterId,
  pendingItems,
  customerNo = "",
  numUpdated,
  isBillPrintFirst,
}) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(customerNo);
  const [vehicleLastDigits, setVehicleLastDigits] = useState("");
  const [priority, setPriority] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState("ring");
  const [tenderAmount, setTenderAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const {isKotBased} = useSelector(state=>state.settings) 

  // alert(customerNo)

  useEffect(()=>{
    setPhoneNumber(customerNo)
    return()=>{
      setPhoneNumber(customerNo)
    }
  },[customerNo])

  withoutKOT = [...withoutKOT, ...pendingItems];

  const navigate = useNavigate();
  // console.log(customerNo, numUpdated);

  const handlePrint = () => {
    // For Dine-In or Home Delivery, proceed directly without showing modal
    if (kotType == KOT_TYEPES.dineIn || kotType == KOT_TYEPES.homeDelivery) {
      console.log(`Print for KOT Type ${kotType} - No modal configuration`);
      handleProceed(navigateToBillStep);
      return;
    }

    // For Takeaway, proceed if `numUpdated` is true, otherwise show the modal
    if (kotType === KOT_TYEPES.takeAway) {
      if ( numUpdated) {
        if(isKotBased && withoutKOT.length!==0){
          setIsModalOpen(true);
        }else{
          handleProceed(navigateToBillStep);
        }
        
      } else {
        setIsModalOpen(true);
      }
      return;
    }

    // For Drive-Through, always show the modal
    if (kotType === KOT_TYEPES.driveThrough) {
      setIsModalOpen(true);
      return;
    }
  };

  const dispatch = useDispatch();

  const toast = useToast();
  const location = useLocation();

  const navigateToBillStep = () => {
    if (isBillPrintFirst) {
      dispatch(openBillPrintModal());
    } else {
      navigate(`/cash-counter/${masterId}`, {
        state: { from: location.pathname },
      });
    }
  };

  const NavigateToKotPrintStep = ()=>{
    setIsModalOpen(false)
    dispatch(openKotPrintModal())
  }

  const handleProceed = async (nextStep = ()=>{}) => {
    if (kotType == KOT_TYEPES.takeAway && phoneNumber == "" && !numUpdated) {
      toast.error("Enter customer phonenumber");
      return;
    } else {
      if (!loading) {

        setLoading(true);

        if (phoneNumber && !numUpdated) {
          const response = await postRequest(
            `kot/${masterId}/update-customer-no/`,
            { phoneNo: phoneNumber }
          );
          if (response.success) {
            toast.success("Customer number updated");
            dispatch(updateCustomerNo(phoneNumber));
          }
          nextStep()
          // navigateToBillStep();
        }
        nextStep()
        // navigateToBillStep();
        setLoading(false);

        return;

        const additionalDetails = {
          kotType,
          customerName,
          phoneNumber,
          ...(kotType == KOT_TYEPES.driveThrough && {
            vehicleLastDigits,
            priority,
          }),
          ...(kotType == "" && { deliveryPreference, tenderAmount }),
        };

        if (!kotType == KOT_TYEPES.dineIn) {
          // dispatch(openKotPrintModal())
          //   const response = await postRequest(`kot/update-kot-no/${masterId}/`)
          //   if (response.success){
          //   toast.success("Kot send to kitchen")
          //   // dispatch(fetchCart())
          // }
        }

        dispatch(openBillPrintModal());

        // openBillPreview()

        // dispatch(openPaymentModal())

        console.log("Printing with details:", additionalDetails);
        setLoading(false);
        setIsModalOpen(false);
      }
    }
  };

  const InputField = ({
    editable = true,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    maxLength,
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        disabled={!editable}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          transition-all duration-200"
      />
    </div>
  );

  const ToggleButton = ({ options, selected, onSelect }) => (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`py-2 px-3 rounded-md text-sm transition-all duration-200 
            ${
              selected === option
                ? "bg-green-600 text-white dark:bg-green-700"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderModalContent = () => {




    switch (kotType) {
      case KOT_TYEPES.takeAway:
        return renderTakeAwayContent();
      case KOT_TYEPES.driveThrough:
        return renderDriveThroughContent();
      case KOT_TYEPES.homeDelivery:
        return renderDeliveryContent();
      default:
        return null;
    }
  };

  const renderTakeAwayContent = () => (
    <div>
      {/* <InputField 
        label="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Enter customer name (Optional)"
      /> */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number
        </label>
        <input
        disabled={numUpdated}
          type="number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder={"Enter phone number "}
          // maxLength={maxLength}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          transition-all duration-200"
        />
      </div>
    </div>
  );

  const renderDriveThroughContent = () => (
    <div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Select Priority
        </h3>
        <ToggleButton
          options={["Quick", "30 Minutes", "60 Minutes"]}
          selected={priority}
          onSelect={setPriority}
        />
      </div>
      <InputField
        label="Last 4 Digits of Vehicle"
        value={vehicleLastDigits}
        onChange={(e) => setVehicleLastDigits(e.target.value)}
        placeholder="Enter last 4 digits"
        maxLength={4}
      />
      <InputField
        label="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Enter customer name (Optional)"
      />
      <InputField
        label="Phone Number"
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter phone number (Optional)"
      />
    </div>
  );

  const renderDeliveryContent = () => (
    <div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Delivery Preference
        </h3>
        <ToggleButton
          options={["Ring Bell", "Do Not Ring"]}
          selected={deliveryPreference === "ring" ? "Ring Bell" : "Do Not Ring"}
          onSelect={(val) =>
            setDeliveryPreference(val === "Ring Bell" ? "ring" : "no-ring")
          }
        />
      </div>
      <InputField
        label="Tender Amount"
        type="number"
        value={tenderAmount}
        onChange={(e) => setTenderAmount(e.target.value)}
        placeholder="Enter tender amount"
      />
      <InputField
        label="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Enter customer name (Optional)"
      />
      <InputField
        label="Phone Number"
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter phone number (Optional)"
      />
    </div>
  );

  const { user } = useSelector((state) => state.auth);

  const has_privilege = hasPrivilege(
    user.privileges,
    userPrivileges.cashCounter
  );

  const handlePrintKot = ()=>{
    handleProceed(NavigateToKotPrintStep)
  }

  if (!has_privilege) return null;
  return (
    <>
      <button
        onClick={handlePrint}
        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 
    ${
      (kotType == KOT_TYEPES.dineIn && withoutKOT.length > 0) ||
      (withoutKOT.length === 0 && withKOT.length === 0)
        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
        : "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white"
    }`}
        disabled={
          (kotType == KOT_TYEPES.dineIn && withoutKOT.length > 0) ||
          (withoutKOT.length == 0 && withKOT.length == 0)
        }
      >
        Print Bill
      </button>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
              {kotType == KOT_TYEPES.takeAway
                ? "Take Away"
                : kotType == KOT_TYEPES.driveThrough
                ? "Drive Through"
                : "Home Delivery"}
            </h2>
            {renderModalContent()}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              {isKotBased&& withoutKOT.length !==0 &&<button
            onClick={handlePrintKot}
            className="px-4 py-2 
              rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 hover:shadow-md transition-colors"
          >
            Proceed to KOT
          </button>}
              <button
                onClick={()=>{handleProceed(navigateToBillStep)}}
                className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
              >
                {loading ? "Proceeding..." : "Proceed to bill"}
              </button>
              
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPrintButton;
