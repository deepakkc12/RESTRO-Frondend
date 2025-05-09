import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronRight, Lock, RefreshCw, LogOut, ShoppingBag, ShoppingBagIcon, CreditCard, Keyboard } from 'lucide-react';
import HomeHeader from '../../../components/Headers/HomeHeader';
import { hasPrivilege } from '../../../utils/helper';
import { userPrivileges } from '../../../utils/constants';
import BranchSelectionModal from './Components/BranchSelectionModal';
import { CloseVirtualKeyboardModal, openVirtualKeyboardModal } from '../../../redux/VirtualKeyboard/action';

// Custom Toggle Switch Component
const Toggle = ({ checked, onChange }) => (
  <div 
    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
      checked ? 'bg-blue-600' : 'bg-gray-300'
    }`}
    onClick={() => onChange(!checked)}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </div>
);

const SettingsMenuItem = ({ icon: Icon, title, description, onClick, children }) => (
  <button
    onClick={onClick}
    className="h-full text-left py-3 px-4 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex items-center group border border-gray-200 shadow-sm"
    aria-label={`${title} - ${description}`}
  >
    <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
      <Icon className="text-blue-600 w-5 h-5" />
    </div>
    <div className="flex-grow">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-500 line-clamp-1">{description}</p>
    </div>
    <div className="ml-2 flex-shrink-0">
      {children || <ChevronRight className="text-gray-400 w-5 h-5" />}
    </div>
  </button>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const isAdmin = hasPrivilege(user.privileges, userPrivileges.Admin);
  const hasCCntrPrvlege = hasPrivilege(user.privileges, userPrivileges.cashCounter);
  
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  const {isOpen} = useSelector(state=>state.virtualKeyboard)

  const handleBranchSelect = (branch) => {
    console.log('Selected branch:', branch);
  };


  const handleKeypadToggle = (checked) => {
    // setShowVirtualKeypad(checked);
    // console.log(checked)
    // console.log(isOpen)
    if(isOpen){
      dispatch(CloseVirtualKeyboardModal())
    }else{
      dispatch(openVirtualKeyboardModal())
    }
    // You would typically dispatch an action here to update your Redux store
    // dispatch(updateSettings({ showVirtualKeypad: checked }));
  };

  const { isBillPrintFirst } = useSelector(
    (state) => state.settings
  );

  const menuItems = [
    ...(isBillPrintFirst && hasCCntrPrvlege ? [{
      icon: CreditCard,
      title: 'Cash Counter',
      description: 'Settle Payments',
      onClick: () => navigate('/cash-counter/list'),
    }] : []),
    
    {
      icon: RefreshCw,
      title: 'Shift Closing',
      description: 'Manage your Shift Closing settings',
      onClick: () => navigate('/close-counter'),
    },
    {
      icon: ShoppingBagIcon,
      title: 'Inward Management',
      description: 'Manage your inward details',
      onClick: () => navigate('/inwards'),
    },
    {
      icon: Lock,
      title: 'Change Password',
      description: 'Update your account password',
      onClick: () => navigate('/change-password'),
    },
    {
      icon: CreditCard,
      title: 'Payments',
      description: 'Manage Payments',
      onClick: () => navigate('/payments'),
    },
    // {
    //   icon: CreditCard,
    //   title: 'Receipts',
    //   description: 'Manage Receipts',
    //   onClick: () => navigate('/receipts'),
    // },
    ...(isAdmin ? [{
      icon: LogOut,
      title: 'Change Branch',
      description: 'Switch to a different branch',
      onClick: () => setIsBranchModalOpen(true),
    }] : []),
    {
      icon: Keyboard,
      title: 'Virtual Keypad',
      description: 'Toggle virtual keypad display',
      component: (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Toggle
            checked={isOpen}
            onChange={handleKeypadToggle}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />
      
      <main className="max-w-5xl mx-auto p-3">
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-gray-200 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-blue-800">General Settings</h2>
          </div>

          <div className="p-3">
            <div className="flex flex-col space-y-2">
              {menuItems.map((item, index) => (
                <SettingsMenuItem
                  key={`${item.title}-${index}`}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  onClick={item.onClick}
                >
                  {item.component}
                </SettingsMenuItem>
              ))}
            </div>

            <div className="mt-4 pt-2 border-t border-gray-200 text-center">
              {/* <p className="text-xs text-gray-500 italic">
                More options coming soon
              </p> */}
            </div>
          </div>
        </div>
      </main>

      <BranchSelectionModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        onBranchSelect={handleBranchSelect}
      />
    </div>
  );
};

export default SettingsPage;