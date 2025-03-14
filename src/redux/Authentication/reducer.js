// authReducer.js

import { USER_SESSION_KEY } from "../../utils/constants";
import { LOGIN_SUCCESS, LOGOUT, UPDATE_BRANCH_CODE } from "./action";


const user = window.localStorage.getItem(USER_SESSION_KEY);

const initialState = user
  ? { user: JSON.parse(user), isAuth: true }
  // : { user: {role:"user"}, isAuth: true };
  : { user: null, isAuth: false };


const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuth: true,
        user: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        isAuth: false,
        user: null,
      };

    case UPDATE_BRANCH_CODE:
  window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify({...state.user,branchCode:action.payload.branchCode,branchName:action.payload.branchName}));

      return{
        ...state,
        user:{...state.user,branchCode:action.payload.branchCode,branchName:action.payload.branchName}
      }

    default:
      return state;
  }
};

export default authReducer;
