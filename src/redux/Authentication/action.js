import { patchRequest } from "../../services/apis/requests";
import initializeAxiosClient, { token_key } from "../../services/AxiosClient";
import { USER_SESSION_KEY } from "../../utils/constants";

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";
export const UPDATE_KOT_TYPE = 'user/UPDATE_KOT_TYPE'
export const UPDATE_BRANCH_CODE = "user/update-branch-code"

const axios = await initializeAxiosClient();



export const loginSuccess = (userData,role) => {

  // const role = userData.employee ? 'employee':"employee"

  // const employee = userData.employee ?  userData.employee : {}
  userData = {...userData,role}

  localStorage.setItem(token_key,userData.token)

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));

  return {
    type: LOGIN_SUCCESS,
    payload: userData,
  };
};

// Action creator for logout
export const logout = () => {
  window.localStorage.removeItem(USER_SESSION_KEY);
  window.localStorage.removeItem(token_key)
  return {
    type: LOGOUT,
  };
};

export const updateKotType = (kotTypeCode ) => {
  return async (dispatch, getState) => {
    try {
      const user = getState().user;

      const body = {
        kotTypeCode: kotTypeCode,
      };

      const response = await axios.patch(
        `employee/update-kot/${user.employee?.code}/`,
        body
      );

      if (response.success) {

        dispatch(
         {type:LOGIN_SUCCESS,payload:{...user,
            employee: { ...user.employee, kotTypeCode: kotTypeCode} },
          }
        );
      } 

      console.log("Proceeding with KOT Type:", kotTypeCode);
    } catch (error) {
      console.error("Error updating KOT Type:", error);
      // toast.error("An unexpected error occurred");
    }
  };
};


export const changeBranch = (branchCode,branchName)=>{
  return {
    type:UPDATE_BRANCH_CODE,payload:{branchCode,branchName}
  }
}
