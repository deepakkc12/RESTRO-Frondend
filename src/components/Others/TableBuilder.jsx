import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getRequest, patchRequest, postRequest } from '../../services/apis/requests';

const TableLayoutBuilder = () => {
  const { kotType } = useParams();
  
  const [initialTablesData, setInitialTablesData] = useState([]);
  const [allTables,setAlltables] = useState([])
  const [selectedCells, setSelectedCells] = useState({});
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [nextTableNumber, setNextTableNumber] = useState(1);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTables = async () => {
    try {
      const response = await getRequest(`tables/layout/${kotType}/`);
      if (response.success) {
        // Store all initial data
        setInitialTablesData(response.data);

        // Dynamically calculate max rows and columns
        const maxRow = Math.max(...response.data.map(t => t.RowNo), 5);
        const maxCol = Math.max(...response.data.map(t => t.ColNo), 5);
        setRows(maxRow);
        setCols(maxCol);

        setAlltables(response.data)

        // Filter and map only tables with TableNo > 0
        const activeTables = response.data.filter(table => table.TableNo > 0);


        // Create initial tables mapping for active tables
        const initialTables = activeTables.reduce((acc, table) => {
          const cellId = `${table.RowNo}_${table.ColNo}`;
          acc[cellId] = {
            id: cellId,
            tableNo: table.TableNo,
            code:table.Code,
            row: table.RowNo,
            col: table.ColNo,
            isActive: true,
            isOccupied: false,
            code: table.Code,
            name: table.Name
          };
          return acc;
        }, {});

        setSelectedCells(initialTables);
        
        // Set next table number to be one more than the max existing table number
        const maxTableNo = Math.max(...activeTables.map(t => t.TableNo), 0);
        setNextTableNumber(maxTableNo + 1);
      }
    } catch (err) {
      setError('Failed to fetch tables: ' + err.message);
    }
  };

  useEffect(() => {
    getTables();
  }, [kotType]);

  const handleCellClick = (row, col) => {
    const cellId = `${row}_${col}`;
    
    // If the cell already has a table, select it
    if (selectedCells[cellId]) {
      setSelectedTable(cellId);
    } else {
      // Find an existing table with the same row and column
      const existingTableCode = allTables.find(
        t => t.RowNo === row && t.ColNo === col
      )?.Code;
  
      setSelectedCells(prev => ({
        ...prev,
        [cellId]: {
          id: cellId,
          code: existingTableCode || '', // Use existing code or empty string
          tableNo: nextTableNumber,
          row,
          col,
          isActive: true,
          isOccupied: false
        }
      }));
      
      setNextTableNumber(prev => prev + 1);
      setSelectedTable(cellId);
    }
  };

  const removeTable = async () => {
    if (!selectedTable) return;

    const tableToRemove = selectedCells[selectedTable];
    
    // Only call remove API if the table already has a TableNo and Code
    if (tableToRemove.tableNo > 0 && tableToRemove.code) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/remove-table/${tableToRemove.code}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to remove table');
        }
      } catch (err) {
        setError(err.message);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Remove the table from the local state
    setSelectedCells(prev => {
      const { [selectedTable]: removed, ...rest } = prev;
      return rest;
    });
    setSelectedTable(null);
  };

  const exportLayout = async () => {
    // Prepare data for API call
    const tableData = Object.values(selectedCells).map(table => ({
      table_code: table.code ,
      No: table.tableNo,
      RowNo: table.row,
      ColNo: table.col
    }));

    const body = {table_data: tableData}


    console.log(selectedCells)

    try {
      setIsLoading(true);
      const response = await postRequest('tables/update/',body );

      if(response.success){
          alert('Layout saved successfully!');
      }


    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustDimension = (setter, delta, currentValue) => {
    const newValue = currentValue + delta;
    if (newValue >= 5 && newValue <= 10) {
      setter(newValue);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 min-h-screen shadow-xl">
      {/* Error Handling */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Controls Section */}
      <div className="mb-8 space-y-6">
        {/* Dimension Controls */}
        <div className="flex flex-col space-y-2">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Layout Dimensions</h2>
          <div className="flex space-x-8">
            {/* Rows Control */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Rows:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => adjustDimension(setRows, -1, rows)}
                  className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-gray-700 dark:text-gray-200">{rows}</span>
                <button
                  onClick={() => adjustDimension(setRows, 1, rows)}
                  className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Columns Control */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Columns:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => adjustDimension(setCols, -1, cols)}
                  className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-gray-700 dark:text-gray-200">{cols}</span>
                <button
                  onClick={() => adjustDimension(setCols, 1, cols)}
                  className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        
        {/* Table Controls */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={removeTable}
              disabled={!selectedTable || isLoading}
              className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                selectedTable 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Table</span>
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total Tables: {Object.keys(selectedCells).length}
          </div>
          <button
            onClick={exportLayout}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-4 justify-center">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: cols }, (_, colIndex) => {
              const cellId = `${rowIndex + 1}_${colIndex + 1}`;
              const table = selectedCells[cellId];

              return (
                <div
                  key={colIndex}
                  onClick={() => handleCellClick(rowIndex + 1, colIndex + 1)}
                  className={`
                    w-24 h-24 rounded-lg cursor-pointer
                    flex items-center justify-center
                    transition-all duration-200
                    ${!table 
                      ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-blue-500 text-white'
                    }
                    ${selectedTable === cellId ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''}
                  `}
                >
                  {table && (
                    <div className="flex flex-col items-center">
                      <span className="font-bold">T{table.tableNo}</span>
                      <span className="text-xs mt-1">
                        {table.row},{table.col}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </div>
  );
};

export default TableLayoutBuilder;