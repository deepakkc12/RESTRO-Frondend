import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  ChevronLeft, 
  Settings 
} from 'lucide-react';
import CartModal from '../../pages/Private/CartModal/CartModal';
import FullscreenToggle from '../../Features/Buttons/FullScreenToggle';
import DarkModeToggle from '../../Features/Buttons/DarkModeToggle';
import CartButton from '../../Features/Buttons/CartButton';
import MenuRedirect from '../../Features/Buttons/MenuRedurectButton';
import ReportRedirect from '../../Features/Buttons/ReportRedirect';
import NewOrderButton from '../../Features/Buttons/NewOrderButton';
import Tender from '../../Features/Buttons/Tender';
import Orders from '../../Features/Buttons/Orders';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Generic Responsive Header Component
const ResponsiveHeader = ({
  title = 'RESTRO', 
  leftAction, 
  rightActions = [], 
  searchEnabled = false,
  mobileSettingsMenu = true,
  cartId
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const renderMobileSettingsMenu = () => {
    if (!mobileSettingsMenu) return null;

    return isMobileMenuOpen && (
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
              {rightActions.filter(action => 
                ['FullscreenToggle', 'DarkModeToggle'].includes(action.name)
              ).map(action => (
                <div key={action.name} className="flex items-center justify-between">
                  <span>{action.displayName}</span>
                  {action.component}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side - Back/Logo */}
          <div className="flex items-center space-x-2">
            {leftAction && (
              <button 
                onClick={leftAction.handler}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                {leftAction.icon}
              </button>
            )}
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 truncate max-w-[200px] sm:max-w-none">
              {title}
            </div>
          </div>

          {/* Search Bar (Optional) */}
          {searchEnabled && (
            <div className="flex-1 max-w-xl relative hidden sm:block">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search..."
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
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            {rightActions.map(action => action.component)}
            {cartId && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 
                px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                <ShoppingCart size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  # {cartId}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="sm:hidden flex items-center space-x-2">
            {cartId && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 
                px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                <ShoppingCart size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  # {cartId}
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Settings Menu */}
      {renderMobileSettingsMenu()}

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  );
};

// Menu Header
const MenuHeader = () => {
  const navigate = useNavigate();
  const {cartId, kotType} = useSelector(state => state.cart);

  const rightActions = [
    { name: 'FullscreenToggle', component: <FullscreenToggle />, displayName: 'Fullscreen' },
    { name: 'DarkModeToggle', component: <DarkModeToggle />, displayName: 'Dark Mode' },
    { name: 'ReportRedirect', component: <ReportRedirect /> },
    { name: 'Tender', component: <Tender /> },
    { name: 'Orders', component: <Orders /> },
    { name: 'CartButton', component: <CartButton /> },
    { name: 'NewOrderButton', component: <NewOrderButton /> }
  ];

  return (
    <ResponsiveHeader 
      title="RESTRO"
      searchEnabled={true}
      rightActions={rightActions}
      cartId={cartId}
    />
  );
};

// Menu Detail Header
const MenuDetailHeader = ({ name }) => {
  const navigate = useNavigate();
  const {cartId} = useSelector(state => state.cart);

  const rightActions = [
    { name: 'FullscreenToggle', component: <FullscreenToggle />, displayName: 'Fullscreen' },
    { name: 'DarkModeToggle', component: <DarkModeToggle />, displayName: 'Dark Mode' },
    { name: 'MenuRedirect', component: <MenuRedirect /> },
    { name: 'CartButton', component: <CartButton /> }
  ];

  return (
    <ResponsiveHeader 
      title={name}
      leftAction={{
        icon: <ChevronLeft className="w-6 h-6" />,
        handler: () => navigate('/menu')
      }}
      rightActions={rightActions}
      cartId={cartId}
    />
  );
};

// Table Layout Header
const TableLayoutHeader = () => {
  const rightActions = [
    { name: 'FullscreenToggle', component: <FullscreenToggle />, displayName: 'Fullscreen' },
    { name: 'DarkModeToggle', component: <DarkModeToggle />, displayName: 'Dark Mode' },
    { name: 'MenuRedirect', component: <MenuRedirect /> }
  ];

  return (
    <ResponsiveHeader 
      title="RESTRO"
      rightActions={rightActions}
    />
  );
};

// Order Header
const OrderHeader = () => {
  const rightActions = [
    { name: 'FullscreenToggle', component: <FullscreenToggle />, displayName: 'Fullscreen' },
    { name: 'DarkModeToggle', component: <DarkModeToggle />, displayName: 'Dark Mode' },
    { name: 'ReportRedirect', component: <ReportRedirect /> },
    { name: 'Tender', component: <Tender /> },
    { name: 'MenuRedirect', component: <MenuRedirect /> },
    { name: 'NewOrderButton', component: <NewOrderButton /> }
  ];

  return (
    <ResponsiveHeader 
      title="RESTRO"
      rightActions={rightActions}
    />
  );
};

// Report Header
const ReportHeader = () => {
  const rightActions = [
    { name: 'FullscreenToggle', component: <FullscreenToggle />, displayName: 'Fullscreen' },
    { name: 'DarkModeToggle', component: <DarkModeToggle />, displayName: 'Dark Mode' }
  ];

  return (
    <ResponsiveHeader 
      title="RESTRO"
      rightActions={rightActions}
    />
  );
};

export { 
  MenuHeader, 
  MenuDetailHeader, 
  TableLayoutHeader, 
  OrderHeader, 
  ReportHeader 
};