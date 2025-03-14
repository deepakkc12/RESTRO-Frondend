import PrintButton from "../../../Features/Buttons/PrintButton";
import NumericKeyboard from "../../../Features/KeyBoards/NumberKeyboard";
import BillPreview from "../../../Features/Printers/BillPrintPreview";
import KotTypeSelector from "../../../Features/modals/KotTypeSelector";
import SalesAdjustmentModal from "../../../Features/modals/SaleAdjustmentModal";
import SplitBill from "../../../Features/modals/SplitBill";
import OrderHeader from "../../../components/Headers/OrderHeader";
import TenderHeader from "../../../components/Headers/TenderHeader";
import { openBillPrintModal } from "../../../redux/billPreviewModal/action";
import { fetchCart } from "../../../redux/cart/actions";

import { getRequest } from "../../../services/apis/requests";

import { Currency, KOT_TYEPES, userPrivileges } from "../../../utils/constants";
import { hasPrivilege } from "../../../utils/helper";

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
  CheckCheck,
  OctagonX,
  Printer,
  MoveRight,
  ArrowRightCircle,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const CashCounterList = () => {
  const [selectedKotType, setSelectedKotType] = useState("Dine-In");
  const [originalOrders, setOriginalOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize dark mode on component mount

  //   useEffect(() => {
  //     document.documentElement.classList.add("dark");
  //   }, []);

  const { user } = useSelector((state) => state.auth);

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
  const [selectedMaster, setSelectedMasterItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedbillDetails, setselectedBillDetails] = useState({
    code: null,
    subtotal: 0,
    tax: 0,
    discount: 0,
    additionalCharges: 0,
    items: [],
  });

  const [selectedBillPayments,setSelectedBillPayments] = useState(
    [
        { method: "cash", amount: null },
        { method: "card", amount: null },
        { method: "touchngo", amount: null },
        { method: "bankqr", amount: null },
      ]
  )
  const getActiveOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRequest(`kot/today-sales-list/?all=true`);

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

  const [openSalesAdjustmentModal, setOpenSalesAdjustmentModal] =
    useState(false);

    const { isBillPrintFirst, isTokenBased } = useSelector(
      (state) => state.settings
    );

 


  useEffect(() => {
    getActiveOrders();
  }, []);

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
        if (group.code ===KOT_TYEPES.takeAway) {
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

  const location = useLocation()

  const renderOrderCard = (order) => {
    const handleClick = async () => {

      const response = await getRequest(`sales/item-details/${order.Code}/`);

      if (response.success) {
        setSelectedMasterItems(response.data);
        setselectedBillDetails((prev) => ({
            code: response.data.Code,
            subtotal: parseFloat(response.data.TotalTaxable) || 0,
            tax: parseFloat(response.data.TotalTax) || 0,
            discount: parseFloat(response.data.InvoiceDiscount) || null,
            additionalCharges: parseFloat(response.data.InvoiceCharges) || 0,
            // items: transformedItems,
          }));

         setSelectedBillPayments(
          [  { method: "cash", amount: response.data.Cash },
            { method: "card", amount: response.data.Card },
            { method: "Wallet", amount: response.data.Wallet },]
            // { method: "bankqr", amount: null },
         )
      }

      dispatch(openBillPrintModal());

    };

    const handlesalesAdjustment = () => {
      setSelectedOrder(order);
      setOpenSalesAdjustmentModal(true);
    };

    const handleNavigate = ()=>{
      navigate(`/cash-counter/${order.Code}`,{ state: { from: location.pathname } })
    }
    const hasReprintPrivilege = hasPrivilege(user.privileges, userPrivileges.reprint_bill);
    

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
                 { order.CashCounterStatus == 2 ? <CheckCheck className="text-green-600"/> :<OctagonX className="text-red-500"/>}
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
          <div className="flex items-center space-x-4">
            { (
              <>
                {hasReprintPrivilege&&<button
                  onClick={handleClick}
                  className="flex items-center px-4 py-2 rounded-lg 
             bg-emerald-500 text-white font-semibold 
             hover:bg-emerald-600 transition-all 
             duration-200 shadow-sm"
                  aria-label="View Cart"
                >
                  <span className="flex items-center gap-2">Re-print <Printer size={14}/></span>
                </button>}
                {order.CreditAmount==0 && user.isAdmin &&<button
                  onClick={handlesalesAdjustment}
                  className="flex items-center px-4 py-2 rounded-lg 
             bg-emerald-500 text-white font-semibold 
             hover:bg-emerald-600 transition-all 
             duration-200 shadow-sm"
                  aria-label="View Cart"
                >
                  <span>Sales adjustment</span>
                </button>}
                
               {isBillPrintFirst && order.CashCounterStatus==1 && <button
                  onClick={handleNavigate}
                  className="flex items-center px-4 py-2 rounded-lg 
             bg-emerald-500 text-white font-semibold 
             hover:bg-emerald-600 transition-all 
             duration-200 shadow-sm"
                  aria-label="View Cart"
                >
                  <span className="flex items-center justify-center gap-2">Cash Counter <ArrowRightCircle size={14}/></span>
                </button>}
              </>
            )}
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
        </div>
      </div>
    );
  };

  return (
    <div
      className="
      min-h-screen 
      bg-gray-50 dark:bg-gray-900 
      text-gray-900 dark:text-white
      transition-colors duration-300
    "
    >
      <TenderHeader />
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
            Cash Counter 
          </h1>

          {/* Search Section */}
          <div className="relative w-full md:w-72">
            <input
              type="number"
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
                  ${
                    selectedKotType === group.label
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20"
                  }
                `}
              >
                {group.label} ({groupedOrders[group.label].length})
              </button>
            ))}
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
      {<BillPreview
      billDetails={selectedbillDetails}
      payments={selectedBillPayments}
        items={selectedMaster.items}
        masterCode={selectedMaster.Code}
        rePrint={true}
      />}
      <SplitBill />
      <KotTypeSelector />
      {/* <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} /> */}
      {user.isAdmin && openSalesAdjustmentModal && selectedMaster && (
        <SalesAdjustmentModal
        salesCode={selectedOrder.Code}
          isOpen={openSalesAdjustmentModal}
          onClose={() => {
            setOpenSalesAdjustmentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CashCounterList;