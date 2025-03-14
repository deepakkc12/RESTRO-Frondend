import toast from "react-hot-toast";
import { postRequest } from "../../services/apis/requests";
import initializeAxiosClient from "../../services/AxiosClient";

// Action Types
export const FETCH_CART_REQUEST = "cart/FETCH_CART_REQUEST";
export const FETCH_CART_SUCCESS = "cart/FETCH_CART_SUCCESS";
export const FETCH_CART_FAILURE = "cart/FETCH_CART_FAILURE";
export const ADD_ITEM_REQUEST = "cart/ADD_ITEM_REQUEST";
export const ADD_ITEM_SUCCESS = "cart/ADD_ITEM_SUCCESS";
export const ADD_ITEM_FAILURE = "cart/ADD_ITEM_FAILURE";
export const UPDATE_QUANTITY_REQUEST = "cart/UPDATE_QUANTITY_REQUEST";
export const UPDATE_QUANTITY_SUCCESS = "cart/UPDATE_QUANTITY_SUCCESS";
export const UPDATE_QUANTITY_FAILURE = "cart/UPDATE_QUANTITY_FAILURE";
export const REMOVE_ITEM_REQUEST = "cart/REMOVE_ITEM_REQUEST";
export const REMOVE_ITEM_SUCCESS = "cart/REMOVE_ITEM_SUCCESS";
export const REMOVE_ITEM_FAILURE = "cart/REMOVE_ITEM_FAILURE";
export const CLEAR_CART = "cart/CLEAR_CART";
export const UPDATE_ITEM_PREFERENCE_REQUEST =
  "cart/UPDATE_ITEM_PREFERENCE_REQUEST";
export const UPDATE_ITEM_PREFERENCE_SUCCESS =
  "cart/UPDATE_ITEM_PREFERENCE_SUCCESS";
export const UPDATE_ITEM_PREFERENCE_FAILURE =
  "cart/UPDATE_ITEM_PREFERENCE_FAILURE";
export const CREATE_CART_REQUEST = "cart/CREATE_CART_REQUEST";
export const CREATE_CART_SUCCESS = "cart/CREATE_CART_SUCCESS";
export const CREATE_CART_FAILURE = "cart/CREATE_CART_FAILURE";
export const SET_CART_ID = "cart/SET_CART_ID";
export const SET_TABLE_DATA = "cart/SET_TABLE_DATA";
export const REMOVE_TABLE_DATA = "cart/REMOVE_TABLE_DATA";

export const DELETE_CART_REQUEST = "cart/DELETE_CART_REQUEST";
export const DELETE_CART_SUCCESS = "cart/DELETE_CART_SUCCESS";
export const DELETE_CART_FAILURE = "cart/DELETE_CART_FAILURE";

export const  SET_CUSTOMER_CODE = "cart/SET_CUSTOMER_CODE"

export const SET_KOT_TYPE = "cart/SET_KOT_TYPE"

export const UPDATE_ITEM_PENDING_STATUS = "cart/UPDATE_ITEM_PENDING_STATUS"

export const UPDATE_ITEM_TAKEAWAY_STATUS = "cart/UPDATE_ITEM_TAKEAWAY_STATUS"

export const SET_BILL_PRINT_SUCCESS  =  "cart/SET_BILL_PRINT_SUCCESS"

export const SET_BILL_PRINT_FAIL  =  "cart/SET_BILL_PRINT_FAIL"

export const LOADING_START = "cart/LOADING_START"

export const LOADING_END = "cart/LOADING_END"

export const UPDATE_ITEM_COPLIMENTRY = "cart/UPDATE_ITEM_COPLIMENTRY"


export const UPDATE_VEG_STATUS = "cart/UPDATE_VEG_STATUS"

export const UPDATE_CUSTOMER_PHONE = "cart/UPDATE_CUSTOMER_PHONE"

export const CART_ID_KEY = "current_cart_id";

const axios = await initializeAxiosClient();



export const updateCustomerNo = (number='')=>{
  return {type:UPDATE_CUSTOMER_PHONE,payload:number}
}
// Action Creators

export const  createNewCart = (tableId = null,tokenNo=null,tableNo=null,toast,customerCode=null,kot_type_ref,onSuccess=()=>{}) => {
  return async (dispatch) => {
    clearCart()
    dispatch({ type: CREATE_CART_REQUEST });
    try {
      const response = await axios.post("kot/new/", {
        dining_table_code: tableId,
        customer_code :customerCode,
        kot_type_code:kot_type_ref,
        token_no:tokenNo
      });
      const newCartId = response.data.data;

      // history.push("/menu")

      toast.success("New Order Created")

      // Save to local storage
      localStorage.setItem(CART_ID_KEY, newCartId);

      dispatch({
        type: CREATE_CART_SUCCESS,
        payload: newCartId,
      });
      if(tableId && tokenNo){
        dispatch({
          type:SET_TABLE_DATA,payload:{tableCode:tableId,tokenNo:tokenNo,tableNo:tableNo}
        })
      }

      if(customerCode){
        dispatch({
          type:SET_CUSTOMER_CODE,payload:{customerCode:customerCode}
        })
      }

      fetchCart(newCartId);
      onSuccess()
      return newCartId;
    } catch (error) {
      console.error(error)
      toast.error("Token already taken")
      dispatch({
        type: CREATE_CART_FAILURE,
        payload: error.response
          ? error.response.data
          : { message: "Create cart failed" },
      });
      // throw error;
    }
  };
};

export const fetchCart = (cartId = null, getReturn = () => {}) => {
  return async (dispatch, getState) => {
    console.log("FETCH CART FUNCTION INVOKED");

    let resolvedCartId =
      cartId || getState().cart.cartId || localStorage.getItem(CART_ID_KEY);

    if (!resolvedCartId) {
      console.warn("No Cart ID Found");
      dispatch({ type: FETCH_CART_FAILURE, error: "No Cart ID Found" });
      return;
    }

    dispatch({ type: FETCH_CART_REQUEST });

    try {
      const response = await axios.get(`kot-items/${resolvedCartId}/`);
      const data = response.data.data;

      console.log("Cart API Response:", data);

      dispatch({
        type: FETCH_CART_SUCCESS,
        payload: {
          items: data.items,
          cartId: resolvedCartId,
          tableCode: data.DiningTableCode,
          kotTypeName: data.KotTypeCode,
          tableNo: data.TableName,
          tokenNo: data.TokenNo,
          customerCode: data.CustomerCode,
          isVeg: data.isVeg,
          CustomerMobileNo: data.CustomerMobileNo,
        },
      });

      // alert(data.CustomerMobileNo)

      dispatch({ type: SET_KOT_TYPE, payload: { kotType: data.KotTypeCode } });

      // ✅ Call getReturn so it executes!
      console.log("Executing getReturn function...");
      getReturn(data); // 🔥 Now it should execute properly

    } catch (error) {
      console.error("Error fetching cart:", error);
      dispatch({ type: FETCH_CART_FAILURE, error: error.message });
    }
  };
};


export const addItemToCart = (item,toast,masterId,onSuccess,barcode,onError=()=>{}) => {
  return async (dispatch, getState) => {
    // Deep logging to understand the cartId
    console.log("Full getState().cart:", getState().cart);

    let cartId = masterId || getState().cart.cartId || localStorage.getItem(CART_ID_KEY);

    console.log("Raw cartId:", cartId);
    console.log("Type of cartId:", typeof cartId);

    // More robust conversion
    if (typeof cartId === "object") {
      // If it's an object, try to extract a string identifier
      cartId = cartId.id || cartId.cartId || cartId.toString();
    }

    console.log("Processed cartId:", cartId);

    if (!cartId) {
      console.error("No valid cart ID found");
      // Optionally dispatch an action to create a new cart
      // cartId = await dispatch(createNewCart());
      return;
    }

    dispatch({ type: ADD_ITEM_REQUEST });

    try {
      const body = {
        ...item,
        kot_master_id: cartId,
      };

      console.log("Request body:", body);

      let url = ""

      if (barcode){
        url = 'kot-details/add-by-barcode/'
      }else{
       url = "kot-details/add/"
      }

      const response = await axios.post(url, body);
      console.log(response.data.data);
      dispatch({
        type: ADD_ITEM_SUCCESS,
        payload: { ...response.data.data },
      });
      if(onSuccess){
        onSuccess(response.data.data.Code)
      }
      if(toast){

        toast.success("item added")
      }
    } catch (error) {
      console.error("Add item error:", error);
      dispatch({
        type: ADD_ITEM_FAILURE,
        payload: error.response
          ? error.response.data
          : { message: "Add item failed" },
      });
      onError()
    }
  };
};

export const updateItemQuantity = (itemCode, quantityChange,currentQty,onSuccess) => {
  const qty = currentQty +quantityChange

  if(qty<=0){
  //  return removeItemFromCart(itemCode,()=>{},onSuccess)
  return 
  }else{
    return async (dispatch) => {
      dispatch({ type: UPDATE_QUANTITY_REQUEST });
      try {
        const response = await axios.post(`kot-items/${itemCode}/update-qty/`, {
          itemCode,
          qty: qty,
        });
        dispatch({
          type: UPDATE_QUANTITY_SUCCESS,
          payload: {
            itemCode,
            quantity: response.data.data,
          },
        });
        if(onSuccess){
          onSuccess()
        }
      } catch (error) {
        dispatch({
          type: UPDATE_QUANTITY_FAILURE,
          payload: error.response
            ? error.response.data
            : { message: "Update quantity failed" },
        });
      }
    };
  }
  
};

export const removeItemFromCart = (itemCode,toast,onSuccess) => {
  return async (dispatch) => {
    dispatch({ type: REMOVE_ITEM_REQUEST });
    try {
      await axios.delete(`kot-items/${itemCode}/remove/`);
      dispatch({
        type: REMOVE_ITEM_SUCCESS,
        payload: itemCode,
      }); 
      toast.success?.("item removed from cart")
      if(onSuccess){
        onSuccess()
      }
    } catch (error) {
      dispatch({
        type: REMOVE_ITEM_FAILURE,
        payload: error.response
          ? error.response.data
          : { message: "Remove item failed" },
      });
      toast.error?.("failed to remove item")
    }
  };
};

export const updateItemPreference = (itemCode, preferenceData,toast) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_ITEM_PREFERENCE_REQUEST });
    try {
      const response = await postRequest(`kot-items/${itemCode}/update-preference/`,{prefference:preferenceData});
      dispatch({
        type: UPDATE_ITEM_PREFERENCE_SUCCESS,
        payload: {
          itemCode,
          preferenceData: preferenceData,
        },
      })
      toast.success("Preference Updated")
      ;
    } catch (error) {
      dispatch({
        type: UPDATE_ITEM_PREFERENCE_FAILURE,
        payload: error.response
          ? error.response.data
          : { message: "Update item preference failed" },
      });
    }
  };
};

export const clearCart = () => {
  return async (dispatch) => {
    localStorage.removeItem(CART_ID_KEY);
    dispatch({ type: CLEAR_CART });
  };
};

export const PrintBill = (toast,removeOrder)  =>{
  return async (dispatch,getState) => {

    dispatch({type:LOADING_START})
    let cartId =
          getState().cart.cartId || localStorage.getItem(CART_ID_KEY);

    const response = await postRequest(`kot/${cartId}/update-sales-prices/`)
    if(response.success){
      // dispatch({type:SET_BILL_PRINT_SUCCESS})
      localStorage.removeItem(CART_ID_KEY);
      toast.success("Bill Printing..")
      if(removeOrder){
        removeOrder()
      }
      // dispatch({ type: CLEAR_CART });
      return true
    }else{
      dispatch({ type: SET_BILL_PRINT_FAIL });
    }
    dispatch({type:LOADING_END})
    return false
  };
}

export const setTableData = (tableCode = null, tokenNo = null,tableNo=null) => {
  return async (dispatch, getState) => {
    if (tableCode && tokenNo && tableNo) {
      dispatch({ type: SET_TABLE_DATA, payload: { tableCode, tokenNo ,tableNo} });
    } else {
      {
        console.log("Full getState().cart:", getState().cart);

        let cartId =
          getState().cart.cartId || localStorage.getItem(CART_ID_KEY);

        console.log("Raw cartId:", cartId);
        console.log("Type of cartId:", typeof cartId);

        // More robust conversion
        // if (typeof cartId === "object") {
        //   // If it's an object, try to extract a string identifier
        //   cartId = cartId?.id || cartId.cartId || cartId.toString();
        // }

        console.log("Processed cartId:", cartId);

        if (!cartId) {
          console.error("No valid cart ID found");
          return;
        }

        const response = await axios.get(`kot/${cartId}/`);
        if (response.data.success) {
          dispatch({
            type: SET_TABLE_DATA,
            payload: {
              tableCode: response.data.data.DiningTableCode,
              tokenNo: response.data.data.tokenNo,
              tableNo:response.data.TableNo
            },
          });
        }else{
          dispatch({type:REMOVE_TABLE_DATA})
        }
      }
    }
  };
};




export const deleteCart = () => {
  return async (dispatch, getState) => {
    dispatch({ type: DELETE_CART_REQUEST });
    try {
      const cartId = getState().cart.cartId || localStorage.getItem(CART_ID_KEY);

      if (!cartId) {
        throw new Error("Cart ID not found");
      }

      await axios.delete(`kot/delete/${cartId}/`);
      
      // Clear local storage and cart state
      localStorage.removeItem(CART_ID_KEY);
      dispatch({ type: DELETE_CART_SUCCESS });
    } catch (error) {
      console.error("Delete cart error:", error);
      dispatch({
        type: DELETE_CART_FAILURE,
        payload: error.response
          ? error.response.data
          : { message: "Delete cart failed" },
      });
    }
  };
};



export const updateItemPendingStatus = (itemId,status)=>{
  console.log(status,itemId)

  status = status ? 1 : 0

  return async(dispatch)=>{

    const response = await postRequest(`kot-items/${itemId}/update-pending-status/`,{status:status})
    if(response.success){
      // fetchCart()
      dispatch({type:UPDATE_ITEM_PENDING_STATUS,payload:{itemId,status,AddOnCode :response.data.AddOnCOde}})
    }else{
      
    }
  }
}

export const updateItemTakeAwayStatus = (itemId,status)=>{
  // console.log(status,itemId)

  status = status ? 1 : 0

  console.log(status)

  return async(dispatch)=>{

    const response = await postRequest(`kot-items/${itemId}/update-takeaway-status/`,{status:status})
    if(response.success){
      console.log(response.data)
      dispatch({type:UPDATE_ITEM_TAKEAWAY_STATUS,payload:response.data})
    }else{

    }
  }
}




export const updateItemCompimentry = (item)=>{
  return ({type:UPDATE_ITEM_COPLIMENTRY,payload:{item}})
}

export const setBillPrintFalse = ()=>({tyepe:SET_BILL_PRINT_FAIL})


export const updateIsVegStatus = (status)=>{

  return ({type:UPDATE_VEG_STATUS,payload:status})

}