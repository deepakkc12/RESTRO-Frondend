import React, { useState, useCallback, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart,createNewCart, fetchCart, setTableData } from '../../../redux/cart/actions';

import { useToast } from '../../../hooks/UseToast';
import TokenOrderModal from './TokeOrder';
import TableLayoutHeader from '../../../components/Headers/TableLayoutHeader';
import { getRequest } from '../../../services/apis/requests';
import OrderSelectionModal from './TableOrder';

const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  PARTIALLY_OCCUPIED: 'partially_occupied'
};

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
    border: 'border-rose-500',
    background: 'bg-amber-500',
    hover: 'hover:bg-amber-50'
  }
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const Button = ({ children, isActive = true, isSelected = false, className = '', onClick }) => {
  const baseStyles = `
    px-4 py-2 rounded-lg transition-all duration-200
    ${isActive 
      ? 'hover:shadow-lg dark:hover:shadow-black/30' 
      : 'opacity-40 cursor-not-allowed'}
  `;
  
  return (
    <button 
      className={`
        ${baseStyles}
        ${className}
        ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-900 scale-105' : 'scale-100'}
        ${isActive ? '' : 'dark:opacity-30'}
      `}
      onClick={onClick}
      disabled={!isActive}
    >
      {children}
    </button>
  );
};

const TableButton = ({ table, isSelected, openModal, openCustomerModal }) => {
  const toast = useToast()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!table) return null;

  const getTableStatus = () => {
    if(table.CNT >= 1){
      return TABLE_STATUS.PARTIALLY_OCCUPIED
    } else if(table.CNT == 0){
      return TABLE_STATUS.AVAILABLE
    }
  }

  const status = getTableStatus(table);
  const styles = TABLE_STYLES[status];

  const handleClick = () => {
    openModal(table)
  }

  const handleOrderSelect = (orderCode) => {
    dispatch(fetchCart(orderCode));
    navigate(`/menu/${table.Code}`);
    setIsModalOpen(false);
  }

  return (
    <Button
      isActive={true}
      isSelected={isSelected}
      onClick={handleClick}
      className={`
        relative aspect-square
        w-full max-w-[120px]
        h-full max-h-[120px]
        sm:max-w-[100px] sm:max-h-[100px]
        xs:max-w-[80px] xs:max-h-[80px]
        flex flex-col items-center justify-center gap-2
        border-2 ${styles.border}
        ${table.Name =="T"?"bg-white":"bg-yellow-500"}
        ${table.Name =="T"? "text-blue-800 text-xs":"text-white text-xs hover:text-blue-800" }
        ${styles.hover}
      `}
    >
      <div className={`font-extrabold `}>
        <span className={``}>
        {table.Name=="T"?table.Name:"OD"}
          </span>{table.TableNo}
      </div>
    </Button>
  );
};

const TableGrid = ({ kotTypeCode ,isTokenBased}) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [isChairModalOpen,setChairModal] = useState(false)

  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getTables = async () => {
    try {
      const response = await getRequest(`tables/layout/${4}/`);
      // console.log(response)
      // const data = await response.json();
      if (response.success) {
        const activeTables = response.data
          .filter(table => table.Name !== "Not Active")
          .sort((a, b) => a.TableNo - b.TableNo);
        setTables(activeTables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to fetch tables');
    }
  };

  useEffect(() => {
    getTables();

  }, [kotTypeCode]);

  const location = useLocation()
  const { refCode } = location.state;

  const handleTableClick = useCallback((table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  }, []);

  const handleOrderSelect = (orderCode, chairNo) => {
    dispatch(fetchCart(orderCode));
    // dispatch(setTableData(selectedTable.Code, chairNo, selectedTable.TableNo));
    navigate(`/menu/${selectedTable.Code}`);
    setIsModalOpen(false);
  };

  const handeleTableSelection = (table)=>{

    setSelectedTable(table);
    if(isTokenBased){

      setIsModalOpen(true);
    }else{
      if(table.CNT > 0){
        setChairModal(true)
      }else{
        dispatch(createNewCart(table.Code, 1, table.Code, toast, null, refCode));
        navigate("/menu")
      }
    }
  }

  return (
    <div className="md:p-2">
      <div className="bg-gray-50 min-h-screen rounded-xl p-6 shadow-xl">
        <div className="grid grid-cols-10  md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-15 gap-2 md:gap-4">
          {tables.map((table) => (
            <div key={table.Code} className="flex justify-center">
              <TableButton
              openModal={(table)=>{handeleTableSelection(table)}}
                table={table}
                isSelected={selectedTable?.Code === table.Code}
                onClick={handleTableClick}
              />
            </div>
          ))}
        </div>

        {isModalOpen && selectedTable && (
          <TokenOrderModal
            
            tableNo={selectedTable.TableNo}
            noOfChairs={selectedTable.NoOfChair || 4}
            tableCode={selectedTable.Code}
            onOrderSelect={handleOrderSelect}
            onClose={() => setIsModalOpen(false)}
          />
        )}
         {isChairModalOpen && selectedTable && (
          <OrderSelectionModal
          orderCount = {selectedTable.CNT}
            tableNo={selectedTable.TableNo}
            noOfChairs={selectedTable.NoOfChair || 4}
            tableCode={selectedTable.Code}
            onOrderSelect={handleOrderSelect}
            onClose={() => setChairModal(false)}
          />
        )}
      </div>
    </div>
  );
};

const TableList = () => {

  // const user = useSelector(state => state.auth.user);
  const type = new URLSearchParams(window.location.search).get('type');

  // if (!user?.employee?.kotTypeCode) {
  //   return <Navigate to="/menu" />;
  // }
  const { isBillPrintFirst, isTokenBased, loading, error } = useSelector(
    (state) => state.settings
  );






  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <TableLayoutHeader />
      <TableGrid kotTypeCode={4} type={type} isTokenBased = {isTokenBased} />
    </div>
  );
};

export default TableList;