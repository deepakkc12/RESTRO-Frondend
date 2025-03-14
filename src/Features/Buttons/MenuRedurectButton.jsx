import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { createNewCart } from '../../redux/cart/actions';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { openNewOrderModal } from '../../redux/newOrder/action';

function MenuRedirect({goBack = false}) {

    const { pathname } = useLocation();
    const navigate = useNavigate();
  
    const handleNavigate = () => {
      // Check if pathname starts with "menu-detail/"
      if (pathname.startsWith("/menu-detail/") || pathname.startsWith("/table")) {
        navigate(-1); // Go back to the previous page
      } else {
        navigate("/menu?category=0"); // Navigate to the "/menu" route
      }
    };
  
  return (
    <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg text-[14px] md:textsm
                bg-green-500 hover:bg-green-600 text-white dark:bg-green-600
                transition-colors"
            >
              {/* <UserPlus size={20} /> */}
              <span>Menu</span>
            </button>
  )
}

export default MenuRedirect
