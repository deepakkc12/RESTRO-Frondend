import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/UseToast";
import { CloseKotPrintModal } from "../../redux/KotPrintModal/action";
import { clearCart, fetchCart } from "../../redux/cart/actions";
import { postRequest } from "../../services/apis/requests";
import { Seperate_packing_code } from "../../utils/constants";
import { Printer, X, Loader } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openNewOrderModal } from "../../redux/newOrder/action";

const SeperatePack = () => (

  <div className="my-1 mb-2 text-center text-xs text-gray-500">
    <span className="inline-block w-full border-t border-dashed border-gray-500 relative">
      <span className="absolute top-[-0.6rem] left-1/2 transform -translate-x-1/2 dark:text-white dark:bg-gray-800 px-2 text-xs">
        separate packing
      </span>
    </span>
  </div>

);

const KOTPrintModal = ({ withOutKOT = [] }) => {
  const { isOpen } = useSelector((state) => state.kotPrintModal);
  const dispatch = useDispatch();

  withOutKOT = withOutKOT.filter((order) => order.isPending === 0);

  const close = () => {
    dispatch(CloseKotPrintModal());
  };

  const { cartId } = useSelector((state) => state.cart);
  const toast = useToast();

  // State to manage loading during printing
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handlePrint = async () => {
    setLoading(true);
    try {
      const response = await postRequest(`kot/update-kot-no/${cartId}/`);
      if (response.success) {
        dispatch(fetchCart());
        toast.success("KOT sent to kitchen");
        navigate("/menu")
        setTimeout(() => {
          
          dispatch(openNewOrderModal())
          dispatch(clearCart())
        }, 300);
        close();
      }
    } catch (error) {
      toast.error("Failed to print KOT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl text-black font-semibold">
                Kitchen Order Ticket
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  disabled={loading}
                  className={`${
                    loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
                  } text-white px-4 py-2 rounded-md transition-colors flex items-center`}
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin mr-2" />
                  ) : (
                    <Printer size={16} className="mr-2" />
                  )}
                  {loading ? "Printing..." : "Print KOT"}
                </button>
                <button
                  onClick={close}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="w-full text-gray-800 bg-white p-4 font-mono text-xs border-2 border-black">
                {/* Preview of KOT content */}
                <div className="text-center mb-2">
                  <h1 className="text-base font-bold">Restaurant Name</h1>
                  <p>Kitchen Order Ticket (KOT)</p>
                </div>

                <div className="border-b border-dashed border-black pb-2 mb-2">
                  <div className="flex justify-between">
                    <span>Order #: {cartId}</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                </div>

                {/* Items Preview */}
                <div>
                  {withOutKOT.map((item) => {
                    const isAddon = !item.SubSkuCode;
                    const separator = item.SubSkuCode === Seperate_packing_code;
                    return separator ? (
                      <SeperatePack key={item.Code} />
                    ) : (
                      <div
                        key={item.Code}
                        className="mb-2 pb-1 border-b border-dashed border-gray-300"
                      >
                        <div className="flex justify-between">
                          <div>
                            <span className="font-semibold flex text-black">
                              {isAddon && (
                                <div className="text-xs pr-2 text-purple-600">
                                  <span>➤ Add-on</span>
                                </div>
                              )}
                              {item.SkuName}
                            </span>
                          </div>

                          <span className="font-bold">
                            Qty: {item.Qty || 1}
                          </span>
                        </div>

                        {item.Details && (
                          <div className="mt-1 text-gray-600 italic">
                            <span>Notes: {item.Details}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-2 border-t border-dashed border-black text-center text-xs">
                  <p>Thank you for your order!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KOTPrintModal;
