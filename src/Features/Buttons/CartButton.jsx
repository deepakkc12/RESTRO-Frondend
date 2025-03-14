import { CarIcon, ShoppingCart } from 'lucide-react';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../../redux/cart/actions';
import { Seperate_packing_code } from '../../utils/constants';
import { openCARTModal } from '../../redux/cartMoodal/action';

function CartButton({setIsCartOpen}) {

    const { items: cartItems, loading, error,cartId } = useSelector(state => state.cart);

    const dispatch = useDispatch()

    useEffect(()=>{
      if(cartId){

        dispatch(fetchCart(cartId))
      }
    },[cartId,dispatch])


    if (!cartId){
        return null
    }

    const length = cartItems.filter(item => item.SubSkuCode !== Seperate_packing_code).length;

  return (
    <button
    onClick={()=>{dispatch(openCARTModal())}}
    className="relative gap-2 px-2 md:px-3 py-2 rounded-lg text-[14px] md:textsm
      bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700
      text-white transition-colors shrink-0"
  >
    {/* <ShoppingCart size={24} /> */}
    Serving Kot
    {
      <span className="absolute -top-2 -right-2 bg-red-500 text-white 
        text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {length}
      </span>
    }
  </button>
  )
}

export default CartButton
