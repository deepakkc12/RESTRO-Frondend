import { combineReducers } from 'redux';
import authReducer from './Authentication/reducer';
import cartReducer from './cart/reducer'
import newOrderModal from './newOrder/reducer';
import paymentModal from "./paymentModal/reducer"
import kotPrintModalReducer  from './KotPrintModal/reducer';
import billPrintModalReducer from './billPreviewModal/reducer';
import splitBill from './spliBillModal/reducer';
import ReprintKotModalReducer from './RePrintKotModal/reducer';
import BarcodeModalReducer from './BarcodeModal/reducer';
import CreditSaleModalReducer from './creditSaleModal/reducer';
import CARTModalReducer from './cartMoodal/reducer';
import { settingsReducer } from './Settings/reducer';
import VirtualKeyboardReducer from './VirtualKeyboard/reducer';
import MergeBill from './mergeBillModal/reducer';
import TableChangeModalReducer from './TableChangeModal/reducer';
import cancelOrderModalReducer from './cancelOrderModal/reducer';
// Combine all reducers here
const rootReducer = combineReducers({

    auth:authReducer,
    
    cart:cartReducer,

    newOrderModal:newOrderModal,

    paymentModal:paymentModal,

    kotPrintModal:kotPrintModalReducer,

    billPrintModal:billPrintModalReducer,

    splitBillModal : splitBill,

    rePrintKotModal :ReprintKotModalReducer,

    barcodeModal : BarcodeModalReducer,
    
    creditSaleReducer : CreditSaleModalReducer,

    cartModal:CARTModalReducer,

    settings:settingsReducer,

    virtualKeyboard:VirtualKeyboardReducer,

    mergeBillModal:MergeBill,

    tableChange:TableChangeModalReducer,
    cancelOrderModal:cancelOrderModalReducer
    
});

export default rootReducer;
