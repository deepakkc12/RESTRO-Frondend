import React, { useState, useCallback, useMemo, useEffect } from 'react';
import TableLayoutHeader from '../../../components/Headers/TableLayoutHeader';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Xeno from "../../../assets/images/xenologo.jpg"
import { getRequest } from '../../../services/apis/requests';
import { clearCart, createNewCart, fetchCart, setTableData } from '../../../redux/cart/actions';
import OrderSelectionModal from './TableOrder';
import { updateKotType } from '../../../redux/Authentication/action';
import { useToast } from '../../../hooks/UseToast';
import TokenOrderModal from './TokeOrder';

// Basic Modal Component
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  const TABLE_STATUS = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    PARTIALLY_OCCUPIED: 'partially_occupied'
  };
  
  const TABLE_STYLES = {
    [TABLE_STATUS.AVAILABLE]: {
      border: 'border-emerald-500 dark:border-emerald-400',
      background: 'bg-emerald-500 dark:bg-emerald-400',
      hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
    },
    [TABLE_STATUS.OCCUPIED]: {
      border: 'border-rose-500 dark:border-rose-400',
      background: 'bg-rose-500 dark:bg-rose-400',
      hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/30'
    },
    [TABLE_STATUS.PARTIALLY_OCCUPIED]: {
      border: 'border-amber-500 dark:border-amber-400',
      background: 'bg-amber-500 dark:bg-amber-400',
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30'
    }
  };

  const SeatButton = ({ number, selected, available, onClick }) => (
    <button
      onClick={() => onClick(number)}
      disabled={!available}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
        transition-all duration-200
        ${selected 
          ? 'bg-blue-500 text-white scale-105 shadow-lg' 
          : available 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600' 
            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      {number}
    </button>
  );
  
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
  
  const TableContent = ({ table, isSelected, openModal, openCustomerModal }) => {

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
      // if(table.CNT <= 0){
      //   dispatch(clearCart())

      //   // dispatch(updateKotType())
      //   dispatch(createNewCart(table.Code,1,table.TableNo,toast))
      //   navigate(`/menu`)
      // }else{
      // openModal(table)

      // }
      openModal(table)

      // // else if(table.CNT == 1){
      // //   dispatch(fetchCart(table.OrderCode))
      // //   navigate(`/menu/${table.Code}`)
      // // }
      // else {
      //   openModal(table);  // Pass the entire table object
      // }
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
          relative h-full w-full
          flex flex-col items-center justify-center gap-2
          border-2 ${styles.border}
          bg-white dark:bg-gray-800
          ${styles.hover}
        `}
      >
        <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
          T{table.TableNo}
        </div>
        {/* <div className={`
          lg:text-xs text-[10px] lg:px-3 lg:py-1 px-1 rounded-full
          ${styles.background}
          text-white dark:text-gray-900
          font-medium
        `}>
          {table.CNT > 1 ? `${table.CNT} Orders` : ''}
        </div> */}
         {/* {isModalOpen && (
        <OrderSelectionModal
        tableCode={table.Code}
        onOrderSelect={handleOrderSelect}
          onClose={() => setIsModalOpen(false)}
        />
      )} */}
      </Button>
    );
  };
  
  
  const TableGrid = ({kotTypeCode,type}) => {
    const [tables, setTables] = useState({});
    const [selectedTable, setSelectedTable] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [orders, setOrders] = useState([]);

    const getTables =async ()=>{
        const response = await getRequest(`tables/layout/${kotTypeCode}/`)
        if (response.success){
      const initialTables = {};
      const activeTableData = response.data
      activeTableData
      .filter(table => table.TableNo > 0)
      .forEach(table => {
        const key = `${table.RowNo}_${table.ColNo}`;
        initialTables[key] = {
          ...table,
          occupiedBy: [],
          NoOfChair: 4  // Default chair count, adjust as needed
        };
      });
    setTables(initialTables);
        }
    }


    const handleOrderSelect = (orderCode,chairNo) => {
      dispatch(fetchCart(orderCode));
      dispatch(setTableData(selectedTable.Code,chairNo,selectedTable.TableNo))
      navigate(`/menu/${selectedTable.Code}`);
      console.log(orderCode)
      setIsModalOpen(false);
    }

    // Initialize tables on component mount
    useEffect(() => {

        getTables()
 
      // Filter and add only tables with TableNo > 0

    }, []);

    const fetchTableOrders = async (tableCode) => {
      try {
        const response = await getRequest(`orders/table/${tableCode}/`);
        if (response.success) {
          const formattedOrders = response.data.map(order => ({
            orderCode: order.OrderCode,
            persons: order.persons || 1,
            orderTime: order.CreatedDate
          }));
          setOrders(formattedOrders);
          setShowCustomerModal(true);
        }
      } catch (error) {
        console.error("Error fetching table orders:", error);
      }
    }
    
  const openCustomerModal = (tableCode) => {
    fetchTableOrders(tableCode);
  }

  const navigate = useNavigate();
const dispatch = useDispatch()

  // const handleOrderSelection = (order) => {
  //   // Dispatch action to fetch cart for selected order
  //   dispatch(fetchCart(order.orderCode));
  //   navigate(`/menu/${table.Code}`);
  // }

    const gridDimensions = useMemo(() => {
      const dimensions = {
        minRow: Infinity,
        maxRow: -Infinity,
        minCol: Infinity,
        maxCol: -Infinity
      };
  
      Object.values(tables).forEach(table => {
        dimensions.minRow = Math.min(dimensions.minRow, table.RowNo);
        dimensions.maxRow = Math.max(dimensions.maxRow, table.RowNo);
        dimensions.minCol = Math.min(dimensions.minCol, table.ColNo);
        dimensions.maxCol = Math.max(dimensions.maxCol, table.ColNo);
      });

      return dimensions;
    }, [tables]);
  
    const handleTableClick = useCallback((tableCode) => {
      const table = Object.values(tables).find(t => t.Code === tableCode);
      setSelectedTable(table);
      
      if (table.occupiedBy?.length > 0) {
        setShowCustomerModal(true);
      } else {
        setShowNewCustomerModal(true);
      }
    }, [tables]);
  
    const handleCustomerSelection = useCallback((customer) => {
      console.log('Selected customer:', customer);
      setShowCustomerModal(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, []);
  
    const handleNewCustomer = useCallback((customerData) => {
      if (!selectedTable) return;
      
      const newCustomer = {
        id: Date.now(),
        name: customerData.customerName,
        persons: customerData.numPersons,
        arrivalTime: customerData.arrivalTime
      };
      
      setTables(prev => {
        const tableKey = `${selectedTable.RowNo}_${selectedTable.ColNo}`;
        return {
          ...prev,
          [tableKey]: {
            ...prev[tableKey],
            occupiedBy: [...(prev[tableKey].occupiedBy || []), newCustomer]
          }
        };
      });
      
      setShowNewCustomerModal(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, [selectedTable]);
  
    const renderMatrix = useCallback(() => {
      const matrix = [];
      const { minRow, maxRow, minCol, maxCol } = gridDimensions;
  
      for (let row = minRow; row <= maxRow; row++) {
        const currentRow = [];
        for (let col = minCol; col <= maxCol; col++) {
          const id = `${row}_${col}`;
          currentRow.push(
            <div className="md:h-12 md:w-12 lg:h-20 lg:w-20 h-10 w-10 flex items-center justify-center" key={id}>
              {tables[id] ? (
                <TableContent
                openModal={(table) => {
                  setSelectedTable(table);
                  setIsModalOpen(true);
                }}
                table={tables[id]}
                isSelected={selectedTable?.Code === tables[id].Code}
                onToggle={handleTableClick}
              />
              ) : (
                <div className="h-full border-dashed border-b border-gray-700 dark:border-gray-100 w-full border-transparent"></div>
              )}
            </div>
          );
        }
        matrix.push(currentRow);
      }
  
      return matrix;
    }, [gridDimensions, tables, selectedTable, handleTableClick]);
  

    console.log(selectedTable)
    return (
      <div className="p-2">
        <div className="bg-gray-50 min-h-screen overflow-x-auto dark:bg-gray-800 rounded-xl p-8 shadow-xl dark:shadow-black/20">
          <div className="grid gap-6">
            {renderMatrix().map((row, index) => (
              <div key={index} className="flex flex-wrap justify-center gap-6">
                {row}
              </div>
            ))}
            <div className='mt-40 flex justify-end'>
              <img src={Xeno} className=' h-12'/>
            </div>
          </div>
  
          {lastUpdated && (
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated}
            </div>
          )}
  
          {selectedTable?.CNT>1&&<Modal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
        >
         
        </Modal>}
  
          <Modal
            isOpen={showNewCustomerModal}
            onClose={() => setShowNewCustomerModal(false)}
          >
            {/* <NewCustomerForm
              table={selectedTable}
              onSubmit={handleNewCustomer}
              onClose={() => setShowNewCustomerModal(false)}
            /> */}
          </Modal>
          {/* {isModalOpen && selectedTable && (
          <OrderSelectionModal 
          tableNo={selectedTable.TableNo}
          noOfChairs={selectedTable.NoOfChair}
            tableCode={selectedTable.Code}
            onOrderSelect={handleOrderSelect}
            onClose={() => setIsModalOpen(false)}
          />
        )} */}

{isModalOpen && selectedTable && (
          <TokenOrderModal 
          tableNo={selectedTable.TableNo}
          noOfChairs={selectedTable.NoOfChair}
            tableCode={selectedTable.Code}
            onOrderSelect={handleOrderSelect}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        </div>
      </div>
    );
  };
const TableLayout = () => {
    const user = useSelector(state=>state.auth.user);

    const [searchParams] = useSearchParams();

    // Retrieve the "type" parameter
    const type = searchParams.get('type');

    // if( user.employee.kotTypeCode <3 ){
    //     return(
    //         <Navigate to={'/menu'}/>
    //     )
    // }
    console.log(user)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <TableLayoutHeader/>
        <TableGrid type={type}  kotTypeCode={user.employee.kotTypeCode}/>
      </div>
    );
  };

  export default TableLayout;