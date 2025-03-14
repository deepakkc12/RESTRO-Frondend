import React from 'react'
// import { useDispatch, useSelector } from 'react-redux';
// import { createNewCart } from '../../redux/cart/actions';
import { useNavigate, useParams } from 'react-router-dom';
import { openNewOrderModal } from '../../redux/newOrder/action';

function ReportRedirect() {

    const navigate = useNavigate()

  const handleNavigate = ()=>{
    navigate("/reports")
  }

  
  return (
    <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg text-[14px] md:text
                bg-green-500 hover:bg-green-600 text-white dark:bg-green-600
                transition-colors"
            >
              {/* <UserPlus size={20} /> */}
              <span>Reports</span>
            </button>
  )
}

export default ReportRedirect
