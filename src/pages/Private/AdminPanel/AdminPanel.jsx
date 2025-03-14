import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Barcode, 
  ChartBarIcon, 
  Database, 
  DatabaseBackup, 
  Printer, 
  ReceiptIcon, 
  SquarePenIcon, 
  User, 
  User2Icon, 
  UtensilsIcon,
  Search,
  Bell
} from 'lucide-react';
import AdminPanelHeader from '../../../components/Headers/AdminPanelHeader';

// const AdminPanelHeader = () => {
//   return (
//     <header className="bg-white border-b">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center">
//             <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//           </div>
          
//           <div className="flex items-center gap-6">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-64 px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//               <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
//             </div>
            
//             <button className="relative p-2 text-gray-400 hover:text-gray-500">
//               <Bell className="w-6 h-6" />
//               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//             </button>
            
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
//                 A
//               </div>
//               <span className="text-sm font-medium text-gray-700">Admin User</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

const AdminPanel = () => {
  const navigate = useNavigate();

  const navigationButtons = [
    {
      title: 'Reports',
      icon: <ChartBarIcon className="w-6 h-6" />,
      path: '/reports',
      description: 'Access comprehensive system reports and analytics.',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Food Preferences',
      icon: <UtensilsIcon className="w-6 h-6" />,
      path: '/preference-manager',
      description: 'Customize and manage food preference settings.',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'EAN Management',
      icon: <Barcode className="w-6 h-6" />,
      path: '/ean-manager',
      description: 'Organize and update EAN details.',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Printer Management',
      icon: <Printer className="w-6 h-6" />,
      path: '/printer-manager',
      description: 'Configure and manage printer settings for items.',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Price Management',
      icon: <SquarePenIcon className="w-6 h-6" />,
      path: '/price-manager',
      description: 'Maintain and adjust item pricing.',
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-600'
    },
    {
      title: 'User Management',
      icon: <User2Icon className="w-6 h-6" />,
      path: '/user-manager',
      description: 'Manage user accounts and permissions.',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Customer Management',
      icon: <User className="w-6 h-6" />,
      path: '/customer-manager',
      description: 'Manage Customer accounts',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600'
    },
    // {
    //   title: 'Data Backup',
    //   icon: <DatabaseBackup className="w-6 h-6" />,
    //   path: '/backup',
    //   description: 'Create backup file',
    //   bgColor: 'bg-red-100',
    //   iconColor: 'text-red-600'
    // },
    {
      title: 'Inward',
      icon: <ReceiptIcon className="w-6 h-6" />,
      path: '/inwards',
      description: 'Manage inward details',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <AdminPanelHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          <p className="text-gray-600 mt-1">Access your most frequently used tools and features</p>
        </div> */}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white rounded-lg gap-8 p-6">
      {navigationButtons.map((button) => (
        <button
          key={button.title}
          onClick={() => navigate(button.path)}
          className="group relative flex flex-col items-start p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-100 overflow-hidden"
        >
          {/* Hover background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Header section */}
          <div className="flex items-center w-full space-x-4 mb-4 relative">
            <div className={`${button.bgColor} rounded-xl p-3 group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 shadow-sm`}>
              <div className={`${button.iconColor} text-lg`}>
                {button.icon}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
              {button.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 relative">
            {button.description}
          </p>

          {/* Subtle arrow indicator */}
          <div className="absolute bottom-4 right-4 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <svg 
              className="w-5 h-5 text-blue-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </button>
      ))}
    </div>
      </main>
    </div>
  );
};

export default AdminPanel;