import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, X, ChevronRight, UserPlus, ChevronLeft, Menu, Settings } from 'lucide-react';
import CartModal from '../../pages/Private/CartModal/CartModal';
import FullscreenToggle from '../../Features/Buttons/FullScreenToggle';
import DarkModeToggle from '../../Features/Buttons/DarkModeToggle';
import CartButton from '../../Features/Buttons/CartButton';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Tender from '../../Features/Buttons/Tender';
import Orders from '../../Features/Buttons/Orders';
import NewOrderButton from '../../Features/Buttons/NewOrderButton';
import MenuRedirect from '../../Features/Buttons/MenuRedurectButton';
import CurrentDate from '../../Features/Badges/CurrentDate';
import SettingsButton from '../../Features/Buttons/SettingsButton';
import BranchInfo from '../../Features/Badges/BranchInfo';
import LoginInfo from '../../Features/Badges/LoginInfo';
import CustomerInfo from '../../Features/Badges/CustomerInfo';
import TableInfo from '../../Features/Badges/TableInfo';

const MenuDetailHeader = ({name}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [groupedCartItems, setGroupedCartItems] = useState({
    1: [
      { name: "Chat Masala", quantity: 1, price: 15.0, image: "/api/placeholder/50/50" },
      { name: "Veg Cheese Pizza", quantity: 1, price: 18.0, image: "/api/placeholder/50/50", extras: "Extra Cheese" },
    ],
    2: [
      { name: "Fried Chicken", quantity: 1, price: 20.0, image: "/api/placeholder/50/50" },
      { name: "Mushroom Pizza", quantity: 1, price: 16.0, image: "/api/placeholder/50/50" },
    ],
  });

  const handleUpdateQuantity = (kotId, itemName, change) => {
    setGroupedCartItems(prevItems => {
      const updatedKot = prevItems[kotId].map(item =>
        item.name === itemName
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0);

      return {
        ...prevItems,
        [kotId]: updatedKot
      };
    });
  };
  

  const totalCartItems = Object.values(groupedCartItems).reduce(
    (total, kot) => total + kot.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  const {cartId,kotType} = useSelector(state=>state.cart)
  const navigate = useNavigate()

  if (cartId ==null){
    return navigate(-1)
  }

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="w-full bg-white dark:bg-gray-800 shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button and Title */}
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold truncate max-w-[200px] sm:max-w-none">
                {name}
              </h1>
              <CurrentDate/>
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-3">
              <SettingsButton/>
            <FullscreenToggle />
            <DarkModeToggle />
            {/* <Tender/>
            <Orders/> */}
            {/* <TableRedirect/> */}
            <MenuRedirect goBack={true}/>
           <CartButton setIsCartOpen={setIsCartOpen}/>
            <NewOrderButton/>
          </div>

            {/* Mobile Actions */}
            <div className="sm:hidden flex items-center gap-2">
              {/* Cart ID and Cart Button */}
              <div className="flex items-center gap-2">
                {/* {cartId && (
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 
                    px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                    <ShoppingCart size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      #{cartId}
                    </span>
                  </div>
                )}
                */}
              </div>

              {/* Settings/Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 sm:hidden">
          <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex flex-col p-4 space-y-2">
              <div className="flex items-center justify-between border-b pb-2 mb-2 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Settings
                </span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Fullscreen</span>
                  <FullscreenToggle />
                </div>
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <DarkModeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        groupedCartItems={groupedCartItems}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
};

export default MenuDetailHeader;