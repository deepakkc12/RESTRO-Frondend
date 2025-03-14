import { postRequest } from "../../services/apis/requests";
import { clearCart } from "../../redux/cart/actions";
import { CloseCARTModal } from "../../redux/cartMoodal/action";
import { KOT_TYEPES } from "../../utils/constants";
/**
 * Handles KOT updates and bill printing process.
 * @param {Object} params - The parameters object.
 * @param {string} params.kotTypeCode - The type of KOT (e.g., dine-in, takeaway).
 * @param {boolean} params.isKotBased - Determines if KOT is based.
 * @param {string} params.masterCode - The master order code.
 * @param {boolean} params.isBillPrintFirst - Whether bill printing happens first.
 * @param {Function} params.onSuccess - Callback function on success.
 * @param {Function} params.dispatch - Redux dispatch function.
 * @param {Function} params.toast - Function to toast.
 * @param {Array} params.nonKotItems - Function to toast.
 * 
 * 
 */
export const processKotAndBill = async ({
  kotTypeCode,
  isKotBased,
  masterCode,
  isBillPrintFirst,
  onSuccess,
  dispatch,
  toast,
  nonKotItems
}) => {
  try {
    if (kotTypeCode !== KOT_TYEPES.dineIn && isKotBased && nonKotItems.length > 0) {
      const kotResponse = await postRequest(`kot/update-kot-no/${masterCode}/`);
      if (!kotResponse.success) throw new Error("KOT update failed");
      toast.success("Kot Sent to Kitchen...");
    }

    const response = await postRequest(`kot/${masterCode}/update-sales-prices/`);
    if (response.success) {
        if (isBillPrintFirst) {
            toast.success("Bill Printing...");
          }else{
            // toast.success("Bill Printing...");
          }
      onSuccess?.();
      dispatch(clearCart());
      dispatch(CloseCARTModal());
    }
  } catch (error) {
    console.error("Failed to process");
  }
};
