// barcodePreviewModal/action.js
export const OPEN_MODAL = 'barcode/OPEN_MODAL';
export const CLOSE_MODAL = 'barcode/CLOSE_MODAL';

export const openBarcodeModal = () => {
  console.log('Attempting to open Barcode  modal');
  return {
    type: OPEN_MODAL
  };
};

export const CloseBarcodeModal = () => {
  console.log('Attempting to close barcode  modal');
  return {
    type: CLOSE_MODAL
  };
};