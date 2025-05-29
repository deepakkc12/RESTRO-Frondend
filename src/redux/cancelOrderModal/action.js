export const OPEN_CANCEL_ORDER_MODAL = 'OPEN_CANCEL_ORDER_MODAL';
export const CLOSE_CANCEL_ORDER_MODAL = 'CLOSE_CANCEL_ORDER_MODAL';

export const openCancelOrderModal = (orderData) => ({
  type: OPEN_CANCEL_ORDER_MODAL,
  payload: orderData
});

export const closeCancelOrderModal = () => ({
  type: CLOSE_CANCEL_ORDER_MODAL
});