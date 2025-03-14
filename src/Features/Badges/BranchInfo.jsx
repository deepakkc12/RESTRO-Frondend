import { BikeIcon, Building } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

function BranchInfo() {

    const {user} = useSelector(state=>state.auth)
    if(!user )return null

  return (
    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 
            px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
            <Building size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-800 dark:text-blue-200">
              <span className="text-blue-600 dark:text-blue-300 font-semibold">
              {user.branchName}
              </span>
            </span>
          </div>
  )
}

export default BranchInfo
