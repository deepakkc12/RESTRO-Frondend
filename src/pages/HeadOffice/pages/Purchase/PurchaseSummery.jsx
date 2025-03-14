import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import { formatDateToDDMMYYYY } from "../../../../utils/helper";
import React, { useEffect, useState } from "react";
import PurchaseDetails from "./PurchaseDetails";
import MainLayout from "../../Layout/Layout";

function PurchaseSummery({selectBranch,startDate,endDate,setStartDate,setendDate}) {
  const [data, setData] = useState([]);



  const [loading, setLoading] = useState(false);

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };



  const headers = [
    { key: "slNo", label: "Sl.No" },
    {
      key: "Name",
      label: "Branch",
      onColumnClick: (value, row) => {
        console.log(row);
        selectBranch(row)
      },
    },
    // { key: "Rate", label: "Rate" },
    { key: "TaxableAmount", label: "TaxableAmount" },
    { key: "Tax", label: "Tax" },
    { key: "Discount", label: "Discount" },
    { key: "PurchaseValue", label: "PurchaseValue" },
    { key: "Credit", label: "Credit" },
    { key: "Cash", label: "Cash" },
    // { key: "PurchaseValue", label: "PurchaseValue" },



    // { key: "TotalAmount", label: "TotalAmount" },
  ];

  const getData = async () => {
    const today = new Date(); // Current date
    const weekAgo = new Date(today); // Clone the today date
    weekAgo.setDate(today.getDate() - 7);

    setLoading(true);
    const formated_startdate = startDate
      ? formatDateToDDMMYYYY(startDate)
      : formatDateToDDMMYYYY(weekAgo);
    const formated_endDate = endDate
      ? formatDateToDDMMYYYY(endDate)
      : formatDateToDDMMYYYY(today);
    const response = await getRequest(
      `ho/purchase-sales-summary/?startDate=${formated_startdate}&endDate=${formated_endDate}`
    );
    setData(response.data);
    setLoading(false);
  };


  
  useEffect(() => {
    getData();
  }, [startDate, endDate]);
  return (
    <div className="p-4">
      <TableLayout
        loading={loading}
        datePickerOptions={{
          showDatePicker: true,
          pickerType: "range",
        }}
        onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Purchase Summary"
      />
    </div>
  );
}

const PurchaseSummeryReport = () => {

  const [selectedBranch, setSelectedBranch] = useState(null);

  const [endDate, setendDate] = useState(new Date());
  const [startDate, setStartDate] = useState(endDate);

  useEffect(()=>{
    const weekAgo = new Date(startDate); // Clone the startDate date
    weekAgo.setDate(startDate.getDate() - 7);

    setStartDate(weekAgo)
  },[])

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };


  return <MainLayout>
 { selectedBranch ? (
    <PurchaseDetails
    onChangeDate={onChangeDate}
      branchCode={selectedBranch?.Code}
      branchName={selectedBranch?.Name}
      start={startDate}
      end={endDate}
      onBack={() => {
        setSelectedBranch(null);
      }}
    />
  ) : (
    <PurchaseSummery startDate={startDate} endDate={endDate} setStartDate={setStartDate} setendDate={setendDate}  selectBranch={(Branch)=>{setSelectedBranch(Branch)}}/>
  )};
  </MainLayout>
};

export default PurchaseSummeryReport;
