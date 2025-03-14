// barcodePreviewModal/action.js
export const OPEN_MODAL = 'CreditSale/OPEN_MODAL';
export const CLOSE_MODAL = 'CreditSale/CLOSE_MODAL';

export const openCreditSaleModal = () => {
  console.log('Attempting to open CreditSale  modal');
  return {
    type: OPEN_MODAL
  };
};

export const CloseCreditSaleModal = () => {
  console.log('Attempting to close CreditSale  modal');
  return {
    type: CLOSE_MODAL
  };
};