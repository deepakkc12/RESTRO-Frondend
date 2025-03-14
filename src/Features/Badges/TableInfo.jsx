import { Table } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

function TableInfo() {
//    const {tableCode} = useParams()
   const {tableNo,tokenNo} = useSelector(state=>state.cart)
//    if(!tableNo) return null
const { isBillPrintFirst, isTokenBased,isKotBased, loading } = useSelector(
  (state) => state.settings
);

    if(!tableNo && !tokenNo)return null



  return (
    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 
            px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
            <Table size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-sm md:text-[14px] text-blue-800 dark:text-blue-200">
              <span className="text-blue-600 dark:text-blue-300 font-semibold">
                Token : {isTokenBased&& tableNo+"-"}{tokenNo}
              </span>
            </span>
          </div>
  )
}

export default TableInfo
