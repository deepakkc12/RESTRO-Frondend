import TableLayout from "../../../../../components/Table/TableLayout";
import { getRequest, postRequest } from "../../../../../services/apis/requests";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../../utils/helper";
import React, { useEffect, useState } from "react";
import MainLayout from "../../../Layout/Layout";
import { useNavigate } from "react-router-dom";
import PriceApprovalModal from "./PriceApprovalModal";
import { useToast } from "../../../../../hooks/UseToast";

function PendingPriceReqs() {
  const [originalData, setOriginalData] = useState([]); // Store original data
  const [filteredData, setFilteredData] = useState([]); // Store filtered data
  const [startDate, setStartDate] = useState(null);
  const [endDate, setendDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [branches, setBranches] = useState([]);
  const [activeFilters, setActiveFilters] = useState({}); // Track active filters

  const toast = useToast();

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "DOT", label: "Requested On" },
    { key: "BranchName", label: "Branch" },
    { key: "LoginCode", label: "Requested by" },
    { key: "SubSkuName", label: "Item" },
    { key: "Price1", label: "Requested Price 1" },
    { key: "Price2", label: "Requested Price 2" },
    { key: "Price3", label: "Requested Price 3" },
  ];

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };

  const handleApprove = async (approvedData) => {
    try {
      setLoading(true);
      const body = {
        price1: approvedData.approvedPrice1,
        price2: approvedData.approvedPrice2,
        price3: approvedData.approvedPrice3,
        requestCode: approvedData.Code
      };

      const response = await postRequest("ho/price-revision/approve/", body);

      if (response.success) {
        toast.success("New Prices Approved");
        await getData(); // Refresh the data after approval
      }
    } catch (error) {
      console.error('Error approving price revision:', error);
      toast.error("Failed to approve prices");
    } finally {
      setLoading(false);
    }
  };


  const [selectedRows,setSelectedRows] =  useState([])

  const getData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`ho/price-revision/?status=pending`);
      
      // Set branches for filters
      const branches = response.data
      ? Array.from(
          new Map(
            response.data.map(row => [row.BranchCode, { name: row.BranchName, id: row.BranchCode }])
          ).values()
        )
      : [];
      setBranches(branches);

      // Store original data
      setOriginalData(response.data);
      // Initialize filtered data with all data
      setFilteredData(response.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [startDate, endDate]);

  const filters = {
    Branch: branches
  };

  // Apply filters to original data
  const applyFilters = (filters) => {
    let newData = [...originalData]; // Start with original data
    setSelectedRows([])

    if (filters?.Branch?.id) {
      newData = newData.filter(row => row.BranchCode === filters.Branch.id);
    }

    // Add more filter conditions here if needed

    return newData;
  };

  const handleFilterChange = (newFilters) => {

    setActiveFilters(newFilters); 
    
    // Apply filters and update filtered data
    const newFilteredData = applyFilters(newFilters);
    setFilteredData(newFilteredData);

    // Optional: Show feedback about filter application
    if (newFilters?.Branch) {
      // toast.success(`Filtered by branch: ${newFilters.Branch.name}`);
    }
  };


  

  const onBulkApprove =async ()=>{

    const selectedreqCodes = selectedRows.map(row=>(row.Code))
    setLoading(true)
    const response = await postRequest(`ho/price-revision/bulk-approve/`,{requestCodes:selectedreqCodes})
    if (response.success){

      toast.success("Approved selected requests")

      getData()

      setSelectedRows([])
    }

    setLoading(false)
    // setLoading(true)
  }

  return (
    <MainLayout>
      <div className="p-4">
        <TableLayout
        onSelectionAction={onBulkApprove}
        selectedRows={selectedRows}
        selectionActionTitle="Approve"
        setSelectedRows={setSelectedRows}
          enableSelection
          filters={filters}
          loading={loading}
          onFilterChange={handleFilterChange}
          onRowClick={(row) => {
            setSelectedRow(row);
            setIsModalOpen(true);
          }}
          on
          headers={headers}
          data={filteredData} // Use filtered data for display
          title="Pending Price Revision Requests"
        />
      </div>

      <PriceApprovalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRow(null);
        }}
        loading={loading}
        selectedRow={selectedRow}
        onApprove={handleApprove}
      />
    </MainLayout>
  );
}

export default PendingPriceReqs;