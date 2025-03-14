import axios from "axios";
import { getRequest } from "../../services/apis/requests";
import { initCurrency } from "../../utils/CurrencyCofig";

// Action Types
const FETCH_SETTINGS_REQUEST = "FETCH_SETTINGS_REQUEST";
const FETCH_SETTINGS_SUCCESS = "FETCH_SETTINGS_SUCCESS";
const FETCH_SETTINGS_FAILURE = "FETCH_SETTINGS_FAILURE";


export  const CurrecnyKey = "crbbnnsd"


// Action Creators
export const fetchSettingsRequest = () => ({ type: FETCH_SETTINGS_REQUEST });
export const fetchSettingsSuccess = (settings) => ({
  type: FETCH_SETTINGS_SUCCESS,
  payload: settings,
});
export const fetchSettingsFailure = (error) => ({
  type: FETCH_SETTINGS_FAILURE,
  payload: error,
});

// ✅ Thunk to Fetch API Automatically
export const fetchSettings = () => {
  return async (dispatch) => {
    dispatch(fetchSettingsRequest());
    try {
      const response = await getRequest('settings/details/');
      const { isTokenBased, isBillPrintFirst,isKotBased,currency,MenuUi } = response.data;

      initCurrency(currency)

      dispatch(fetchSettingsSuccess({ isBillPrintFirst, isTokenBased,isKotBased,MenuUi,currency }));
    } catch (error) {
      dispatch(fetchSettingsFailure(error.message));
    }
  };
};

// Initial State
const initialState = {
  isBillPrintFirst: false,
  isTokenBased: false,
  isKotBased:false,
  loading: false,
  error: null,
  Currency:null,
  MenuUi:null
};

// Reducer
export const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SETTINGS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_SETTINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        isBillPrintFirst: action.payload.isBillPrintFirst,
        isTokenBased: action.payload.isTokenBased,
        isKotBased: action.payload.isKotBased,
        MenuUi : action.payload.MenuUi,
        Currency:action.payload.currency
      };
    case FETCH_SETTINGS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
