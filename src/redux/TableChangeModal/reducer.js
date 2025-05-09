import { CLOSE_MODAL, OPEN_MODAL } from "./action";



const initialState = {isOpen:false}



const TableChangeModalReducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return {
       isOpen:true
      };
    case CLOSE_MODAL:
      return {
        isOpen:false
      };
    default:
      return state;
  }
};

export default TableChangeModalReducer;
