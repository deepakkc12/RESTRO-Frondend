import HomeHeader from "../../../components/Headers/HomeHeader";
import TableLayout from "../../../components/Table/TableLayout";
import { getRequest, patchRequest } from "../../../services/apis/requests";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../utils/helper";
import { Edit } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import RecieptModal from "./NewRecieptList";

function CustomerOutwardList() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setendDate] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState(null);
  const [newPaymentodal, setnewPaymentodal] = useState(false);

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };

  const [selectedRow, setSelectedRow] = useState(null);

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "CustomerName", label: "Name"},
    { key: "TotalBilledAmount", label: "Total Payable" },
    { key: "TotalPaidAmount", label: "Total Paid" },
    { key: "OutstandingAmount", label: "Balance Amount" },
  ];

  const getData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`ledgers/credit-customers/`);
      const formatedData = response.data;
      setData(formatedData);
      applyFilters(formatedData, appliedFilter);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (newRow) => {
    console.log("Form submitted:", newRow);
    getData();
  };

  const onRowClick = (row) => {
    setSelectedCustomer(row);
    setnewPaymentodal(true);
  };

  const filters = {
    Status: [
      { name: 'Pending', id: 0 },
      { name: 'Zero Paid', id: 1 },
      { name: 'Fully Paid', id: 2 },
    ]
  };

  // Function to apply filters to the data
  const applyFilters = (dataToFilter, filterOptions) => {
    if (!dataToFilter) {
      setFilteredData([]);
      return;
    }

    let result = [...dataToFilter];

    // Apply status filters
    if (filterOptions && filterOptions.Status) {
      const statusFilter = filterOptions.Status;

      console.log(statusFilter)
      
      // Check if we have a valid status filter
      if (statusFilter && statusFilter.id !== undefined) {
        result = result.filter(item => {
          // Filter logic based on the selected status id
          if (statusFilter.id === 0) {
            return parseFloat(item.OutstandingAmount) !=0;
          }
          if (statusFilter.id === 1) { // Zero Paid
            return item.TotalPaidAmount == 0 ;
          }
          if (statusFilter.id === 2) { // Fully Paid
            return item.OutstandingAmount ==0
          }
          return true;
        });
      }
    }

    setFilteredData(result);
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    setAppliedFilter(filters);
    applyFilters(data, filters, startDate, endDate);
  };

  useEffect(() => {
    getData();
  }, []);

  // Apply filters when filter changes
  useEffect(() => {
    applyFilters(data, appliedFilter);
  }, [appliedFilter]);

  return (
    <div className="">
      <HomeHeader />
      <div className="max-w-5xl mx-auto mt-10">
        <TableLayout
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          onRowClick={onRowClick}
          enableRowClick
        
          onDateRangeChange={onChangeDate}
          headers={headers}
          data={filteredData.length > 0 ? filteredData : data}
          title="Customer Outward List"
        />
        
        {newPaymentodal && (
          <RecieptModal
            selectedLedger={selectedCustomer}
            open={newPaymentodal}
            onClose={() => setnewPaymentodal(false)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default CustomerOutwardList;