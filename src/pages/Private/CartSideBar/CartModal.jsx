import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  updateItemPreference,
  clearCart,
} from "../../../redux/cart/actions";

import {
  Coffee,
  ShoppingCart,
  ListOrdered,
  Info,
  Plus,
  Edit,
  Gift,
} from "lucide-react";
import PreferencesModal from "./sections/PreferenceModal";
import CartItemList from "./CartItemList";
import CartFooter from "./CartFooter";
import CartHeader from "./CartHeader";
import ComplementaryDetailsModal from "./sections/ComplimetaryModal";
import KOTPrintModal from "../../../Features/Printers/KotPrint";
import { KOT_TYEPES, Seperate_packing_code } from "../../../utils/constants";
import ReprintKOTModal from "../../../Features/modals/RePrintKot";
import { useToast } from "../../../hooks/UseToast";
import BarcodeItemModal from "../../../Features/modals/BarcodeModal";
import { useLocation } from "react-router-dom";
import { CloseCARTModal } from "../../../redux/cartMoodal/action";
import BillPrintPreview from "../../../Features/Printers/BillPrintPreview";
import { CloseBillPrintModal } from "../../../redux/billPreviewModal/action";
import { openNewOrderModal } from "../../../redux/newOrder/action";

const CartSideBar = ({ onupdateItem = () => {},billPreview = true,setSelectedCartItem,setSelectedItemMenu ,openMenuModal}) => {
  const modalRef = useRef(null);

  const dispatch = useDispatch();
  const {
    items: cartItems,
    cartId,
    kotType,
    isVeg,
    customerNo,
  } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  // console.log(user)

  const { isOpen } = useSelector((state) => state.cartModal);
  const onClose = () => {
    dispatch(CloseCARTModal());
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      dispatch(CloseCARTModal());
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // State management
  const [expandedItems, setExpandedItems] = useState({});
  const [complementaryItem, setComplementaryItem] = useState(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [barcodeItem, setBarcodeItem] = useState(null);

  const [isBarcodeModalOpen, setBarcodeModalOpen] = useState(false);

  const [orderDetails, setOrderDetails] = useState({});

  // console.log(cartItems)
  // Load cart on component mount
  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchCart(null, (order) => {
          setOrderDetails(order);
          console.log(order);
        })
      );
    }
  }, [isOpen, dispatch]);

  console.log(orderDetails);

  // Enhanced Utility Functions
  const groupItemsByKOT = () => {
    return cartItems.reduce(
      (groups, item) => {
        console.log(item);
        const key = item.KOTNo == 0 ? "withoutKOT" : "withKOT";
        groups[key].push(item);
        return groups;
      },
      { withKOT: [], withoutKOT: [] }
    );
  };

  const calculateTotal = (items) =>
    items.reduce((acc, item) => {
      // Skip item if Code is 1
      if (item.SubSkuCode == Seperate_packing_code) {
        return acc;
      }

      // Prefer TOT, fallback to Rate * Qty
      const itemTotal = parseFloat(item.Rate) * (item.Qty || 1);
      return acc + itemTotal;
    }, 0);

  // Item Interaction Handlers
  const toggleItemDetails = (itemCode) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemCode]: !prev[itemCode],
    }));
  };

  const openPreferencesModal = (item) => {
    if (item.KOTNo == 0) {
      setSelectedItem(item);
      setIsPreferencesModalOpen(true);
    }
  };

  const openComplementaryModal = (item) => {
    if (item.KOTNo !== 0) {
      setComplementaryItem(item);
    }
  };

  const closeComplementaryModal = () => {
    setComplementaryItem(null);
  };

  const toast = useToast();
  const handleSavePreferences = (preferenceText) => {
    if (selectedItem) {
      dispatch(
        updateItemPreference(
          selectedItem.Code.toString(),
          preferenceText,
          toast
        )
      );
      setIsPreferencesModalOpen(false);
    }
  };

  const handleUpdateQuantity = (itemCode, quantityChange, currentQty) => {
    const qty = currentQty +quantityChange
    if(qty == 0){
      return
    }
    dispatch(
      updateItemQuantity(
        itemCode?.toString(),
        quantityChange,
        currentQty,
        onSuccessUpdate
      )
    );
  };

  const handleRemoveItem = (itemCode) => {
    dispatch(removeItemFromCart(itemCode.toString(), toast, onSuccessUpdate));
  };

  // Render Helpers
  const renderItemDetails = (item) => {
    const details = [
      {
        label: "Preferences",
        visible: item.KOTNo == 0?true:item.Details.length > 0
        ,
        editable: item.KOTNo == 0,
        value:
          item.KOTNo == 0
            ? item.Details || "Add Preferences"
            : item.Details || "No prefferences",
        onClick: () => item.KOTNo == 0 && openPreferencesModal(item),
      },
      {
        label: "Complementary",
        visible: item.KOTNo != 0,
        editable: item.KOTNo != 0,
        value: item.IsComplementary ? "Yes" : "No",
        onClick: () => item.KOTNo > 0 && openComplementaryModal(item),
      },
    ];

    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-1 rounded-lg mt-1">
        {details
          .filter(
            (detail) =>
              detail.visible &&
              detail.value !== undefined &&
              detail.value !== null
          )
          .map((detail, index) => (
            <div
              key={index}
              onClick={detail.onClick}
              className="flex mt-1 cursor-pointer justify-between text-sm 
                         hover:bg-gray-100 dark:hover:bg-gray-600 
                         p-1 rounded transition-colors"
            >
              <span className="text-gray-600 dark:text-gray-300">
                {detail.label}:
              </span>
              <span className="">
                {detail.value}
                {detail.label == "Preferences" && item.editable && (
                  <Edit size={14} className="inline-block ml-2 text-blue-500" />
                )}
              </span>
            </div>
          ))}
      </div>
    );
  };

  // Separate Packing Component
  const SeperatePack = () => (
    <div className="my-1 mb-2 text-center text-gray-500">
      <span className="inline-block w-full border-t border-dashed border-gray-500 relative">
        <span className="absolute top-[-0.6rem] left-1/2 transform -translate-x-1/2 dark:text-white dark:bg-gray-800 px-2 text-sm">
          separate packing
        </span>
      </span>
    </div>
  );

  // Memoized Calculations
  const { withKOT, withoutKOT } = useMemo(
    () => groupItemsByKOT(cartItems),
    [cartItems]
  );
  const totalCartAmount = useMemo(() => calculateTotal(cartItems), [cartItems]);
  const pendingItems = cartItems.filter((item) => item.isPending);

  // Render Conditions
  const showPrintButtons = true;
  const showBothPrintButtons = kotType === KOT_TYEPES.dineIn;

  const location = useLocation();
  // const { user } = useSelector((state) => state.auth);

  const cashCounterRoute = "/cash-counter";

  const onSuccessUpdate = () => {
    if (location.pathname.startsWith(cashCounterRoute)) {
      onupdateItem();
    } else {
      return;
    }
  };

  const handleBillPrintFirstSuccess = () => {
    // dispatch(CloseBillPrintModal());
    dispatch(clearCart());
    dispatch(CloseCARTModal())

  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <CartHeader
        items={withKOT}
        isVeg={isVeg}
        cartId={cartId}
        showScan={!location.pathname.startsWith("/cash-counter")}
        title="Cart Items"
        onClearCart={() => dispatch(clearCart())}
      />

      <div className="flex-1 p-4 overflow-y-auto extra-wide-scrollbar space-y-4">
        <CartItemList
        openMenuModal={openMenuModal}
        setSelectedCartItem={setSelectedCartItem}
        setSelectedItem={setSelectedItemMenu}
          cartItems={cartItems}
          withKOT={withKOT}
          withoutKOT={withoutKOT}
          expandedItems={expandedItems}
          toggleItemDetails={toggleItemDetails}
          renderItemDetails={renderItemDetails}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          SeperatePack={SeperatePack}
          isAddonItem={(item) => item?.AddOnCode != 0 && item?.Code !== item?.AddOnCode}
          openComplementaryModal={openComplementaryModal}
          user={user}
        />
      </div>

      {!location.pathname.startsWith("/cash-counter") && (
        <CartFooter
          customerNo={customerNo}
          orderDetails={orderDetails}
          pendingItems={pendingItems}
          masterId={cartId}
          totalCartAmount={totalCartAmount}
          showPrintButtons={true}
          showBothPrintButtons={kotType === KOT_TYEPES.dineIn}
          withKOT={withKOT}
          withoutKOT={withoutKOT}
          kotType={kotType}
        />
      )}

      {/* Modals */}
      <ComplementaryDetailsModal
        isOpen={!!complementaryItem}
        onClose={() => setComplementaryItem(null)}
        item={complementaryItem || {}}
      />
      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        item={selectedItem}
        onSave={handleSavePreferences}
      />
      <KOTPrintModal withOutKOT={withoutKOT} />
      <ReprintKOTModal kotItems={withKOT} masterId={cartId} />
      
      {billPreview && (
        <BillPrintPreview
          kotTypeCode={kotType}
          handelPayment={() => {
            dispatch(clearCart());
          }}
          billDetails={{ code: cartId }}
          masterCode={cartId}
          items={cartItems}
        />
      )}
      <BarcodeItemModal masterId={cartId}/>
    </div>
  );
};

export default CartSideBar;