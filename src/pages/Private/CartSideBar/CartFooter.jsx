import React from 'react';
import { Printer, FileText } from 'lucide-react';
import PrintButton from './sections/PrintButton';
import { postRequest } from '../../../services/apis/requests';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../../../redux/cart/actions';
import { openKotPrintModal } from '../../../redux/KotPrintModal/action';
import { Currency } from '../../../utils/constants';
import { openBillPrintModal } from '../../../redux/billPreviewModal/action';
import CartPrintButton from './sections/PrintButton';

const CartFooter = ({
  customerNo,
  orderDetails,
  totalCartAmount = 0,
  showPrintButtons = false,
  showBothPrintButtons = false,
  withKOT = [],
  withoutKOT = [],
  kotType,
  onPrintKOT,
  masterId,
  pendingItems
}) => {
  withoutKOT = withoutKOT.filter(order => order.isPending == 0)
  const formattedTotal = Number(totalCartAmount).toFixed(2);
  console.log(orderDetails.CustomerMobileNo)

  const dispatch = useDispatch()
  if (!showPrintButtons) return null;

  const handlePrintKot = async() => {
    dispatch(openKotPrintModal())
  }

  const { isBillPrintFirst, isTokenBased, isKotBased, loading } = useSelector(
    (state) => state.settings
  );

  const kotDisabled = () => {
    if(withoutKOT.length <= 0 && pendingItems.length > 0) {
      return true
    } else {
      return false
    }
  }

  return (
    <div className="sticky bottom-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-100 dark:border-gray-700 py-2 px-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText
                size={20}
                className="text-gray-600 dark:text-gray-300 mr-2"
              />
              <span className="text-base font-bold text-gray-800 dark:text-gray-100">
                Total: <span className="text-green-600 dark:text-green-400">{Currency+" "}{formattedTotal}</span>
              </span>
            </div>
          </div>

          <div className={`grid ${showBothPrintButtons && isKotBased ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
            {showBothPrintButtons && isKotBased && (
              <button
                onClick={handlePrintKot}
                disabled={withoutKOT.length <= 0}
                className={`
                  py-2 px-3 rounded-lg flex items-center justify-center gap-2
                  transition-all duration-300 ease-in-out text-sm
                  ${withoutKOT.length <= 0
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 hover:shadow-md'
                  }
                `}
              >
                <Printer size={16} strokeWidth={2} />
                <span className="font-medium">Print KOT</span>
              </button>
            )}

            <div>
              <CartPrintButton
                isBillPrintFirst={isBillPrintFirst}
                customerNo={customerNo}
                numUpdated={customerNo ? true : false}
                pendingItems={pendingItems}
                masterId={masterId}
                withKOT={withKOT}
                kotType={kotType}
                withoutKOT={withoutKOT}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartFooter;