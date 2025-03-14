import { CLOSE_MODAL, OPEN_MODAL, SET_KOT_TYPES } from "./action";

const initialState = {
    isOpen: false,
    kotTypes: [],
};

const newOrderModalReducer = (state = initialState, action) => {
    switch (action.type) {
        case OPEN_MODAL:
            return {
                ...state,
                isOpen: true,
            };
        case CLOSE_MODAL:
            return {
                ...state,
                isOpen: false,
            };
        case SET_KOT_TYPES:
            return {
                ...state,
                kotTypes: action.payload, // Updating kotTypes in state
            };
        default:
            return state;
    }
};

export default newOrderModalReducer;
