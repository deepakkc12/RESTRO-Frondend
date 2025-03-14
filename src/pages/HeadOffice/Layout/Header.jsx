import React, { useState, useRef, useEffect } from 'react';
import { Menu, Settings, Lock, LogOut } from "lucide-react";
import { useDispatch } from 'react-redux';
// import { logout } from '../../redux/Authentication/action';
import { useNavigate } from 'react-router-dom';

export const Header = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = ()=>{
    // dispatch(logout())

    navigate("/")

  }
  return (
    <header className="bg-primary-600 text-white">
      <div className="flex items-center shadow-2xl justify-between p-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-white p-1 mr-4 focus:outline-none transition-transform duration-200 ease-in-out hover:scale-110"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-roboto  font-bold ">RESTRO</h1>
        </div>
        <div className="flex items-center">
          <div className="relative z-50" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="p-2 rounded-full bg-secondary-500 shadow-xl hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200 ease-in-out"
            >
              <Settings size={20} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out origin-top-right transform scale-100 opacity-100">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {/* <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    <Lock className="mr-3" size={16} />
                    Change Password
                  </a> */}
                  <a onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    <LogOut className="mr-3" size={16} />
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
