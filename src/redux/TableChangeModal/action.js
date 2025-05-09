// barcodePreviewModal/action.js
export const OPEN_MODAL = 'TableChange/OPEN_MODAL';
export const CLOSE_MODAL = 'TableChange/CLOSE_MODAL';

export const openTableChangeModal = () => {
  console.log('Attempting to open TableChange  modal');
  return {
    type: OPEN_MODAL
  };
};

export const CloseTableChangeModal = () => {
  console.log('Attempting to close TableChange  modal');
  return {
    type: CLOSE_MODAL
  };
};