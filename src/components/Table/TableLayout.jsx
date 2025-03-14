import DatePicker from "../../Features/others/DatePicker";
import Table from "./Table";
import jsPDF from "jspdf";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  ArrowLeft,
  Plus,
  Filter,
  Loader,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "jspdf-autotable";
import FilterDropdown from "./FilterDropdown";

const TableLayout = ({

  externalSearchEnable = false,
  onRowClick,
  headers,
  title = "Enterprise Reports",
  data,
  onBack,
  actions = [],
  onDateRangeChange,
  loading = false,
  datePickerOptions = {
    showDatePicker: false,
    pickerType: "range", // 'range' | 'single' | 'none'
  },
  filters = {},
  onFilterChange = () => {},
  excel = true,
  pdf = true,
  startDate = null,
  endDate = null,
  enableRowClick = false,
  newRow = false,
  enableSelection = false,
  selectionActionTitle = "Action",
  onSelectionChange = () => {},
  onSelectionAction = () => {},

  onNewRow = () => {},
  selectedRows = [],
  setSelectedRows = ()=>{},

  filterTitle = "Filter",

  searchType = "internal", // 'internal' | 'external'
  onExternalSearch = () => {}, // Callback function for external search
  searchPlaceholder = "Search in all columns...",
  onExternalSearchChange = () => {}, // Callback function for external search
  filtrationAlignement = "between", // 'centre' | 'start' | 'end' | 'between'
}) => {
  // Existing state
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState(
    datePickerOptions.pickerType !== "none" ? getInitialDates() : null
  );
  const [singleDate, setSingleDate] = useState(
    datePickerOptions.pickerType === "single" ? getInitialDates() : null
  );

  // Calculate initial dates based on picker type
  function getInitialDates() {
    const today = endDate || new Date();

    if (datePickerOptions.pickerType === "single") {
      return today;
    }

    if (datePickerOptions.pickerType === "range") {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      const weakAgo = startDate || oneWeekAgo;
      return [weakAgo, today];
    }

    return null;
  }


  const handleSearchClick = useCallback(() => {
    if (searchType === "external") {
      onExternalSearch(searchTerm);
    }
    // onExternalSearchChange('');
    // setSearchTerm("");
  }, [searchType, searchTerm, onExternalSearch]);


  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && searchType === "external") {
      onExternalSearch(searchTerm);
    }
  }, [searchType, searchTerm, onExternalSearch]);
  // Handle filter changes

  
  const handleFilterChange = useCallback((newFilters) => {
    
    onFilterChange(newFilters);
  }, [onFilterChange]);

  // Export functions remain the same
  const exportToExcel = () => {
    const updatedData = filteredData.map((item, index) => {
      const updatedItem = { ...item };
      if (headers.some((header) => header.key === "slNo" || header.key === "Code")) {
        updatedItem["slNo"] = index + 1;
      }
      return updatedItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(updatedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const date = new Date().toISOString().slice(0, 10);
    const filename = `${title.replace(/\s+/g, "_")}_${date}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(title, 20, 20);

    const tableData = filteredData.map((item, index) => {
      const updatedItem = { ...item };
      if (headers.some((header) => header.key === "slNo")) {
        updatedItem["slNo"] = index + 1;
      }
      return headers.map((header) => updatedItem[header.key]?.toString() || "");
    });

    doc.autoTable({
      head: [headers.map((header) => header.label)],
      body: tableData,
      startY: 30,
      margin: { top: 25 },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    const date = new Date().toISOString().slice(0, 10);
    const filename = `${title.replace(/\s+/g, "_")}_${date}.pdf`;

    doc.save(filename);
  };

  // Handle date range change with API callback
  const handleDateRangeChange = (update) => {
    if (datePickerOptions.pickerType === "range") {
      setDateRange(update);
      if (update[0] && update[1] && onDateRangeChange) {
        onDateRangeChange(update[0], update[1]);
      }
    } else if (datePickerOptions.pickerType === "single") {
      setSingleDate(update);
      if (update && onDateRangeChange) {
        onDateRangeChange(update, null);
      }
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (searchType === "external") return data || []; // For external search, use the data as is
    if (!data) return [];
    
    return searchTerm.trim() === ""
      ? data
      : data.filter((item) =>
          Object.values(item).some((val) =>
            val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
  }, [data, searchTerm, searchType]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

 const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );
  }, [filteredData, currentPage, recordsPerPage]);

  // Generate page numbers with ellipsis
  const generatePageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pageNumbers;
  };

  const pageNumbers = useMemo(() => generatePageNumbers(), [currentPage, totalPages]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Only perform internal filtering if searchType is internal
    if (searchType === "internal") {
      
      setCurrentPage(1);
    }
    else if (searchType === "external") {
      onExternalSearchChange(value);}


  }, [searchType]);

  const handleRecordsPerPageChange = useCallback((value) => {
    setRecordsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing records per page
  }, []);
  
  const renderDatePicker = () => {
    if (!datePickerOptions.showDatePicker || datePickerOptions.pickerType === "none") {
      return null;
    }


    return (
      <div className="flex items-center gap-4">
        <DatePicker
          type={datePickerOptions.pickerType}
          value={datePickerOptions.pickerType === "single" ? singleDate : dateRange}
          onChange={handleDateRangeChange}
          placeholder={datePickerOptions.pickerType === "range" ? "Select date range" : "Select date"}
        />
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4">
      <div className="space-y-6">
        {/* Title and Export Buttons */}
        <div className="flex items-center justify-between">
        {onBack && (
      <button
        onClick={onBack}
        className="flex items-center text-blue-800 hover:text-blue-900 font-semibold transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>Go back</span>
      </button>
    )}
          <div className="flex gap-2 items-center">
            <h2 className="text-2xl font-bold text-primary-600">{title}</h2>
          </div>

          <div className="flex gap-2">
            {excel && (
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 
                  bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </button>
            )}
            {pdf && (
              <button
                onClick={exportToPDF}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 
                  bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to PDF
              </button>
            )}
            {newRow && (
              <button
                onClick={onNewRow}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 
                  bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </button>
            )}
          </div>
        </div>

        {/* Filters, Search, and Back Button */}
       

        <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-${filtrationAlignement} gap-4`}>
  {/* Left Section: Back Button, Date Picker, and Filters */}
  <div className="flex flex-wrap items-center gap-4">

    {renderDatePicker()}
    {Object.keys(filters).length > 0 && (
      <FilterDropdown title={filterTitle} filters={filters} onFilterChange={handleFilterChange} />
    )}
  </div>

  {/* Right Section: Selection Button, Search Box, and Search Button */}
  <div className="flex flex-wrap items-center gap-3">
    {selectedRows?.length > 0 && (
      <button
        onClick={() => onSelectionAction(selectedRows)}
        disabled={loading}
        className={`px-3 py-2 text-sm rounded-md transition-colors ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading
          ? "Processing..."
          : `${selectionActionTitle} (${selectedRows.length}/${data.length})`}
      </button>
    )}

    {/* Search Box and Button */}
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {searchType === "external" && (
       <button
       onClick={handleSearchClick}
       disabled={loading || !externalSearchEnable}
       className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition 
         ${loading || !externalSearchEnable 
           ? "bg-gray-400 cursor-not-allowed" 
           : "bg-blue-600 hover:bg-blue-700 text-white"} 
         focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
     >
       {loading ? (
         <>
           <Loader className="h-4 w-4 mr-2 animate-spin" /> Searching...
         </>
       ) : (
         <>
           <Search className="h-4 w-4 mr-2" /> Search
         </>
       )}
     </button>
      )}
    </div>
  </div>
</div>


        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table
          selectedRows={selectedRows}
          selectionActionTitle = {selectionActionTitle}
          setSelectedRows={setSelectedRows}
            onSelectionChange={onSelectionChange}
            onSelectionAction={onSelectionAction}
            enableSelection={enableSelection}
            enableRowClick={enableRowClick}
            onRowClick={onRowClick}
            headers={headers}
            fullData={data}
            data={paginatedData}
            actions={actions}
            loading={loading}
          />
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            Showing {Math.min((currentPage - 1) * recordsPerPage + 1, filteredData.length)} to{" "}
            {Math.min(currentPage * recordsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => setRecordsPerPage(value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                    ${
                      recordsPerPage === value
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 
                bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>

            <div className="flex gap-1">
              {generatePageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  onClick={() => pageNumber !== "..." && setCurrentPage(Number(pageNumber))}
                  disabled={pageNumber === "..."}
                  className={`min-w-[32px] px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                    ${
                      pageNumber === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 
                bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableLayout;