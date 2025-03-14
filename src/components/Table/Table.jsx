import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader,
  MoreVertical,
  Check,
} from "lucide-react";
import React, { useState, useEffect } from "react";

const Table = ({
  headers = [],
  data = [],
  fullData = [],
  loading = false,
  actions = [],
  onRowClick = () => {},
  enableRowClick = false,
  enableSelection = false,
  onSelectionChange = () => {},
  selectionActionTitle = "Action",
  onSelectionAction = () => {},
  selectedRows = [],
  setSelectedRows =()=>{}
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  const formatValue = (value) => {
    if (value == null || value == "") return "-"; // Covers both null & undefined
    if (typeof value === "boolean") return value.toString(); // Avoid treating booleans as numbers
  
    const num = Number(value);
    if (!isNaN(num)) {
      return Number.isInteger(num) ? num : num.toFixed(2); // Keep integers as they are
    }
  
    return value; // Return original value if it's not a number
  };
  

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  useEffect(() => {
    onSelectionChange(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const requestSort = (key) => {
    const direction =
      sortConfig.key === key
        ? sortConfig.direction === "ascending"
          ? "descending"
          : "ascending"
        : "ascending";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-1 h-4 w-4" />;
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  const isActionEnabled = (row, action) => {
    return typeof action.disabled === "function"
      ? !action.disabled(row)
      : !action.disabled;
  };

  const handleColumnClick = (header, value, row) => {
    if (header.onColumnClick) {
      header.onColumnClick(value, row);
    }
  };

  const getColumnStyle = (header, value, row) => {
    const baseStyle = `${header.style && header.style(row)} p-4 border`;
    if (header.onColumnClick) {
      return `text-blue-600 hover:text-blue-800 hover:underline ${baseStyle} cursor-pointer font-medium transition-colors`;
    }
    return baseStyle + " text-gray-800";
  };

  const handleSelectAll = () => {
    if (selectedRows?.length === sortedData?.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedData);
    }
  };

  const handleSelectRow = (row) => {
    setSelectedRows((prev) => {
      const isSelected = prev?.some((selectedRow) => selectedRow === row);
      if (isSelected) {
        return prev?.filter((selectedRow) => selectedRow !== row);
      }
      return [...prev, row];
    });
  };

  const getSerialNumber = (index) => {
    const dataIndex = fullData.findIndex(item => 
      JSON.stringify(item) === JSON.stringify(sortedData[index])
    );
    return dataIndex + 1;
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdownIndex(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="rounded-lg bg-card text-card-foreground">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b bg-gray-50/50">
            <tr>
              {enableSelection && (
                <th className="h-12 px-4 text-left">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleSelectAll}
                      className={`h-5 w-5 rounded border ${
                        selectedRows?.length === sortedData?.length && fullData.length>0
                          ? "bg-blue-600 text-white"
                          : "bg-white"
                      } flex  items-center justify-center transition-colors`}
                    >
                      {selectedRows?.length === sortedData.length  && fullData.length>0 &&(
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  
                  </div>
                </th>
              )}
              {headers.map((header) => (
                <th
                  key={header.key}
                  className="h-12 px-4 text-left font-medium text-muted-foreground cursor-pointer hover:bg-gray-50/70 transition-colors"
                  onClick={() => requestSort(header.key)}
                >
                  <div className="flex items-center justify-start space-x-2">
                    <span className="text-[15px] py-3 text-green-700 font-bold">
                      {header.label}
                    </span>
                    {getSortIcon(header.key)}
                    {header.onColumnClick && (
                      <span className="ml-2 text-xs text-blue-600">
                        (clickable)
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="h-12 px-4 text-center text-blue-600 font-medium text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {!loading && (
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  onClick={() => {
                    onRowClick(row);
                  }}
                  key={index}
                  className={`border transition-colors ${
                    enableRowClick
                      ? "cursor-pointer hover:bg-gray-100/50"
                      : "hover:bg-gray-50/50"
                  }`}
                >
                  {enableSelection && (
                    <td className="p-4 border">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRow(row);
                          }}
                          className={`h-5 w-5 rounded border ${
                            selectedRows?.includes(row)
                              ? "bg-blue-600 text-white"
                              : "bg-white"
                          } flex items-center justify-center transition-colors`}
                        >
                          {selectedRows?.includes(row) && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  )}
                  {headers.map((header) => (
                    <td
                      key={header.key}
                      className={getColumnStyle(header, row[header.key], row)}
                      onClick={() =>
                        handleColumnClick(header, row[header.key], row)
                      }
                    >
                      {!header.isStatusField ? (
                        header.key === "slNo" ? (
                          <div className="flex items-center justify-start gap-4">
                            <span className="font-medium text-start">
                              {getSerialNumber(index)}
                            </span>
                          </div>
                        ) : (
                          <div className="font-medium text-start">
                            {formatValue(row[header.key])}
                          </div>
                        )
                      ) : (
                        <div className="font-medium text-start">
                          {row[header.key] == 1 ? "Yes" : "No"}
                        </div>
                      )}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="p-4 border relative">
                      <button
                        className="flex mx-auto h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownIndex(
                            openDropdownIndex === index ? null : index
                          );
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openDropdownIndex === index && (
                        <div
                          className={`absolute ${
                            sortedData.length === 1
                              ? "right-0"
                              : index === sortedData.length - 1
                              ? "bottom-4 right-0"
                              : "right-0"
                          }  w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}
                        >
                          <div className="py-1" role="menu">
                            {actions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                className={`${
                                  isActionEnabled(row, action)
                                    ? "text-gray-700 hover:bg-gray-100"
                                    : "text-gray-400 cursor-not-allowed"
                                } group flex w-full items-center px-4 py-2 text-sm`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isActionEnabled(row, action)) {
                                    action.onClick(row);
                                    setOpenDropdownIndex(null);
                                  }
                                }}
                                disabled={!isActionEnabled(row, action)}
                              >
                                <span className="mr-2">{action.icon}</span>
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          )}

          {!loading && sortedData.length === 0 && (
            <tbody>
              <tr>
                <td
                  colSpan={
                    headers.length + (actions.length ? 1 : 0) + (enableSelection ? 1 : 0)
                  }
                >
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    No results found
                  </div>
                </td>
              </tr>
            </tbody>
          )}

          {loading && (
            <tbody>
              <tr>
                <td
                  colSpan={
                    headers.length + (actions.length ? 1 : 0) + (enableSelection ? 1 : 0)
                  }
                >
                  <div className="flex h-[200px] items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-purple-900" />
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default Table;