import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CloseTableChangeModal } from '../../redux/TableChangeModal/action';
import { getRequest, postRequest } from '../../services/apis/requests';
import { useToast } from '../../hooks/UseToast';
import { SET_TABLE_DATA } from '../../redux/cart/actions';

// Table Status Constants
const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  PARTIALLY_OCCUPIED: 'partially_occupied'
};

// Table Style Configurations
const TABLE_STYLES = {
  [TABLE_STATUS.AVAILABLE]: {
    border: 'border-emerald-500',
    background: 'bg-emerald-500',
    hover: 'hover:bg-emerald-50'
  },
  [TABLE_STATUS.OCCUPIED]: {
    border: 'border-rose-500',
    background: 'bg-rose-500',
    hover: 'hover:bg-rose-50'
  },
  [TABLE_STATUS.PARTIALLY_OCCUPIED]: {
    border: 'border-amber-500',
    background: 'bg-amber-500',
    hover: 'hover:bg-amber-50'
  }
};


const ConfirmationModal = ({ isOpen, table, onConfirm, onCancel, isLoading }) => {
    if (!isOpen || !table) return null;
  
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-80 shadow-xl">
          <h3 className="text-lg font-bold mb-2 dark:text-white">Confirm Table Selection</h3>
          
          <div className="mb-4 text-sm dark:text-white">
            <p>Are you sure you want to select:</p>
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p><span className="font-medium">Table:</span> {table.Name}{table.TableNo}</p>
              <p><span className="font-medium">Status:</span> {table.CNT > 0 ? 'Partially Occupied' : 'Available'}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                px-3 py-1.5 rounded-md text-white
                ${isLoading
                  ? 'bg-red-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'}
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </span>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
// Button Component
const Button = ({ children, isActive = true, isSelected = false, className = '', onClick }) => {
  const baseStyles = `
    px-3 py-1 rounded-lg transition-all duration-200
    ${isActive 
      ? 'hover:shadow-lg dark:hover:shadow-black/30' 
      : 'opacity-40 cursor-not-allowed'}
  `;
  
  return (
    <button 
      className={`
        ${baseStyles}
        ${className}
        ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 dark:ring-offset-gray-900 scale-105' : 'scale-100'}
        ${isActive ? '' : 'dark:opacity-30'}
      `}
      onClick={onClick}
      disabled={!isActive}
    >
      {children}
    </button>
  );
};
// Table Button Component - Smaller size for large table count
const TableButton = ({ table, isSelected, onClick }) => {
    if (!table) return null;
    
    // Get the current table code from Redux state
    const cart = useSelector(state => state.cart);
    const isCurrentTable = cart.tableCode == table.Code;
    
    const getTableStatus = () => {
      if (table.CNT >= 1) {
        return TABLE_STATUS.PARTIALLY_OCCUPIED;
      } else if (table.CNT === 0) {
        return TABLE_STATUS.AVAILABLE;
      }
    };
  
    const status = getTableStatus(table);
    const styles = TABLE_STYLES[status];
  
    return (
      <Button
        isActive={!isCurrentTable} // Disable the button if it's the current table
        isSelected={isSelected}
        onClick={() => onClick(table)}
        className={`
          relative
          w-16 h-16
          sm:w-14 sm:h-14
          xs:w-12 xs:h-12
          flex flex-col items-center justify-center
          border-2 ${styles.border}
          ${table.Name === "T" ? "bg-white" : "bg-yellow-500"}
          ${table.Name === "T" ? "text-blue-800 text-xs" : "text-white text-xs hover:text-blue-800"}
          ${styles.hover}
          ${isCurrentTable ? "opacity-40 cursor-not-allowed" : ""}
        `}
      >
        <div className="font-bold text-xs">
          <span>
            {table.Name === "T" ? table.Name : "OD"}
          </span>{table.TableNo}
        </div>
        {isCurrentTable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold bg-black bg-opacity-30 text-white px-1 py-0.5 rounded-sm">
              Current
            </span>
          </div>
        )}
      </Button>
    );
  };

// Category Tabs Component
const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex overflow-x-auto pb-2 mb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
      {categories.map(category => (
        <button
          key={category}
          className={`px-3 py-1 mr-2 whitespace-nowrap rounded-md ${
            activeCategory === category 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

// Search Component
const TableSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };
  
  return (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search table number..."
          value={query}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Table Pagination Component
const TablePagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  
  // Show max 5 page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="flex justify-center items-center space-x-1 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 py-1 rounded-md ${
          currentPage === 1 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
        }`}
      >
        &lt;
      </button>
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 rounded-md ${
            currentPage === number 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
          }`}
        >
          {number}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 rounded-md ${
          currentPage === totalPages 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
        }`}
      >
        &gt;
      </button>
    </div>
  );
};

// Table Selection Modal Component

const TableSelectionModal = ({ onTableSelected }) => {
    const { isOpen } = useSelector(state => state.tableChange);
    const dispatch = useDispatch();
    
    const onClose = () => {
      dispatch(CloseTableChangeModal());
    };
    
    const [allTables, setAllTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState(null);
    
    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [tableToConfirm, setTableToConfirm] = useState(null);
    
    // Search and filtering state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [tablesPerPage] = useState(60); // 8x6 grid
    const [activeCategory, setActiveCategory] = useState('All');
  
    const cart = useSelector(state=>state.cart);
    
    // Fetch tables from API
    useEffect(() => {
      if (isOpen) {
        setLoading(true);
        setError(null);
        
        const getTables = async() => {
          try {
            const response = await getRequest(`tables/layout/${4}/`);
            if (response.success) {
              const activeTables = response.data
                .filter(table => table.Name !== "Not Active")
                .sort((a, b) => a.TableNo - b.TableNo);
              
              setAllTables(activeTables);
              setLoading(false);
            } else {
              setLoading(false);
              setError("Failed to fetch tables");
            }
          } catch (error) {
            console.error('Error fetching tables:', error);
            setLoading(false);
            setError("Error loading tables");
          }
        };
        
        getTables();
      }
    }, [isOpen]);
    
    // Get table categories
    const tableCategories = useMemo(() => {
      if (!allTables.length) return ['All'];
      
      // Extract unique table types (e.g., "T", "OD")
      const categories = ['All', ...new Set(allTables.map(table => table.Name))];
      return categories;
    }, [allTables]);
    
    // Filter tables based on search query and active category
    const filteredTables = useMemo(() => {
      return allTables.filter(table => {
        // Filter by search query
        const matchesSearch = searchQuery === '' || 
          table.TableNo.toString().includes(searchQuery) ||
          (table.Name + table.TableNo).toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by category
        const matchesCategory = activeCategory === 'All' || table.Name === activeCategory;
        
        return matchesSearch && matchesCategory;
      });
    }, [allTables, searchQuery, activeCategory]);
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredTables.length / tablesPerPage);
    const currentTables = useMemo(() => {
      const indexOfLastTable = currentPage * tablesPerPage;
      const indexOfFirstTable = indexOfLastTable - tablesPerPage;
      return filteredTables.slice(indexOfFirstTable, indexOfLastTable);
    }, [filteredTables, currentPage, tablesPerPage]);
    
    // Reset page when filter changes
    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, activeCategory]);
    
    // Handle table selection - now opens confirmation modal
    const handleTableSelect = useCallback((table) => {
      // Don't allow selecting current table
      if (cart.tableCode === table.Code) return;
      
      setSelectedTable(table);
      setTableToConfirm(table);
      setShowConfirmModal(true);
    }, [cart.tableCode]);
    
    // Handle search change
    const handleSearch = useCallback((query) => {
      setSearchQuery(query);
    }, []);
    
    // Handle category change
    const handleCategoryChange = useCallback((category) => {
      setActiveCategory(category);
    }, []);
    
    // Handle page change
    const handlePageChange = useCallback((pageNumber) => {
      setCurrentPage(pageNumber);
    }, []);
    
    // Handle cancel confirmation
    const handleCancelConfirm = useCallback(() => {
      setShowConfirmModal(false);
      setTableToConfirm(null);
    }, []);

    const toast = useToast()
    
    // Handle confirmation
    const handleConfirm = useCallback(() => {
      if (!tableToConfirm) return;
      
      setConfirming(true);
      setError(null);
      
      const selectTable = async () => {
        try {
          console.log(cart);
          console.log(tableToConfirm);
          const response = await postRequest(`kot/change-table/`,{orderCode:cart.cartId,tableCode:tableToConfirm.Code})
          if(response.success){

            //   onTableSelected(tableToConfirm);
            dispatch({
                      type:SET_TABLE_DATA,payload:{tableCode:tableToConfirm.Code,tokenNo:cart.tokenNo,tableNo:tableToConfirm.TableNo}
                    })
            toast.success("Table changed")
              setShowConfirmModal(false);
              onClose();
          }else{
            setError("An error occurred while selecting the table");
          setShowConfirmModal(false);
          }
        } catch (err) {
          console.error('Error selecting table:', err);
          setError("An error occurred while selecting the table");
          setShowConfirmModal(false);
        } finally {
          setConfirming(false);
        }
      };
      
      selectTable();
    }, [tableToConfirm, onTableSelected, onClose, cart]);
    
    // If modal is not open, don't render anything
    if (!isOpen) return null;
    
    return (
      <>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 dark:bg-black/70">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl w-full h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold dark:text-white">Select Table</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : (
              <>
                <div className="flex-none">
                  <CategoryTabs 
                    categories={tableCategories}
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryChange}
                  />
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 mb-2 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {currentTables.map((table) => (
                      <div key={table.Code} className="flex justify-center">
                        <TableButton
                          table={table}
                          isSelected={selectedTable?.Code === table.Code}
                          onClick={handleTableSelect}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {filteredTables.length === 0 && (
                    <div className="flex justify-center items-center h-32 text-gray-500 dark:text-gray-400">
                      No tables match your search criteria
                    </div>
                  )}
                </div>
                
                <div className="flex-none">
                  {totalPages > 1 && (
                    <TablePagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Confirmation Modal */}
        <ConfirmationModal 
          isOpen={showConfirmModal}
          table={tableToConfirm}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
          isLoading={confirming}
        />
      </>
    );
  };
  
  export default TableSelectionModal;