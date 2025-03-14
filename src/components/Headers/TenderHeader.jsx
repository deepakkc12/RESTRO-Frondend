import CartButton from "../../Features/Buttons/CartButton";
import DarkModeToggle from "../../Features/Buttons/DarkModeToggle";
import FullscreenToggle from "../../Features/Buttons/FullScreenToggle";
import HomeRedirect from "../../Features/Buttons/HomeRedirect";
import NewOrderButton from "../../Features/Buttons/NewOrderButton";
import Orders from "../../Features/Buttons/Orders";
import { getRequest } from "../../services/apis/requests";
import {
  ShoppingCart,
  Search,
  Filter,
  X,
  ChevronRight,
  UserPlus,
  MenuIcon,
  Home,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Tender from "../../Features/Buttons/Tender";
import MenuRedirect from "../../Features/Buttons/MenuRedurectButton";
import ReportRedirect from "../../Features/Buttons/ReportRedirect";
import Title from "../../Features/Badges/Title";
import AdminPanelHeader from "./AdminPanelHeader";
import AdminPannelRedirect from "../../Features/Buttons/AdminPanelRedirect";
import SettingsButton from "../../Features/Buttons/SettingsButton";

const TenderHeader = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [filters, setFilters] = useState([]);

  const getFilters = async () => {
    const response = await getRequest("menu/filter-master-list/");
    if (response.success) {
      setFilters(response.data);
    } else {
      setFilters([]);
    }
  };

  useEffect(() => {
    getFilters();
  }, []);

  //   const {cartId} = useSelector(state=>state.cart)
  //   const {user} = useSelector(state=>state.auth)

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="w-full bg-white dark:bg-gray-800 shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 items-center">
              {/* <HomeRedirect /> */}
              <Title/>
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
            <FullscreenToggle />
            <DarkModeToggle />
              <SettingsButton/>
            <AdminPannelRedirect/>

            <Tender/>
            <Orders/>
            <MenuRedirect/>
            {/* <Orders/> */}
            {/* <TableRedirect/> */}
            {/* <CartButton setIsCartOpen={setIsCartOpen}/> */}
            <NewOrderButton/>
          </div>
          </div>
        </div>
      </header>

    </div>
  );
};

export default TenderHeader;
