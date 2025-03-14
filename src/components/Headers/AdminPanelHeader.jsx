import Title from "../../Features/Badges/Title";
import AdminPannelRedirect from "../../Features/Buttons/AdminPanelRedirect";
import FullscreenToggle from "../../Features/Buttons/FullScreenToggle";
import Logout from "../../Features/Buttons/Logout";
import MenuRedirect from "../../Features/Buttons/MenuRedurectButton";
import { Bell, Search, Settings, Shield } from "lucide-react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsButton from "../../Features/Buttons/SettingsButton";

const AdminPanelHeader = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const adminPanelRoute = "/admin-panel";

  //   console.log(location.pathname)

  const navigate = useNavigate();
  useEffect(() => {
    if (user.isAdmin == 0) {
      navigate("/");
    }
  }, [user]);
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Logo and Search */}
          <div className="flex items-center gap-6">
            <Title />

            {/* Search Bar */}
            {/* <div className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div> */}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            <SettingsButton/>
            <Logout />
            {/* Notification Bell */}
            {/* <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button> */}

            {/* Settings */}
            {/* <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings size={20} className="text-gray-600" />
            </button> */}

            <div className="h-6 w-px bg-gray-200"></div>

            <FullscreenToggle />
            <MenuRedirect />
            {location.pathname !== adminPanelRoute && <AdminPannelRedirect />}

            {/* Admin Profile */}
            <button className="flex items-center gap-2 ml-2">
              <Shield className="w-8 h-8 rounded-full border-2 border-gray-200" />
              {/* <img
                src="/api/placeholder/32/32"
                alt="Admin"
                className="w-8 h-8 rounded-full border-2 border-gray-200"
              /> */}

              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminPanelHeader;
