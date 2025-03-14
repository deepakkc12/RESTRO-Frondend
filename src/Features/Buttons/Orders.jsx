import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'

function Orders() {

    const navigate = useNavigate()
    const { isBillPrintFirst, isTokenBased,isKotBased, loading } = useSelector(
      (state) => state.settings
    );

  return (
     <button
    onClick={()=>{navigate("/active-orders")}}
    className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg text-[14px] md:textsm
      bg-green-500 hover:bg-green-600 text-white dark:bg-green-600
      transition-colors"
  >

    <span>{isBillPrintFirst?"Orders":"Billing"}</span>

  </button>
  )
}

export default Orders
