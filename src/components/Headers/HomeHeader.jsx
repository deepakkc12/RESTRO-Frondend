import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Filter, X, ChevronRight, UserPlus, MenuIcon, User } from 'lucide-react';

import { getRequest } from '../../services/apis/requests';

import { useSelector } from 'react-redux';
import Orders from '../../Features/Buttons/Orders';
import NewOrderButton from '../../Features/Buttons/NewOrderButton';
import FullscreenToggle from '../../Features/Buttons/FullScreenToggle';
import DarkModeToggle from '../../Features/Buttons/DarkModeToggle';
import Title from '../../Features/Badges/Title';
import MenuRedirect from '../../Features/Buttons/MenuRedurectButton';
import { useLocation } from 'react-router-dom';
import SettingsButton from '../../Features/Buttons/SettingsButton';
import AdminPannelRedirect from '../../Features/Buttons/AdminPanelRedirect';

const HomeHeader = () => {

  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const setingsRoute = "/setings";

  const [filters,setFilters] = useState([])

  const getFilters = async ()=>{
    const response = await getRequest("menu/filter-master-list/")
    if(response.success){
        setFilters(response.data)
    }else{
        setFilters([])
    }
  }

  useEffect(()=>{
    getFilters()
  },[])
  

  
//   const {cartId} = useSelector(state=>state.cart)
//   const {user} = useSelector(state=>state.auth)



  return (
    <div className="sticky top-0 z-50 w-full">
    <header className="w-full bg-white dark:bg-gray-900  shadow-md">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div><div className="text-2xl flex gap-2 font-bold text-green-600 dark:text-green-400">
            <Title/>
            
          </div>
         
</div>

          <div className="flex-1 max-w-xl relative">
            {/* <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 rounded-lg 
                bg-gray-100 dark:bg-gray-700 
                text-gray-800 dark:text-gray-100
                border border-gray-200 dark:border-gray-600
                focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600
                focus:outline-none transition-colors
                placeholder-gray-500 dark:placeholder-gray-400"
            /> */}
          </div>

          <div className="flex items-center gap-3">
            {/* <Orders/> */}
            {/* <TableRedirect/> */}
            {/* <NewOrderButton/> */}
            <AdminPannelRedirect/>
           {
            location.pathname !==setingsRoute && <SettingsButton/>
           }
            <FullscreenToggle/>
            {/* <DarkModeToggle/> */}
            <MenuRedirect/>
            <button className="flex items-center gap-2 ml-2">
              <User className="w-8 h-8  dark:text-white  border-gray-200" />
              {/* <img
                src="/api/placeholder/32/32"
                alt="Admin"
                className="w-8 h-8 rounded-full border-2 border-gray-200"
              /> */}

              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-white">
                  {user?.username}
                </p>
                <p className="text-xs font-semibold  dark:text-white text-gray-500">{user.branchName}</p>
              </div>
            </button>
           {/* <CartButton setIsCartOpen={setIsCartOpen}/> */}
          </div>
        </div>
      </div>
    </header>

    {/* Modals */}
  
  </div>
);
}

export default HomeHeader;