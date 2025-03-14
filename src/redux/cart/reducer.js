import {
  FETCH_CART_REQUEST,
  FETCH_CART_SUCCESS,
  FETCH_CART_FAILURE,
  ADD_ITEM_REQUEST,
  ADD_ITEM_SUCCESS,
  ADD_ITEM_FAILURE,
  UPDATE_QUANTITY_REQUEST,
  UPDATE_QUANTITY_SUCCESS,
  UPDATE_QUANTITY_FAILURE,
  REMOVE_ITEM_REQUEST,
  REMOVE_ITEM_SUCCESS,
  REMOVE_ITEM_FAILURE,
  CLEAR_CART,
  UPDATE_ITEM_PREFERENCE_REQUEST,
  UPDATE_ITEM_PREFERENCE_SUCCESS,
  UPDATE_ITEM_PREFERENCE_FAILURE,
  CREATE_CART_SUCCESS,
  SET_CART_ID,
  CART_ID_KEY,
  SET_TABLE_DATA,
  REMOVE_TABLE_DATA,
  DELETE_CART_REQUEST,
  DELETE_CART_FAILURE,
  DELETE_CART_SUCCESS,
  SET_CUSTOMER_CODE,
  SET_KOT_TYPE,
  CREATE_CART_REQUEST,
  LOADING_START,
  LOADING_END,
  SET_BILL_PRINT_SUCCESS,
  SET_BILL_PRINT_FAIL,
  UPDATE_ITEM_PENDING_STATUS,
  UPDATE_ITEM_COPLIMENTRY,
  UPDATE_ITEM_TAKEAWAY_STATUS,
  UPDATE_VEG_STATUS,
  UPDATE_CUSTOMER_PHONE,
} from "./actions";
import { act } from "react";

// Initial State
const initialState = {
  items: [],
  loading: true,
  error: null,
  cartId: localStorage.getItem(CART_ID_KEY) || null,
  tableCode: null,
  tokenNo: null,
  tableNo: null,
  customerCode: null,
  KotType: null,
  isPrinted: false,
  isVeg:false,
  customerNo:'',
};

// Reducer
const cartReducer = (state = initialState, action) => {
  // console.log(state);
  switch (action.type) {
    // Fetch Cart Cases
    case FETCH_CART_REQUEST:
      return { ...state, error: null };
    case FETCH_CART_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.items,
        cartId: action.payload.cartId,
        tableCode: action.payload.tableCode,
        tableNo: action.payload.tableNo,
        tokenNo: action.payload.tokenNo,
        customerCode: action.payload.customerCode,
        kotType: action.payload.kotTypeName,
        isVeg: action.payload.isVeg,
        customerNo:action.payload.CustomerMobileNo,
        error: null,
      };
    case FETCH_CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        items: [],
      };

    // // Create Cart Cases
    // case CREATE_CART_REQUEST:
    //   return{
    //     ...state,
    //     loading :true,
    //     cartId:null
    //   }
    case CREATE_CART_SUCCESS:
    case SET_CART_ID:
      return {
        ...state,
        cartId: action.payload,
        loading: false,
      };

    case LOADING_START:
      return { ...state, loading: true, error: null };

    case LOADING_END:
      return { ...state, loading: false, error: null };

    // Add Item Cases
    case ADD_ITEM_REQUEST:
      return { ...state, loading: true, error: null };

    case ADD_ITEM_SUCCESS:
      // console.log(action.payload);
      return {
        ...state,
        loading: false,
        items: [...state.items, action.payload],
      };
    case ADD_ITEM_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Update Quantity Cases
    case UPDATE_QUANTITY_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_QUANTITY_SUCCESS:
      return {
        ...state,
        loading: false,
        items: state.items.map((item) =>
          item.Code === action.payload.itemCode
            ? { ...item, Qty: action.payload.quantity }
            : item
        ),
      };
    case UPDATE_QUANTITY_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Remove Item Cases
    case REMOVE_ITEM_REQUEST:
      return { ...state, loading: true, error: null };
      case REMOVE_ITEM_SUCCESS:
        const item = state.items.find(item=>item.Code==action.payload)

        if(item.Code== item.AddOnCode){
          return {
            ...state,
            loading: false,
            items: state.items.filter((item) => {
              return item.AddOnCode !== action.payload;
            }),
          };
        }else{
          return {
            ...state,
            loading: false,
            items: state.items.filter((item) => {
              return item.Code !== action.payload;
            }),
          };
        }


       
    case REMOVE_ITEM_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Item Preference Cases
    case UPDATE_ITEM_PREFERENCE_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_ITEM_PREFERENCE_SUCCESS:
      return {
        ...state,
        loading: false,
        items: state.items.map((item) =>
          item.Code === action.payload.itemCode
            ? { ...item, Details:action.payload.preferenceData }
            : item
        ),
      };
    case UPDATE_ITEM_PREFERENCE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case SET_TABLE_DATA:
      return {
        ...state,
        tableCode: action.payload.tableCode,
        tokenNo: action.payload.tokenNo,
        tableNo: action.payload.tableNo,
      };

    case REMOVE_TABLE_DATA:
      return {
        ...state,
        tableCode: null,
        tokenNo: null,
        tableNo: null,
      };

    // Clear Cart
    case CLEAR_CART:
      return {
        items: [],
        loading: false,
        error: null,
        cartId: null,
        tableCode: null,
        tokenNo: null,
        tableNo: null,
      };

    case DELETE_CART_REQUEST:
      return { ...state, loading: true, error: null };
      
    case DELETE_CART_SUCCESS:
      return {
        ...initialState,
        loading: false,
      };

    case DELETE_CART_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case SET_CUSTOMER_CODE:
      return { ...state, customerCode: action.payload.customerCode };

    case SET_KOT_TYPE:
      return { ...state, kotType: action.payload.kotType };
    case SET_BILL_PRINT_SUCCESS:
      return { ...state, isPrinted: true };

    case SET_BILL_PRINT_FAIL:
      return { ...state, isPrinted: false };

    case UPDATE_ITEM_PENDING_STATUS:
      if(action.payload.itemId == action.payload.AddOnCode){
        return {
          ...state,
          items: state.items.map((item) =>
            item.AddOnCode == action.payload.itemId
              ? { ...item, isPending: action.payload.status }
              : item
          ),
        };
      }else{
        return {
          ...state,
          items: state.items.map((item) =>
            item.Code == action.payload.itemId
              ? { ...item, isPending: action.payload.status }
              : item
          ),
        };
      }
     

    case UPDATE_ITEM_TAKEAWAY_STATUS:
      return {
        ...state,
        items: state.items.map((item) => {
          const updatedItem = action.payload.find((updated) => updated.Code === item.Code);
          return updatedItem ? { ...item,Rate:updatedItem.Rate,TakeAway:updatedItem.TakeAway } : item;
        }),
      };

    case UPDATE_ITEM_COPLIMENTRY:
      // const updated_item = state.items.find(item=>item.Code == action.payload.itemId)

      if(action.payload.item.Code==action.payload.item.AddOnCode){
        return {
          ...state,
          items: state.items.map((item) =>
            item.AddOnCode == action.payload.item.Code
              ? {
                  ...item,
                  TotalGrossAmount: action.payload.item.TotalGrossAmount,
                  ComplementaryDetails: action.payload.item.ComplementaryDetails,
                  IsComplementary: action.payload.item.IsComplementary,
                  Rate: action.payload.item.Rate,
                }
              : item
          ),
        };
      }else{
        return {
          ...state,
          items: state.items.map((item) =>
            item.Code == action.payload.item.Code
              ? {
                  ...item,
                  TotalGrossAmount: action.payload.item.TotalGrossAmount,
                  ComplementaryDetails: action.payload.item.ComplementaryDetails,
                  IsComplementary: action.payload.item.IsComplementary,
                  Rate: action.payload.item.Rate,
                }
              : item
          ),
        };
      }
      

      case UPDATE_VEG_STATUS:
        return{
          ...state,isVeg:action.payload
        }
        case UPDATE_CUSTOMER_PHONE:
        return{
          ...state,customerNo:action.payload
        }
        
    default:
      return state;
  }
};

export default cartReducer;
