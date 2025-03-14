import React, { useState } from 'react';
import { ShoppingCart, Search } from 'lucide-react';
import CartModal from '../../pages/Private/CartModal/CartModal';
import FullscreenToggle from '../../Features/Buttons/FullScreenToggle';
import DarkModeToggle from '../../Features/Buttons/DarkModeToggle';
import MenuRedirect from '../../Features/Buttons/MenuRedurectButton';
import Title from '../../Features/Badges/Title';

const TableLayoutHeader = () => {

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

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Title/>

          {/* Search Bar */}
          {/* <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
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
            />
          </div> */}

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            <FullscreenToggle />
            <DarkModeToggle />
            <MenuRedirect/>
            
            {/* Cart Button */}
          
          </div>
        </div>
      </div>

      {/* Cart Modal */}
    
    </header>
  );
};

export default TableLayoutHeader;