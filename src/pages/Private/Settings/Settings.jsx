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
    className="w-full text-left px-4 py-4 rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-between group border border-gray-200 shadow-sm hover:shadow-md"
    aria-label={`${title} - ${description}`}
  >
    <div className="flex items-center space-x-4">
      <div className="bg-blue-100 p-2.5 rounded-lg">
        <Icon className="text-blue-600 w-5 h-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    {children || <ChevronRight className="text-gray-400 group-hover:text-blue-600 w-6 h-6 transition-colors" />}
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
      
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-blue-800">General Settings</h2>
          </div>

          <div className="p-6 space-y-4">
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

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 italic">
                More personalization options coming soon
              </p>
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