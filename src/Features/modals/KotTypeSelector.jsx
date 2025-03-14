import { useToast } from "../../hooks/UseToast";
import { loginSuccess } from "../../redux/Authentication/action";
import { clearCart, createNewCart } from "../../redux/cart/actions";
import { CloseNewOrderModal } from "../../redux/newOrder/action";
import {
  getRequest,
  patchRequest,
  postRequest,
} from "../../services/apis/requests";
import { IMAGE_BASE_URL, KOT_TYEPES } from "../../utils/constants";
import { X, Search, Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const DeliveryPartners = [
  { id: 1, name: "Swiggy", logo: "/api/placeholder/200/100" },
  { id: 2, name: "Zomato", logo: "/api/placeholder/200/100" },
  { id: 3, name: "Uber Eats", logo: "/api/placeholder/200/100" },
  { id: 4, name: "Internal Delivery", logo: "/api/placeholder/200/100" },
];

const KotTypeSelector = () => {
  const [selectedKotType, setSelectedKotType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHomeDeliveryModal, setShowHomeDeliveryModal] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [tokenNumber, setTokenNumber] = useState("");
  const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);

  const inputRef = useRef(null);
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { isOpen,kotTypes } = useSelector((state) => state.newOrderModal);
  const { cartId, items } = useSelector(state => state.cart);



  const onClose = () => {
    setSelectedKotType(null);
    dispatch(CloseNewOrderModal());
  };



  const getPartners = async () => {
    const response = await getRequest("delivery-partners-images");
    setDeliveryPartners(response.data);
  };

  useEffect(() => {
    if(isOpen){

      getPartners();
    }
  }, [isOpen]);

  useEffect(() => {
    if (showTokenInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTokenInput]);

  const handlePartnerSelect = (partner) => {
    setSelectedPartner(partner);
    setShowTokenInput(true);
  };

  const handleTokenSubmit = () => {
    if (!tokenNumber.trim()) {
      toast.error("Please enter a token number");
      return;
    }
    handleHomeDeliveryProceed(selectedPartner, tokenNumber);
  };

  const handleBackToPartners = () => {
    setShowTokenInput(false);
    setSelectedPartner(null);
    setTokenNumber("");
  };

  const handleProceed = async (selectedKotType) => {
    dispatch(clearCart());

    if (selectedKotType) {
      
      if (selectedKotType.refCode == KOT_TYEPES.dineIn) {
        navigate("/table?type=new-order", {
          state: { refCode: selectedKotType.refCode },
        });
        onClose();

      } else {
        dispatch(
          createNewCart(
            null,
            null,
            null,
            toast,
            null,
            selectedKotType.refCode
          )
        );
        onClose();
    navigate("/menu");


        // if (skuId) {
        //   // navigate("/menu");
        // } else {
        //   navigate("/menu");
        // }
      }
    } else {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (selectedKotType?.refCode == KOT_TYEPES.homeDelivery) {
      setShowHomeDeliveryModal(true);
    }
  }, []);

  // useEffect(()=>{
  //   if(selectedKotType){
  //     handleProceed()
  //   }
  // },[])

  const handleContinueWithCurrentOrder = () => {
    dispatch(CloseNewOrderModal());
    navigate("/menu");
  };

  const handleRemoveCurrentOrder = async () => {
    const response = await postRequest(`kot/${cartId}/remove`);
    if (response.success) {
      dispatch(clearCart());
      setShowEmptyCartModal(false);
      toast.success("Order Deleted");
    } else {
      toast.error("Error deleting order");
    }
  };

  const handleHomeDeliveryProceed = async (partner, token) => {
    dispatch(clearCart());

    dispatch(
      createNewCart(
        null,
        token,
        null,
        toast,
        partner.code,
        selectedKotType.refCode,
      )
    );
    setShowHomeDeliveryModal(false);
    setShowTokenInput(false);
    onClose();
    navigate("/menu");
  };

  if (!isOpen) return null;

  if (showEmptyCartModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
        <div className="relative w-full max-w-md mx-auto">
          <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none dark:bg-gray-800 focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid rounded-t">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Active Order Without Items
              </h3>
              <button
                onClick={() => setShowEmptyCartModal(false)}
                className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There is an active order with no items added. What would you like to do?
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleContinueWithCurrentOrder}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                >
                  Continue with current order
                </button>
                <button
                  onClick={handleRemoveCurrentOrder}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Remove Current Order
                </button>
                <button
                  onClick={() => setShowEmptyCartModal(false)}
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                >
                  Continue new order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showHomeDeliveryModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
        <div className="relative w-auto max-w-3xl mx-auto my-6 shadow-lg">
          <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none dark:bg-gray-800 focus:outline-none">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700 rounded-t">
  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
  Take new order 
  </h3>
  <button
    className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
    onClick={onClose}
    aria-label="Close"
  >
    <X className="w-6 h-6" />
  </button>
</div>


            {/* Content */}
            <div className="relative flex-auto p-6">
              {error && (
                <div className="mb-4 text-red-500 bg-red-100 p-3 rounded">
                  {error}
                </div>
              )}

              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Please select a Kitchen Order Type to proceed
              </p>

              <div className={`grid ${kotTypes.length==3?"grid-cols-3":"grid-cols-4"} gap-4 pb-4`}>
                {kotTypes.map((kotType) => (
                  <button
                    key={kotType.Code}
                    onClick={() => {
                      setSelectedKotType(kotType)
                      if (kotType.Code == 3) {
                        setShowHomeDeliveryModal(true);
                      }else{
                        handleProceed(kotType);
                      }
                    }}
                    disabled={isLoading}
                    className={`p-4 rounded-lg border-2 text-center font-semibold transition-all duration-200 
                      ${
                        selectedKotType?.Code === kotType.Code
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600"
                      }
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {kotType.Name}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            {/* <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
              <button
                className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-gray-600 uppercase transition-all duration-150 ease-linear outline-none background-transparent focus:outline-none"
                type="button"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className={`px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none 
                  ${
                    selectedKotType && !isLoading
                      ? "bg-blue-500 active:bg-blue-600 hover:shadow-lg focus:outline-none"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                type="button"
                onClick={handleProceed}
                disabled={!selectedKotType || isLoading}
              >
                {isLoading ? "Processing..." : "Proceed"}
              </button>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  if (showHomeDeliveryModal) {

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
        <div className="relative w-full max-w-2xl mx-auto my-6 shadow-lg">
          <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none dark:bg-gray-800 focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h4 className="text-2xl font-semibold dark:text-white">
                {showTokenInput ? "Enter Token Number" : "Select Delivery Partner"}
              </h4>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                onClick={() => {
                  if (showTokenInput) {
                    handleBackToPartners();
                  } else {
                    setShowHomeDeliveryModal(false);
                  }
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {!showTokenInput ? (
                // Delivery Partners Grid
                <div className="grid grid-cols-4 gap-6">
                  {deliveryPartners?.map((partner) => (
                    <button
                      key={partner.code}
                      className="flex border p-4 rounded-lg flex-col items-center justify-center hover:border-blue-500 transition-colors"
                      onClick={() => handlePartnerSelect(partner)}
                    >
                      <img
                        src={`${IMAGE_BASE_URL}${partner.url}`}
                        alt={partner.code}
                        className="w-3/4 object-contain"
                      />
                      <span className="text-lg dark:text-white mt-3 font-medium">
                        {partner.code}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                // Enhanced Token Input Section
                <div className=" mx-auto  space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-6">
                      <img
                        src={`${IMAGE_BASE_URL}${selectedPartner.url}`}
                        alt={selectedPartner.code}
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter Token Number for {selectedPartner?.code}
                    </label>
                    <input
                      ref={inputRef}
                      type="number"
                      value={tokenNumber}onChange={(e) => setTokenNumber(e.target.value)}
                      className="w-full px-6 py-4 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter token number"
                    />
                  </div>
                  <div className="flex space-x-4 pt-3">
                    <button
                      onClick={handleBackToPartners}
                      className="flex-1 px-3 py-2 text-lg font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Back to Partners
                    </button>
                    <button
                      onClick={handleTokenSubmit}
                      className="flex-1 px-3 py-2 text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Proceed with Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default KotTypeSelector;