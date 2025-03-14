import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function TableRedirect() {

    const user = useSelector(state=>state.auth.user)
    const navigate = useNavigate()
    // if(user.employee.kotTypeCode<3){return null}

    const redirect = ()=>{
        navigate("/table")
    }
    return null
  return (
    <button
    onClick={redirect}
    className="flex items-center gap-2 px-3 py-2 rounded-lg
      bg-green-500 hover:bg-green-600 text-white dark:bg-green-600
      transition-colors"
  >
    {/* <UserPlus size={20} /> */}
    <span>Tables</span>
  </button>
  )
}

export default TableRedirect
