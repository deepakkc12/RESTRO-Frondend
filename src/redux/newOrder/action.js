import { getRequest } from "../../services/apis/requests";

export const OPEN_MODAL = "kottype.OPEN_MODAL";
export const CLOSE_MODAL = "kottype.CLOSE_MODAL";
export const SET_KOT_TYPES = "kottype.SET_KOT_TYPES";

export const openNewOrderModal = () => ({
    type: OPEN_MODAL,
});

export const CloseNewOrderModal = () => ({
    type: CLOSE_MODAL,
});

export const setKotTypes = (kotTypes) => ({
    type: SET_KOT_TYPES,
    payload: kotTypes,
});

export const fetchKotTypes = () => async (dispatch) => {
    try {
        const response = await getRequest("kot-types/?status=isActive");
        if (response.success) {
            dispatch(setKotTypes(response.data));
        } else {
            console.error("Failed to fetch KOT types:", response.message);
        }
    } catch (error) {
        console.error("Error fetching KOT types:", error);
    }
};
