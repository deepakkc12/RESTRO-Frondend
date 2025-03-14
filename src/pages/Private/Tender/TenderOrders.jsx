import React, { useState, useEffect, useMemo } from 'react';
import { 
  List, 
  FileText, 
  Clock,
  Users,
  ShoppingCart,
  Search,
  Loader2
} from 'lucide-react';
import TenderHeader from '../../../components/Headers/TenderHeader';
import { getRequest } from '../../../services/apis/requests';
import KotTypeSelector from '../../../Features/modals/KotTypeSelector';
import { useLocation, useNavigate } from 'react-router-dom';
import CartModal from '../CartModal/CartModal';
import { Currency } from '../../../utils/constants';

const TenderOrders = () => {
  const [selectedKotType, setSelectedKotType] = useState('Dine-in');
  const [originalOrders, setOriginalOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const getActiveOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRequest(`kot/tender-list/`);

      // Ensure unique orders by Code
      const uniqueOrders = Array.from(
        new Map(response.data.map(order => [order.Code, order])).values()
      );

      setOriginalOrders(uniqueOrders);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getActiveOrders();
  }, []);

  // Group orders based on current selection
  const groupedOrders = useMemo(() => {
    return originalOrders.reduce((acc, order) => {
      const kotType = order.KotTypeName || 'Other';
      if (!acc[kotType]) {
        acc[kotType] = [];
      }
      acc[kotType].push(order);
      return acc;
    }, {
      'Dine-in': [],
      'Home Delivery': [],
      'Takeaway': [],
      'Drive Through': []
    });
  }, [originalOrders]);

  const filteredOrders = useMemo(() => {
    // Only filter if search term is at least 2 characters or status filter is applied
    if ((searchTerm.length > 0 && searchTerm.length < 2) && !statusFilter) return [];
    
    return (groupedOrders[selectedKotType] || []).filter(order => {
      let matchesSearch = true;
  
      // Search logic based on selectedKotType
      if (selectedKotType === 'Takeaway') {
        matchesSearch = order.CustomerMobileNo?.toString().includes(searchTerm);
      } else if (selectedKotType === 'Home Delivery') {
        matchesSearch = order.CustomerCode?.toString().includes(searchTerm);
      } else if (searchTerm) {
        // Default case, fallback to search using TokenNo only
        matchesSearch = order.TokenNo?.toString().includes(searchTerm);
      }
  
      // Apply status filter
      const matchesStatus = !statusFilter || order.Status === statusFilter;
  
      return matchesSearch && matchesStatus;
    });
  }, [selectedKotType, groupedOrders, searchTerm, statusFilter]);

  const location = useLocation()

  const renderOrderCard = (order) => {
    const handleClick = () => {
      navigate("/cash-counter/" + order.Code,{ state: { from: location.pathname } })
    }

    return (
      <div 
        key={order.Code}
        className="
        cursor-pointer
          bg-white dark:bg-white/5
          border border-gray-200 dark:border-white/10
          rounded-xl 
          shadow-sm hover:shadow-md
          transition-all duration-300
          p-4 mb-4
          space-y-3
        "
      >
        {/* Order Header */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-3 border-gray-100 dark:border-white/10 space-y-3 md:space-y-0">
          {/* Order Details */}
          <div className="flex items-center space-x-3">
            <ShoppingCart 
              className="text-emerald-600 dark:text-emerald-400" 
              size={20} 
              strokeWidth={2}
            />

            <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
              <span className="mr-2">Order #{order.Code}</span>

              {order.TokenNo && (
                <span className="text-gray-600 dark:text-gray-300 ml-1">
                  Token #{order.TokenNo}
                </span>
              )}

              {order.TableNo && (
                <span className="text-gray-600 dark:text-gray-300 ml-1">
                  Table No - {order.TableNo}
                </span>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleClick}
              className="px-4 w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-all duration-200 shadow-sm md:w-auto"
              aria-label="Go to Cash Counter"
            >
              Cash Counter
            </button>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Customer Mobile */}
          <div className="flex items-center space-x-2">
            <Users className="text-emerald-600 dark:text-emerald-400" size={16} />
            <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 truncate">
              {order.CustomerMobileNo}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-2">
            <Clock className="text-emerald-600 dark:text-emerald-400" size={16} />
            <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
              {order.DOT}- {order.TOT}
            </span>
          </div>

          {/* Total Amount */}
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base md:text-lg">
            {Currency}{order.TotalBillAmount}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="
      min-h-screen 
      bg-gray-50 dark:bg-gray-900 
      text-gray-900 dark:text-white
      transition-colors duration-300
    ">
      <TenderHeader />
      <div className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h1 className="
            text-2xl md:text-3xl font-bold flex items-center
            text-gray-900 dark:text-white
          ">
            <List 
              className="mr-3 text-emerald-600 dark:text-emerald-400" 
              size={28} 
            /> 
            Tender List
          </h1>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder={
                  selectedKotType === 'Takeaway'
                    ? "Search by Customer Mobile Number"
                    : selectedKotType === 'Home Delivery'
                    ? "Search by Customer Code"
                    : "Search by Token Number"
                } 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full 
                  bg-white dark:bg-white/10 
                  border border-gray-300 dark:border-white/20 
                  rounded-lg pl-10 pr-4 py-2 
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 
                  focus:ring-emerald-600 dark:focus:ring-emerald-500
                  transition-all duration-300
                "
              />
              <Search 
                className="
                  absolute left-3 top-1/2 transform -translate-y-1/2 
                  text-gray-500 dark:text-gray-400
                " 
                size={20} 
              />
            </div>
          </div>
        </div>

        {/* KOT Type Selector */}
        <div className="mb-6 flex flex-wrap space-x-2 sm:space-x-3">
          {Object.keys(groupedOrders).map((kotType) => (
            <button
              key={kotType}
              onClick={() => {
                setSelectedKotType(kotType);
                setSearchTerm(''); // Reset search when changing KOT type
              }}
              className={`
                px-3 sm:px-4 py-2 
                font-semibold rounded-md text-sm 
                transition-all
                ${selectedKotType === kotType
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'}
              `}
            >
              {kotType}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 
                className="animate-spin text-emerald-600 dark:text-emerald-400" 
                size={48} 
              />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              {error}
              <button 
                onClick={getActiveOrders} 
                className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-md"
              >
                Retry
              </button>
            </div>
          ) : selectedKotType && (
            <div>
              <h2 className="
                text-xl font-semibold mb-4 flex items-center
                text-emerald-600 dark:text-emerald-400
              ">
                <FileText className="mr-3" size={24} /> 
                {selectedKotType} Orders
              </h2>
              {filteredOrders.length > 0 ? (
                <div className="space-y-3">
                  {filteredOrders.map(renderOrderCard)}
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-500">
                  {searchTerm 
                    ? `No orders found matching "${searchTerm}"` 
                    : "No orders available"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <KotTypeSelector/>
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default TenderOrders;