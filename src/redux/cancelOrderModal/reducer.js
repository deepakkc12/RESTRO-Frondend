import { OPEN_CANCEL_ORDER_MODAL, CLOSE_CANCEL_ORDER_MODAL } from './action';

const initialState = {
  isOpen: false,
  orderData: null
};

const cancelOrderModalReducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_CANCEL_ORDER_MODAL:
      return {
        ...state,
        isOpen: true,
        orderData: action.payload
      };
    case CLOSE_CANCEL_ORDER_MODAL:
      return {
        ...state,
        isOpen: false,
        orderData: null
      };
    default:
      return state;
  }
};

export default cancelOrderModalReducer;