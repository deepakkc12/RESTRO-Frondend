import { CreditCard, CreditCardIcon, ScanLine } from 'lucide-react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openBarcodeModal } from '../../redux/BarcodeModal/action'
import { openCreditSaleModal } from '../../redux/creditSaleModal/action'
import { userPrivileges } from '../../utils/constants'
import { hasPrivilege } from '../../utils/helper'

function CreditSaleButton() {

    const {user} = useSelector(state=>state.auth)

    const dispatch = useDispatch()

    const openCreditSale = ()=>{
        dispatch(openCreditSaleModal())
    }

    
  const has_privilege = hasPrivilege(
    user.privileges,
    userPrivileges.creditSale
  );

  if (!has_privilege) return null


  return (
    <button
    onClick={openCreditSale}
    className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white 
      hover:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-all
      active:transform active:scale-95"
  >
    <CreditCardIcon size={18} />
    Credit Sale
  </button>
  )
}

export default CreditSaleButton
