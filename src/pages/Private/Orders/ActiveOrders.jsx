import PrintButton from "../../../Features/Buttons/PrintButton";
import CancelOrderButton from "./CancelButton";
import NumericKeyboard from "../../../Features/KeyBoards/NumberKeyboard";
import BillPreview from "../../../Features/Printers/BillPrintPreview";
import KotTypeSelector from "../../../Features/modals/KotTypeSelector";
import SplitBill from "../../../Features/modals/SplitBill";
import CancelOrderModal from "./CancelOrderModal";
import OrderHeader from "../../../components/Headers/OrderHeader";
import { clearCart, fetchCart } from "../../../redux/cart/actions";
import { getRequest } from "../../../services/apis/requests";
import { Currency, KOT_TYEPES } from "../../../utils/constants";
import CartModal from "../CartModal/CartModal";
import {
  List,
  FileText,
  Clock,
  Users,
  ShoppingCart,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileWarning,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { openCARTModal } from "../../../redux/cartMoodal/action";
import { openSplitBillModal } from "../../../redux/spliBillModal/action";
import { openMergeBillModal } from "../../../redux/mergeBillModal/action";
import MergeBill from "../../../Features/modals/MergeBill";

const FullWidthOrderManagement = () => {
  const [selectedKotType, setSelectedKotType] = useState("Dine-In");
  const [originalOrders, setOriginalOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize dark mode on component mount
  // useEffect(() => {
  //   document.documentElement.classList.add("dark");
  // }, []);

  const groups = [
    { label: "Dine-In", code: KOT_TYEPES.dineIn },
    { label: "Take Away", code: KOT_TYEPES.takeAway },
    { label: "Home Delivery", code: KOT_TYEPES.homeDelivery },
    // { label: "Drive Through", code: KOT_TYEPES.driveThrough },
  ];

  const [isCartOpen, setIsCartOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const removeOrder = (code) => {
    const remainingOrders = originalOrders.filter(
      (order) => order.Code !== code
    );
    setOriginalOrders(remainingOrders);
  };

  const getActiveOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRequest(`kot/active-list/`);

      // Sort orders by Code and ensure unique orders
      const sortedOrders = Array.from(
        new Map(response.data.map((order) => [order.Code, order])).values()
      ).sort((a, b) => parseInt(a.Code) + parseInt(b.Code));

      setOriginalOrders(sortedOrders);
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [billDetails, setBillDetails] = useState({
    code: null,
    subtotal: 0,
    tax: 0,
    discount: 0,
    additionalCharges: 0,
    items: [],
  });

  useEffect(() => {
    getActiveOrders();
  }, []);

  const { isBillPrintFirst, isTokenBased, loading } = useSelector(
    (state) => state.settings
  );

  // Filter orders for each group and handle search
  const groupedOrders = useMemo(() => {
    return groups.reduce((acc, group) => {
      const ordersForGroup = originalOrders.filter(
        (order) => order.KotTypeCode === group.code
      );
  
      // Filter orders based on the search term and the selected KotTypeCode
      const filteredOrders = ordersForGroup.filter((order) => {
        if (!searchTerm) return true; // No filtering if no search term
  
        // Apply search logic based on KotTypeCode
        if (group.code === KOT_TYEPES.takeAway) {
          return order.CustomerMobileNo?.toString().includes(searchTerm);
        } else if (group.code === KOT_TYEPES.homeDelivery) {
          return order.CustomerCode?.toString().includes(searchTerm);
        } else {
          return order.TokenNo?.toString().includes(searchTerm); // Default search logic
        }
      });
  
      return {
        ...acc,
        [group.label]: filteredOrders,
      };
    }, {});
  }, [originalOrders, searchTerm, groups]);

  const renderOrderCard = (order) => {
    const handleClick = () => {
      dispatch(clearCart())
      dispatch(fetchCart(order.Code, () => { dispatch(openCARTModal()) }));
      navigate("/menu");
      // dispatch(openCARTModal())
    };

    return (
      <div
        key={order.Code}
        className="
          cursor-pointer
          bg-white dark:bg-white/5
          border border-gray-200 dark:border-white/10
          rounded-2xl 
          shadow-md hover:shadow-lg
          transition-all duration-300
          p-5 mb-4
          space-y-4
        "
      >
        {/* Order Header */}
        <div className="flex justify-between items-start border-b pb-4 border-gray-100 dark:border-white/10">
          <div className="flex-grow space-y-2">
            <div className="flex items-center space-x-3">
              <ShoppingCart
                className="text-emerald-600 dark:text-emerald-400"
                size={24}
                strokeWidth={2}
              />
              <div>
                <h3 className="font-bold text-lg text-gray-900 gap-4 dark:text-white flex items-center">
                  {order.TokenNo && <span>Token #{order.TokenNo}</span>}
                  {order.TableNo && <span>Table #{order.TableNo}</span>}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-x-2">
                  Order #{order.Code}
                  {order.PendingItems > 0 && (
                    <AlertCircle
                      className="ml-2 text-yellow-500"
                      size={18}
                      strokeWidth={2}
                      title="Pending Items"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Cancel Order Button */}
            <CancelOrderButton order={order} />

            {/* Conditionally Render the Print Bill Button or Status */}
            {order.KotItems > 0 && order.PendingItems == 0 ? (
              <PrintButton
                billDetails={billDetails}
                setBillDetails={setBillDetails}
                isBillPrintFirst={isBillPrintFirst}
                phone={order.CustomerMobileNo}
                removeOrder={() => removeOrder(order.Code)}
                kotType={order.KotTypeCode}
                masterId={order.Code}
                newBill={true}
              />
            ) : (
              <span className="text-red-400 text-sm">
                {order.PendingItems > 0
                  ? "Pending Items in cart"
                  : "No Items in cart"}
              </span>
            )}

            {/* View Cart Button */}
            <button
              onClick={handleClick}
              className="flex items-center px-4 py-2 rounded-lg 
               bg-emerald-500 text-white font-semibold 
               hover:bg-emerald-600 transition-all 
               duration-200 shadow-sm"
              aria-label="View Cart"
            >
              <span>Cart</span>
            </button>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Customer Details */}
          <div className="flex items-center space-x-2">
            <Users
              className="text-emerald-600 dark:text-emerald-400"
              size={18}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {order.CustomerMobileNo || "No Customer Info"}
            </span>
          </div>

          {/* Date and Time */}
          <div className="flex items-center space-x-2">
            <Clock
              className="text-emerald-600 dark:text-emerald-400"
              size={18}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {order.DOT} - {order.TOT}
            </span>
          </div>

          {/* Order Status and Total */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className="text-emerald-600 dark:text-emerald-400"
                size={18}
              />
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Items: {order.KotItems}
                </span>
              </div>
            </div>

            {order.PendingItems > 0 && (
              <div className="flex items-center space-x-2">
                <AlertCircle
                  className="text-orange-600 dark:text-orange-400"
                  size={18}
                />
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Pending items: {order.PendingItems}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      setBillDetails({
        code: null,
        subtotal: 0,
        tax: 0,
        discount: 0,
        additionalCharges: 0,
        items: [],
      })
    }
  }, [])

  return (
    <div
      className="
      min-h-screen 
      bg-gray-50 dark:bg-gray-900 
      text-gray-900 dark:text-white
      transition-colors duration-300
    "
    >
      <OrderHeader />
      <div className="p-4 sm:p-6">
        <div className="sticky top-16 pt-2 bg-gray-50 dark:bg-gray-900 ">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h1
              className="
            text-2xl md:text-3xl font-bold flex items-center
            text-gray-900 dark:text-white
          "
            >
              <List
                className="mr-3 text-emerald-600 dark:text-emerald-400"
                size={28}
              />
              Active Orders
            </h1>

            {/* Search Section */}
            <div className="relative w-full md:w-72">
              <input
                type="number"
                name='search'
                placeholder={
                  selectedKotType === 'Take Away'
                    ? "Search by Mobile Number"
                    : selectedKotType === 'Home Delivery'
                      ? "Search by Customer Code"
                      : "Search by Token Number"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                w-full
                bg-white dark:bg-white/10 
                border border-gray-300 dark:border-white/20 
                rounded-lg pl-10 pr-4 py-2 
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 
                focus:ring-emerald-600 dark:focus:ring-emerald-500
                transition-all duration-300
              "
              />
              <Search
                className="
                absolute left-3 top-1/2 transform -translate-y-1/2 
                text-gray-500 dark:text-gray-400
              "
                size={20}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="mb-6 flex flex-wrap space-x-2 sm:space-x-3">
              {groups
                .map((group) => (
                  <button
                    key={group.label}
                    onClick={() => {
                      setSelectedKotType(group.label);
                      setSearchTerm(""); // Reset search when changing KOT type
                    }}
                    className={`
                  px-3 sm:px-4 py-2 
                  font-semibold rounded-md text-sm 
                  transition-all
                  ${selectedKotType === group.label
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20"
                      }
                `}
                  >
                    {group.label} ({groupedOrders[group.label].length})
                  </button>
                ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { dispatch(openSplitBillModal()) }} 
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all"
              >
                Split Bill
              </button>

              <button 
                onClick={() => { dispatch(openMergeBillModal()) }} 
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all"
              >
                Merge Bill
              </button>
            </div>
          </div>
        </div>
        {/* KOT Type Selector */}

        {/* Order List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2
                className="animate-spin text-emerald-600 dark:text-emerald-400"
                size={48}
              />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              {error}
              <button
                onClick={getActiveOrders}
                className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-md"
              >
                Retry
              </button>
            </div>
          ) : (
            selectedKotType && (
              <div>
                <h2
                  className="
                text-xl font-semibold mb-4 flex items-center
                text-emerald-600 dark:text-emerald-400
              "
                >
                  <FileText className="mr-3" size={24} />
                  {selectedKotType} Orders
                </h2>
                {groupedOrders[selectedKotType]?.length > 0 ? (
                  <div className="space-y-4">
                    {groupedOrders[selectedKotType].map(renderOrderCard)}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 dark:text-gray-500">
                    {searchTerm
                      ? `No orders found matching "${searchTerm}"`
                      : "No orders available"}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>
      <NumericKeyboard variant="centre" />
      <BillPreview
        kotTypeCode={billDetails.KotTypeCode}
        masterCode={billDetails.code}
        items={billDetails.items}
        billDetails={billDetails}
        removeOrder={(code) => {
          removeOrder(code);
        }}
        onSuccess={() => { getActiveOrders() }}
      // handelPayment={()=>{dispatch(CloseBillPrintModal())}}
      />
      <SplitBill onSuccess={() => { getActiveOrders() }} />
      <KotTypeSelector />
      <MergeBill onSuccess={() => { getActiveOrders() }} />
      
      {/* Cancel Order Modal */}
      <CancelOrderModal onSuccess={() => { getActiveOrders() }} />
    </div>
  );
};

export default FullWidthOrderManagement;