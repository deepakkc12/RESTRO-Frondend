import React from 'react';
import { XCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openCancelOrderModal } from '../../../redux/cancelOrderModal/action';
import { hasPrivilege } from '../../../utils/helper';
import { userPrivileges } from '../../../utils/constants';

const CancelOrderButton = ({ order, className = "" }) => {
  const dispatch = useDispatch();

  const handleCancelOrder = (e) => {
    e.stopPropagation();

    console.log("Cancel Order Button Clicked", order);
    // alert("Are you sure you want to cancel this order? This action cannot be undone.");
    // Prevent parent onClick from triggering
    dispatch(openCancelOrderModal(order));
  };

  const {user} = useSelector((state) => state.auth);

  const is_privileged = hasPrivilege(user.privileges, userPrivileges.delete_kot);

  if (!is_privileged) {
    return null; // Don't render button if user doesn't have privilege
  }
  return (
    <button
      onClick={handleCancelOrder}
      className={`
        flex items-center px-3 py-2 rounded-lg 
        bg-red-500 text-white font-semibold 
        hover:bg-red-600 transition-all 
        duration-200 shadow-sm
        ${className}
      `}
      aria-label="Cancel Order"
      title="Cancel Order"
    >
      <XCircle size={16} className="mr-1" />
      <span className="text-sm">Cancel</span>
    </button>
  );
};

export default CancelOrderButton;