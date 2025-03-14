// billPreviewModal/action.js
export const OPEN_MODAL = 'bill/OPEN_MODAL';
export const CLOSE_MODAL = 'bill/CLOSE_MODAL';

export const openBillPrintModal = () => {
  // console.log('Attempting to open bill print modal');
  return {
    type: OPEN_MODAL
  };
};

export const CloseBillPrintModal = () => {
  // console.log('Attempting to close bill print modal');
  return {
    type: CLOSE_MODAL
  };
};