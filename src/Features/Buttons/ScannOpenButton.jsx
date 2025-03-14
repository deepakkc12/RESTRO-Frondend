import { ScanLine } from 'lucide-react'
import React from 'react'
import { useDispatch } from 'react-redux'
import { openBarcodeModal } from '../../redux/BarcodeModal/action'

function ScannOpenButton({showText = true}) {

    const dispatch = useDispatch()

    const openScanner = ()=>{
        dispatch(openBarcodeModal())
    }

  return (
    <button
    onClick={openScanner}
    className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white 
      hover:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-all
      active:transform active:scale-95"
  >
    <ScanLine size={18} />
   {showText&& "Scan Item"}
  </button>
  )
}

export default ScannOpenButton
