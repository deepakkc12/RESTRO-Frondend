import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Filter, X, ChevronRight, LogOut, MenuIcon, MoreVertical } from 'lucide-react';
import CartModal from '../../pages/Private/CartModal/CartModal';
import FullscreenToggle from '../../Features/Buttons/FullScreenToggle';
import DarkModeToggle from '../../Features/Buttons/DarkModeToggle';
import { getRequest } from '../../services/apis/requests';
import CartButton from '../../Features/Buttons/CartButton';
import NewOrderButton from '../../Features/Buttons/NewOrderButton';
import Orders from '../../Features/Buttons/Orders';
import { useSelector, useDispatch } from 'react-redux';
import TableInfo from '../../Features/Badges/TableInfo';
import CustomerInfo from '../../Features/Badges/CustomerInfo';
import Tender from '../../Features/Buttons/Tender';
import ReportRedirect from '../../Features/Buttons/ReportRedirect';
import Logout from '../../Features/Buttons/Logout';
import Title from '../../Features/Badges/Title';
import AdminPannelRedirect from '../../Features/Buttons/AdminPanelRedirect';
import SettingsButton from '../../Features/Buttons/SettingsButton';
import BranchInfo from '../../Features/Badges/BranchInfo';
import LoginInfo from '../../Features/Badges/LoginInfo';
import MenuRedirect from '../../Features/Buttons/MenuRedurectButton';
const MenuHeader = ({activeFilters, removeFilter, setActiveFilters, isAsideExpanded, toggleAside}) => {
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState([]);

  const dispatch = useDispatch();
  const {cartId, kotType} = useSelector(state => state.cart);
  const {user} = useSelector(state => state.auth);

  useEffect(() => {
    const getFilters = async () => {
      try {
        const response = await getRequest("menu/filter-master-list/");
        setFilters(response.success ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };
    getFilters();
  }, []);

  // Mobile Menu Component
  const MobileMenu = () => (
    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-50 bg-gray-900/50`}>
      <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 dark:text-white">Menu</h3>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            <SettingsButton />
            <FullscreenToggle />
            <DarkModeToggle />
            <AdminPannelRedirect />
            <Tender />
            <Orders />
            
            <NewOrderButton />
            <Logout />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sticky top-0 z-40 w-full">
      <header className="w-full bg-white dark:bg-gray-800 shadow-md">
        {/* Top Header */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-2">
              
              <Title showIp className="hidden sm:block" />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-3">
                <FullscreenToggle />
                <DarkModeToggle />
                <Logout />
                <SettingsButton />
              </div>
              <AdminPannelRedirect />
              <Tender />
              <Orders />
              <MenuRedirect/>
              <CartButton setIsCartOpen={setIsCartOpen} />
              <NewOrderButton />
            </div>

            {/* Mobile Quick Actions */}
            <div className="md:hidden flex items-center gap-2">
              <CartButton setIsCartOpen={setIsCartOpen} />
              <NewOrderButton />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {/* Branch and Login Info */}
            <div className="flex flex-wrap gap-2 items-center">
              <BranchInfo />
              <LoginInfo />
            </div>

            {/* Order Info and Customer Details */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-green-800 dark:text-green-400">
                {kotType ? `Order - ${kotType}` : "No Active Order"}
              </span>
              
              {cartId && (
                <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                  <ShoppingCart size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    #{cartId}
                  </span>
                </div>
              )}
              
              <div className="flex gap-2">
                <CustomerInfo />
                <TableInfo />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      {/* <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} /> */}
      <MobileMenu />
    </div>
  );
};

export default MenuHeader;