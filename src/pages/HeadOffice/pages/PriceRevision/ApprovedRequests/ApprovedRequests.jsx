import TableLayout from "../../../../../components/Table/TableLayout";
import { getRequest } from "../../../../../services/apis/requests";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../../utils/helper";
import React, { useEffect, useState } from "react";
import MainLayout from "../../../Layout/Layout";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../../hooks/UseToast";
// import NewVendorModal from "./NerwVendorModal";

function ApprovedPriceReqs() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setendDate] = useState(null);

  const [loading, setLoading] = useState(false);

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };

  const headers = [
    
    { key: "slNo", label: "Sl.No" },

    { key: "BranchName", label: "Branch" },

    { key: "SubSkuName", label: "Item" },

    { key: "DOT", label: "Requested On" },

    { key: "LoginCode", label: "Requested by" },

    { key: "updatedLoginCode", label: "Updated By" },

    { key: "UpdatedDOT", label: "Updated On" },

    { key: "Price1", label: "Requested Price 1" },

    { key: "ModifiedPrice1", label: "Updated Price 1" },

    { key: "Price2", label: "Price 2" },

    { key: "ModifiedPrice2", label: "Updated Price 2" },

    { key: "Price3", label: "Price 3" },

    { key: "ModifiedPrice3", label: "Updated Price 3" },

  ];

  const [selectedRows,setSelectedRows]= useState([])

  const onSaveNEw = (newRow)=>{
    setData([newRow,...data])
  }
  const [branches,setBranches]= useState([])

  const getData = async () => {
    setLoading(true);

    const response = await getRequest(
      `ho/price-revision/?status=approved`
    );


    setData(response.data);
    const branches = response.data
    ? Array.from(
        new Map(
          response.data.map(row => [row.BranchCode, { name: row.BranchName, id: row.BranchCode }])
        ).values()
      )
    : [];
  
    setBranches(branches)

    console.log(branches)

    setLoading(false);
  };

//   const [isVendorModalOpen,setIsvendorModalOpen] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    getData();
  }, [startDate, endDate]);
  

  const filters = {
    Branch: branches
  };

const toast = useToast()

const handleFilterChange = (newFilters) => {

  console.log('Selected filters:', newFilters);

    toast.success('Selected filters:', newFilters[0]?.name);
    // You can filter your data here based on the selected filters
    // or make an API call with the filter parameters
  };
  
  return (
    
   <MainLayout>
     <div className="p-4">
      <TableLayout
        loading={loading}
        // newRow = {true}
        filters={filters}
        onFilterChange={handleFilterChange}

        // enableSelection
        // setSelectedRows={setSelectedRows}
        // selectedRows={selectedRows}

        // onNewRow={()=>{setIsvendorModalOpen(true)}}
        // datePickerOptions={{
        //   showDatePicker: true,
        //   pickerType: "range",
        // }}
        // onRowClick={(row)=>{navigate("/ho/branch/details",{state:{branch:row}})}}
        // onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Approved Price Revisions"
      />
    </div>

    {/* <NewVendorModal onSave={onSaveNEw} isOpen={isVendorModalOpen} onClose={()=>{setIsvendorModalOpen(false)}}/> */}
   </MainLayout>
  );
}

export default ApprovedPriceReqs;
