import CartButton from "../../../Features/Buttons/CartButton";
import CreditSaleButton from "../../../Features/Buttons/CreditSaleButton";
import ScannOpenButton from "../../../Features/Buttons/ScannOpenButton";
import NumericKeyboard from "../../../Features/KeyBoards/NumberKeyboard";
import BillPreview from "../../../Features/Printers/BillPrintPreview";
import BarcodeItemModal from "../../../Features/modals/BarcodeModal";
import CreditSaleModal from "../../../Features/modals/CrediSaleModal";
import useSpiltScreen from "../../../hooks/UseSplitScrren";
import { useToast } from "../../../hooks/UseToast";
import {
  CloseBillPrintModal,
  openBillPrintModal,
} from "../../../redux/billPreviewModal/action";
import { clearCart, fetchCart } from "../../../redux/cart/actions";
import { CloseCARTModal } from "../../../redux/cartMoodal/action";
import { getRequest, postRequest } from "../../../services/apis/requests";
import { Currency, KOT_TYEPES, userPrivileges } from "../../../utils/constants";
import { hasPrivilege, roundOffBill } from "../../../utils/helper";
import CartModal from "../CartModal/CartModal";
import {
  CreditCard,
  Wallet,
  ShoppingCart,
  Percent,
  PlusCircle,
  Calculator,
  Phone,
  QrCode,
  CreditCardIcon,
  ArrowLeft,
  Info,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TakeAwayItemModal from "./TakeAwayItemModal";
import { processKotAndBill } from "../../../services/KotServices/Bill";

const PaymentMethods = [
  {
    id: "cash",
    name: "Cash",
    icon: ShoppingCart,
    label: "Tender Cash",
    inputLabel: "Cash Amount",
  },
  {
    id: "card",
    name: "Card",
    label: "Card",
    icon: CreditCard,
    inputLabel: "Card Amount",
  },
  {
    id: "touchngo",
    name: "Touch n Go",
    label: "Touch n Go",
    icon: Phone,
    inputLabel: "Touch n Go Amount",
    type: 2,
  },
  {
    id: "bankqr",
    name: "Bank QR",
    label: "Bank QR",
    icon: QrCode,
    inputLabel: "Bank QR Amount",
    type: 1,
  },
  {
    id: "credit",
    name: "Credit",
    label: "Credit",
    icon: CreditCardIcon,
    inputLabel: "Credit",
  },
];

const CashCounter = () => {
  const { cartId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { updateStorage } = useSpiltScreen(true);

  const [order, setOrder] = useState({
    GrossAmount: "0.00",
    TOT: "0.00",
    TotalBillAmount: "0.00",
    TotalTax: "0.00",
    InvoiceDiscount: "0.00",
    items: [],
  });
  // const dispatch = useDispatch()
  const { isBillPrintFirst, isKotBased } = useSelector(
    (state) => state.settings
  );

  const [billDetails, setBillDetails] = useState({
    code: null,
    subtotal: 0,
    tax: 0,
    discount: 0,
    additionalCharges: 0,
    cashCounterStatus: null,
    items: [],
  });

  const [payments, setPayments] = useState([
    // { method: "cash", amount: null },
    // { method: "card", amount: null },
    // { method: "touchngo", amount: null },
    // { method: "bankqr", amount: null },
  ]);

  useEffect(() => {
    if (order.KotTypeCode == KOT_TYEPES.homeDelivery) {
      setPayments([{ method: "credit", amount: calculateNetTotal() }]);
    } else {
      setPayments([
        { method: "cash", amount: null },
        { method: "card", amount: null },
        { method: "touchngo", amount: null },
        { method: "bankqr", amount: null },
      ]);
    }
  }, [order]);

  const [isPrintBill, setIsPrintBill] = useState(true);

  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const [currentInput, setCurrentInput] = useState(null);

  const [keyboardHidden, setKeyboardHidden] = useState(false);

  const getOrderDetails = async () => {
    try {
      const route = isBillPrintFirst
        ? `sales/item-details/${cartId}`
        : `kot-items/${cartId}/`;

      const response = await getRequest(route);
      console.log(response.data);
      setOrder(response.data);

      updateStorage.setOrder({ ...response.data, items: response.data.items });

      const transformedItems = response.data.items?.map((item) => ({
        id: item.Code,
        name: item.SkuName,
        quantity: parseFloat(item.Qty) || 0,
        unitPrice: parseFloat(item.Rate) || 0,
        details: item.Details,
        takeAway: item.TakeAway,
        KOTNo:item.KOTNo
      }));

      // toast.success(response.data?.CashCounterStatus);

      setBillDetails((prev) => ({
        code: response.data?.Code,
        subtotal: parseFloat(response.data?.TotalTaxable) || 0,
        tax: parseFloat(response.data?.TotalTax) || 0,
        discount: parseFloat(response.data?.InvoiceDiscount) || null,
        additionalCharges: parseFloat(response.data?.InvoiceCharges) || 0,
        cashCounterStatus: response.data?.CashCounterStatus,
        items: transformedItems,
      }));
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    getOrderDetails();

    // Cleanup function when component unmounts
    return () => {
      // Close cash counter
      updateStorage.setCashCounterStatus(false);
      // Clear order data
      updateStorage.setOrder({
        GrossAmount: "0.00",
        TOT: "0.00",
        TotalBillAmount: "0.00",
        TotalTax: "0.00",
        InvoiceDiscount: "0.00",
        items: [],
      });
      // Clear payments
      updateStorage.setPayments([
        { method: "cash", amount: null },
        { method: "card", amount: null },
        { method: "touchngo", amount: null },
        { method: "bankqr", amount: null },
      ]);
    };
  }, []);

  useEffect(() => {
    getOrderDetails();
    // fetchCart(cartId)
    if (refresh || "length" > 0) {
    }
  }, [refresh]);

  //   function roundOffBill(amount) {
  //     if (amount === null || amount === undefined) return null;

  //     // Round to the nearest 0.10
  //     let rounded = Math.round(amount * 10) / 10;

  //     return (amount - rounded).toFixed(2); // Return difference rounded to 2 decimal places
  // }

  const calculateNetTotal = () => {
    const {
      subtotal = 0,
      tax = 0,
      discount = 0,
      additionalCharges = 0,
    } = billDetails;
    // console.log(subtotal, tax, discount, additionalCharges);

    const amount = subtotal + tax - (discount || 0) + (additionalCharges || 0);

    const rounded_discount = roundOffBill(amount);

    const netTotal = amount - rounded_discount;

    return netTotal.toFixed(2);
  };

  const [remainigBalance, setRemainingBalce] = useState(0);

  const calculateRemainingBalance = () => {
    const netTotal = calculateNetTotal();
    const totalPaid = calculateTotalPaid();

    // toast.success(netTotal)
    // toast.success(totalPaid)

    // setRemainingBalce(Math.max(netTotal - totalPaid, 0))
    return Math.max(netTotal - totalPaid, 0);
  };

  const calculateTotalPaid = () => {
    const paid = payments.reduce(
      (total, payment) => total + (payment.amount || 0),
      0
    );
    return Number(paid);
  };

  const location = useLocation();

  const onSuccessPayment = () => {
    setBillDetails({ ...billDetails, cashCounterStatus: 2 });
    toast.success("Payment Completed");
    updateStorage.setPaymentSuccess(true);
    updateStorage.clearStorage();
    dispatch(clearCart());
  };

  const calculateChangeAmount = () => {
    const netTotal = calculateNetTotal();
    const totalPayments = calculateTotalPaid();
    const cashPayments = payments.find((p) => p.method === "cash")?.amount || 0;

    const cardAmount =
      payments.find((method) => method.method === "card")?.amount || 0;
    const walletAmount =
      payments.find((method) => method.method === "wallet")?.amount || 0;
    // Calculate change only from cash payments if total payments exceed net total
    return totalPayments > netTotal ? Math.max(totalPayments - netTotal, 0) : 0;
  };

  const updatePayment = (method, amount) => {
    const currentMethod = payments.find((p) => p.method === method);
    const isBackspacing =
      amount.length < (currentMethod?.amount?.toString().length || 0);
    const remainingBalance = calculateRemainingBalance();

    // Validation checks
    if (!isBackspacing && amount != 0) {
      const touchAndGo = payments.find((p) => p.method === "touchngo");
      const bankQr = payments.find((p) => p.method === "bankqr");

      if (remainingBalance === 0 && method !== "cash") {
        toast.error("Cannot add more payments when balance is zero");
        return;
      }

      if (method === "bankqr" && touchAndGo?.amount > 0) {
        toast.error("Cannot use Bank QR when Touch n Go payment exists");
        return;
      }

      if (method === "touchngo" && bankQr?.amount > 0) {
        toast.error("Cannot use Touch n Go when Bank QR payment exists");
        return;
      }
    }

    const parsedAmount = parseFloat(amount) || 0;
    setPayments(
      payments.map((p) =>
        p.method === method ? { ...p, amount: parsedAmount } : p
      )
    );
    const updatedPayments = payments.map((p) =>
      p.method === method ? { ...p, amount: parsedAmount } : p
    );
    updateStorage.setPayments(updatedPayments);
  };

  const handlePaymentMethodAdd = (methodId) => {
    const methodExists = payments.some(
      (payment) => payment.method === methodId
    );

    if (!methodExists) {
      const newPayment = {
        method: methodId,
        amount: 0,
      };

      setPayments((prev) => [...prev, newPayment]);
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(CloseCARTModal());
  }, []);

  useEffect(() => {
    // toast.success(billDetails.cashCounterStatus)
    if (
      billDetails.cashCounterStatus !== null &&
      isBillPrintFirst &&
      billDetails?.cashCounterStatus != 1
    ) {
      toast.error(
        "Cashcounter Not available for this order yet" +
          billDetails.cashCounterStatus
      );
      navigate(-1);
    }
    if (billDetails.cashCounterStatus == 2) {
      // toast.error("Payment already settled")
      const previousPath = location.state?.from || "/";

      if (previousPath.startsWith("/menu-detail/")){
        navigate("/menu")
        return
      }else{
        navigate(previousPath);
        return

      }

    }
    // console.log(isBillPrintFirst)
    // toast.success(isBillPrintFirst)
  }, [isBillPrintFirst, billDetails]);


  const nonKotItems = useMemo(() => {
    
    if (!billDetails?.items?.length) return [];
    
    const filteredItems = billDetails?.items.filter(item => item.KOTNo == 0)

    // console.log(filteredItems)
  
    return filteredItems.filter(item => item.SubSkuCode !== 'PACKING');
  }, [billDetails])

  const handleBillPrint = async () => {
    dispatch(openBillPrintModal());
  };

  useEffect(() => {
    if (keyboardHidden) {
      setTimeout(() => {
        setKeyboardHidden(false);
      }, 5000);
    }
  }, [keyboardHidden]);

  const validatePayments = (tendrCash, card, wallet, netTotal) => {
    const otherAmounts = card + wallet;
    if (netTotal < otherAmounts) {
      toast.error("card or wallet amount can not exced net total");
      return false;
    }
    return true;
  };

  const handleOrdeCoplete = async () => {
    const netTotal = calculateNetTotal();
    const totalPaid = calculateTotalPaid();
    const cashAmount =
      payments.find((method) => method.method === "cash")?.amount || 0;
    const touchNgoAmount =
      payments.find((method) => method.method === "touchngo")?.amount || 0;

    const bankQrAmount =
      payments.find((method) => method.method === "touchngo")?.amount || 0;

    const cardAmount =
      payments.find((method) => method.method === "card")?.amount || 0;
    const walletAmount =
      payments.find((method) => method.method === "touchngo")?.amount ||
      payments.find((method) => method.method === "bankqr")?.amount ||
      0;

    const isValidPayments = validatePayments(
      cashAmount,
      cardAmount,
      walletAmount,
      netTotal
    );
    // setKeyboardHidden(true);

    if (!isValidPayments) {
      return;
    }
    // isPrintBill&& toast.success(isPrintBill)
    // console.log(isPrintBill)
    if (!isBillPrintFirst) {
      if (isPrintBill) {
        handleBillPrint();
      } else {
        processKotAndBill({
          kotTypeCode: order.KotTypeCode,
          isKotBased,
          masterCode: cartId,
          isBillPrintFirst: false,
          onSuccess: handleCompletePayment,
          dispatch,
          toast,
          nonKotItems
        });
      }
    } else {
      await handleCompletePayment();
    }
  };

  const handleCompletePayment = async () => {
    const netTotal = calculateNetTotal();
    const totalPaid = calculateTotalPaid();

    if (totalPaid < netTotal) {
      toast.error(
        "Insufficient payment amount" + totalPaid + " --- " + netTotal
      );
      return;
    }

    const cashAmount =
      payments.find((method) => method.method === "cash")?.amount || 0;
    const touchNgoAmount =
      payments.find((method) => method.method === "touchngo")?.amount || 0;

    const bankQrAmount =
      payments.find((method) => method.method === "touchngo")?.amount || 0;

    const cardAmount =
      payments.find((method) => method.method === "card")?.amount || 0;
    const walletAmount =
      payments.find((method) => method.method === "touchngo")?.amount ||
      payments.find((method) => method.method === "bankqr")?.amount ||
      0;

    const credit =
      payments.find((method) => method.method === "credit")?.amount || 0;

    const calculated_cash =
      order.KotTypeCode == KOT_TYEPES.homeDelivery
        ? 0
        : netTotal - (cardAmount + walletAmount);

    let waletType = null;

    if (touchNgoAmount > 0) {
      waletType = 2;
    } else if (bankQrAmount > 0) {
      waletType = 1;
    }

    const data = {
      credit: credit,
      cash: calculated_cash,
      wallet: walletAmount,
      card: cardAmount,
      discount: billDetails.discount,
      charges: billDetails.additionalCharges,
      waletType: waletType,
      tenderAmount: cashAmount,
      isPrintBill
    };

    if (calculateRemainingBalance() == 0) {
      setLoading(true);

      try {
        const route = isBillPrintFirst
          ? `sales/${billDetails.code}/complete-payment/`
          : `kot/${billDetails.code}/complete-payment/`;

        const response = await postRequest(route, data);
        if (response.success) {
          onSuccessPayment();
          return response.success;
        } else {
          toast.error("Payment failed");
          // dispatch(CloseBillPrintModal());
          return response.success;
        }
      } catch (error) {
        toast.error("An error occurred while processing payment");
        // dispatch(CloseBillPrintModal());
      } finally {
        setLoading(false);
        // dispatch(CloseBillPrintModal());
      }
    } else {
      toast.error("");
    }
  };

  const calculateItemSubtotal = () => {
    return billDetails.items.reduce(
      (total, item) => total + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
  };

  const updateBillDetail = (type, value) => {
    setBillDetails((prevDetails) => ({
      ...prevDetails,
      additionalCharges: parseFloat(value), // Dynamically update the key-value pair
    }));

    updateStorage.setOrder({
      ...order,
      items: billDetails.items,
      InvoiceCharges: value,
    });
  };

  useEffect(() => {
    if (order.KotTypeCode == KOT_TYEPES.homeDelivery) {
      setPayments([{ method: "credit", amount: calculateNetTotal() }]);
    }
  }, [billDetails]);

  const { user } = useSelector((state) => state.auth);

  const has_privilege = hasPrivilege(
    user.privileges,
    userPrivileges.cashCounter
  );

  const [cartOpen, setCartOpen] = useState(false);

  const [isTakeAwayModalOpen, setIsTakeAwayModalOpen] = useState(false);

  const handleMethodeDoubleClick = (payment) => {
    if (payment.amount && payment.amount > 0) {
      updatePayment(payment.method, 0);
    } else {
      updatePayment(payment.method, calculateNetTotal());
    }
  };

  const onSuccessItemUpdate = () => {
    // getOrderDetails()
    // console.log("wjbv");
    setRefresh(!refresh);
  };

  if (!has_privilege) return navigate("/");

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Left Side - Bill Details (Previous implementation) */}
      <div className="w-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mr-4 text-gray-800 dark:text-gray-200">
        <div className="flex items-center mb-4 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-md bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition duration-300 shadow-lg"
          >
            <ArrowLeft />
          </button>
          <ScannOpenButton />

          <CartButton
            setIsCartOpen={() => {
              setCartOpen(true);
            }}
          />

          <CreditSaleButton />
          <div className="flex flex-col items-end">
            <div className="text-sm mb-1">
              Token: {order.TokenNo}
              {order.DiningTableCode && ` | Table: ${order.DiningTableCode}`}
            </div>
            <div className="text-sm font-semibold">
              Order: {order.KotTypeCode}
            </div>
            <div className="text-sm font-semibold">
              {order.CustomerMobileNo && `NO: ${order.CustomerMobileNo}`}
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Items</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {billDetails.items?.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-1">
                <div>
                  <span>{item.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    x{item.quantity}
                  </span>
                  {item.details && (
                    <span className="text-xs text-gray-400 block">
                      {item.details}
                    </span>
                  )}
                  {item.takeAway == 1 && (
                    <span className="text-xs ml-2">Take away item</span>
                  )}
                </div>
                <span>
                  {Currency} {(item.quantity * item.unitPrice).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Financial Calculations */}

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Item Subtotal</span>
            <span>
              {Currency} {(calculateItemSubtotal() || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Tax</span>
            <span>
              {Currency} {(billDetails.tax || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Round OFF</span>
            <span>
              {Currency}{" "}
              {Math.abs(
                roundOffBill(
                  billDetails.subtotal +
                    billDetails.tax -
                    (billDetails.discount || 0) +
                    (billDetails.additionalCharges || 0)
                )
              )}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <Percent size={16} className="mr-2" /> Discount
            </span>
            <div className="flex items-center">
              {/* <input
                type="number"
                onFocus={() => onFocusing("discount")}
                value={billDetails.discount || ""}
                onChange={(e) => updateBillDetail("discount", e.target.value)}
                className="w-24 p-1 border rounded mr-2 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Discount"
              /> */}
              <span>
                {Currency}{" "}
                {billDetails.discount !== null
                  ? billDetails.discount.toFixed(2)
                  : "0.00"}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="flex items-center">
                <PlusCircle size={16} className="mr-2" /> Additional Charges
              </span>
              {billDetails.items.some((item) => item.TakeAway == 1) && (
                <span
                  onClick={() => {
                    setIsTakeAwayModalOpen(true);
                  }}
                  className="text-sm cursor-pointer flex items-center gap-2 text-red-500"
                >
                  (Take Away item included) <Info size={16} />
                </span>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="number"
                value={billDetails.additionalCharges || ""}
                onChange={(e) =>
                  updateBillDetail("additionalCharges", e.target.value)
                }
                className={`w-24 p-1 border rounded mr-2 ${
                  billDetails.items.some((item) => item.TakeAway == 1)
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900"
                    : "dark:bg-gray-700 dark:border-gray-600"
                }`}
                placeholder="Charges"
              />
              <span>
                {Currency}{" "}
                {billDetails.additionalCharges !== null
                  ? billDetails.additionalCharges?.toFixed(2)
                  : "0.00"}
              </span>
            </div>
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Net Total</span>
            <span>
              {Currency} {calculateNetTotal() || 0}
            </span>
          </div>

          {/* <div className="flex mt-auto flex-col space-y-2">
        <div className=" flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            Username:
          </span>
          <span className="text-gray-800 dark:text-white font-semibold">
            {user.userName}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            Branch Name:
          </span>
          <span className="text-gray-800 dark:text-white font-semibold">
            {user.BranchName}
          </span>
        </div>
      </div> */}
        </div>
      </div>
      <div className="w-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-gray-800 dark:text-gray-200">
        {/* Total Price Badge */}
        <div className="mb-4 flex justify-center">
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-6 py-4 rounded-lg text-center shadow-md w-full">
            <span className="text-sm block mb-1">Total Price</span>
            <span className="text-3xl font-bold flex items-center justify-center">
              <Calculator className="mr-2" />
              {Currency} {calculateNetTotal()}
            </span>
          </div>
        </div>

        {/* Payment Entries */}
        {payments.map((payment) => {
          const currentMethod = PaymentMethods.find(
            (m) => m.id === payment.method
          );
          // const netTotal = calculateNetTotal();

          return (
            <div key={payment.method} className="mb-4 flex items-center">
              <div className="w-1/3 pr-2">
                <button
                  className={`w-full flex items-center p-2 rounded transition-colors duration-200 ${
                    payments.some((p) => p.method === currentMethod.id)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  // onClick={() => handlePaymentMethodAdd(currentMethod.id)}
                  onClick={() => {
                    handleMethodeDoubleClick(payment);
                  }}
                >
                  <currentMethod.icon className="mr-2" /> {currentMethod.name}
                </button>
              </div>
              <div className="flex-grow flex items-center">
                <div className="flex-grow mr-4">
                  <input
                    disabled={order.KotTypeCode == KOT_TYEPES.homeDelivery}
                    onFocus={() => {
                      setCurrentInput(currentMethod);
                    }}
                    type="number"
                    // data-max = {currentMethod.id !== "cash" && calculateRemainingBalance().toFixed(2)}
                    placeholder={
                      currentMethod.inputLabel +
                      (currentMethod.id !== "cash"
                        ? // ? ` (Max ${calculateRemainingBalance().toFixed(2)})`
                          ""
                        : "")
                    }
                    // disabled={
                    //   currentMethod.id !== "cash" &&
                    //   calculateRemainingBalance() == 0
                    // }

                    value={payment.amount || ""}
                    onChange={(e) =>
                      updatePayment(payment.method, e.target.value)
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Additional Payment Method Buttons */}
        {/* <div className="flex space-x-2 mb-4">
          {PaymentMethods.filter(
            (method) => !payments.some((p) => p.method === method.id)
          ).map((method) => (
            <button
              key={method.id}
              onClick={() => handlePaymentMethodAdd(method.id)}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded flex items-center"
            >
              <method.icon className="mr-2" /> {method.name}
            </button>
          ))}
        </div> */}

        {/* Remaining Balance and Return Amount Badges */}
        <div>
          {/* Balance and Return Amount */}
          <div className="flex space-x-4 mt-4">
            {/* Remaining Balance Section */}
            <div
              className={`flex-1 p-4 rounded-lg text-center shadow-md ${
                calculateRemainingBalance() > 0
                  ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              }`}
            >
              <span className="text-sm block mb-1">Remaining Balance</span>
              <span className="text-2xl font-bold">
                {Currency} {calculateRemainingBalance().toFixed(2)}
              </span>
            </div>

            {/* Return Amount Section */}
            {calculateChangeAmount() > 0 && (
              <div className="flex-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg text-center shadow-md">
                <span className="text-sm block mb-1">Return Amount</span>
                <span className="text-2xl font-bold">
                  {Currency} {calculateChangeAmount().toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Print Bill Checkbox */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center ">
              <input
                id="print-bill"
                type="checkbox"
                // disabled
                value={isPrintBill}
                checked={isPrintBill}
                onChange={(e) => setIsPrintBill(!isPrintBill)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label
                htmlFor="print-bill"
                className="ml-2 text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                Print Bill
              </label>
            </div>
          </div>
        </div>

        {/* Complete Payment Button */}
        <button
          onClick={handleOrdeCoplete}
          disabled={
            calculateRemainingBalance() > 0 ||
            loading ||
            calculateNetTotal() == 0
          }
          className={`w-full mt-4 p-3 rounded-lg transition-colors ${
            calculateRemainingBalance() > 0 ||
            loading ||
            calculateNetTotal() == 0
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {loading ? "Processing..." : "Complete Payment"}
        </button>
      </div>
      {/* <NumericKeyboard maxValue={currentInput?.id =='cash'?undefined:calculateRemainingBalance().toFixed(2)} /> */}
      <NumericKeyboard hide={keyboardHidden} />
      <BillPreview
        kotTypeCode={order.KotTypeCode}
        masterCode={order.Code}
        items={order.items}
        onSuccess={handleCompletePayment}
        payments={payments}
        billDetails={billDetails}
      />{" "}
      <BarcodeItemModal
        onSuccess={onSuccessItemUpdate}
        refresh={onSuccessItemUpdate}
        masterId={order.Code}
      />
      <CreditSaleModal
        kotType={order.KotTypeCode}
        onSuccess={onSuccessPayment}
        billDetails={billDetails}
      />
      <CartModal
        onupdateItem={onSuccessItemUpdate}
        isOpen={cartOpen}
        onClose={() => {
          setCartOpen(false);
        }}
        billPreview={false}
      />
      <TakeAwayItemModal
        isOpen={isTakeAwayModalOpen}
        onClose={() => {
          setIsTakeAwayModalOpen(false);
        }}
        items={billDetails.items}
      />
    </div>
  );
};

export default CashCounter;
