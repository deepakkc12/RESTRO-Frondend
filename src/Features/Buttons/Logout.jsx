import { logout } from "../../redux/Authentication/action";
import { LogOut } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function Logout() {
  const dispatch = useDispatch();
  const  navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return (
    <div className="">
      <button
        onClick={handleLogout}
        className="text-red-600 dark:text-red-400 hover:bg-red-50 p-2 rounded-full"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}

export default Logout;
