import { openNewOrderModal } from "../../redux/newOrder/action";
import React from "react";
import { useSelector } from "react-redux";
// import { useDispatch, useSelector } from 'react-redux';
// import { createNewCart } from '../../redux/cart/actions';
import { useNavigate, useParams } from "react-router-dom";

function AdminPannelRedirect() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/admin-panel");
  };

  const { user } = useSelector((state) => state.auth);

  if (user.isAdmin == 0) {
    return null
}

  return (
    <button
      onClick={handleNavigate}
      className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg text-[14px] md:text
                bg-green-500 hover:bg-green-600 text-white dark:bg-green-600
                transition-colors "
    >
      {/* <UserPlus size={20} /> */}
      <span>Admin Panel</span>
    </button>
  );
}

export default AdminPannelRedirect;
