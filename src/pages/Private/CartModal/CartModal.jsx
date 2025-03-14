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

const CartModal = ({ onupdateItem = () => {},billPreview = true }) => {
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
        visible: true,
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
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-1">
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
              <span className="font-medium">
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
    <div className="min-w-screen">
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}
      <div
        ref={modalRef}
        className={`fixed top-0 right-0 h-screen w-full md:w-1/2 shadow-2xl transform 
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        transition-transform duration-300 z-50
        bg-white dark:bg-gray-800 
        text-gray-900 dark:text-white 
        border-l border-gray-200 dark:border-gray-700`}
      >
        {/* Rest of the JSX remains exactly the same */}
        <CartHeader
          items={withKOT}
          isVeg={isVeg}
          cartId={cartId}
          showScan={!location.pathname.startsWith(cashCounterRoute)}
          setBarcodeItem={(barcodeItem) => {
            setBarcodeItem(barcodeItem);
          }}
          openBarcodeModal={() => {
            setBarcodeModalOpen(true);
          }}
          onClose={onClose}
          title="Cart Items"
          onClearCart={() => dispatch(clearCart())}
        />

        <div className="p-4 overflow-y-auto h-[calc(100%-200px)] extra-wide-scrollbar space-y-4">
          <CartItemList
            cartItems={cartItems}
            withKOT={withKOT}
            withoutKOT={withoutKOT}
            expandedItems={expandedItems}
            toggleItemDetails={toggleItemDetails}
            renderItemDetails={renderItemDetails}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            SeperatePack={SeperatePack}
            isAddonItem={(item) =>
              item?.AddOnCode != 0 && item?.Code != item?.AddOnCode
            }
            openComplementaryModal={openComplementaryModal}
            user={user}
          />
        </div>

        {!location.pathname.startsWith(cashCounterRoute) && (
          <CartFooter
            customerNo={customerNo}
            orderDetails={orderDetails}
            pendingItems={pendingItems}
            masterId={cartId}
            totalCartAmount={totalCartAmount}
            showPrintButtons={showPrintButtons}
            showBothPrintButtons={showBothPrintButtons}
            withKOT={withKOT}
            withoutKOT={withoutKOT}
            kotType={kotType}
          />
        )}
      </div>

      <ComplementaryDetailsModal
        isOpen={!!complementaryItem}
        onClose={closeComplementaryModal}
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

      {billPreview&&
      <BillPrintPreview
        kotTypeCode={kotType}
        handelPayment={handleBillPrintFirstSuccess}
        billDetails={{ code: cartId }}
        masterCode={cartId}
        items={cartItems}
      />}

      <BarcodeItemModal refresh={() => {}} masterId={cartId} />
    </div>
  );
};

export default CartModal;