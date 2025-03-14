import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { createNewCart } from '../../redux/cart/actions';
import { useParams } from 'react-router-dom';
import { openNewOrderModal } from '../../redux/newOrder/action';

function NewOrderButton() {

  const { items: cartItems, loading, error,cartId } = useSelector(state => state.cart);

  const {tableCode} = useParams()

  const dispatch = useDispatch()
    const handleNewOrder=()=>{

      dispatch(openNewOrderModal())
      // if(tableCode){
      //   dispatch(createNewCart(tableCode))
      // }else{
      //   dispatch(createNewCart(tableCode))
      // }
    }
  return (
    <button
              onClick={handleNewOrder}
              className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg text-[14px] md:textsm
                bg-green-500 hover:bg-green-600 text-white dark:bg-green-600
                transition-colors"
            >
              {/* <UserPlus size={20} /> */}
              <span>New</span>
            </button>
  )
}

export default NewOrderButton
