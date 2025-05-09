import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CloseTableChangeModal, openTableChangeModal } from '../../redux/TableChangeModal/action';
import { KOT_TYEPES } from '../../utils/constants';

const TableChangeButton = ({ }) => {

    const {kotType} = useSelector(state=>state.cart)
    const dispatch = useDispatch()
    const onClick = ()=>{
        dispatch(openTableChangeModal())
    }

    if ( kotType != KOT_TYEPES.dineIn) return null

    // console.log(kotType)


  return (
    <button
      onClick={onClick}
      className="
        px-4 py-2 
        rounded-md 
        bg-red-100 
        text-red-800 
        border 
        border-red-200 
        hover:bg-red-200 
        focus:outline-none 
        focus:ring-2 
        focus:ring-red-400 
        focus:ring-opacity-50
        transition-colors 
        duration-200
        font-medium
        dark:bg-red-900/30
        dark:border-red-800/50
        dark:text-red-200
        dark:hover:bg-red-900/50
      "
    >
      Change Table
    </button>
  );
};

export default TableChangeButton;