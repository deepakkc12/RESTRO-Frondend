import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../utils/helper";
import React, { useEffect, useState } from "react";
import MainLayout from "../../Layout/Layout";
import TaxDetails from "./BranchTaxDetails";

function HoTaxSummary({selectBranch,startDate,endDate,setStartDate,setendDate}) {
  const [data, setData] = useState([]);


  const [loading, setLoading] = useState(false);

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "BranchName", label: "Branch", onColumnClick: (value, row) => {
        console.log(row);
        selectBranch(row)
      }, },
    { key: "TotalTaxable", label: "Tottal taxables" },
    { key: "TotalTax", label: "Total Tax" },
    { key: "GrossAmount", label: "Net Sales" },
  ];

  const getData = async () => {
    setLoading(true);

    const today = new Date(); // Current date
    const weekAgo = new Date(today); // Clone the today date
    weekAgo.setDate(today.getDate() - 7);

    const formated_startdate = startDate
      ? formatDateToDDMMYYYY(startDate)
      : formatDateToDDMMYYYY(weekAgo);
    const formated_endDate = endDate
      ? formatDateToDDMMYYYY(endDate)
      : formatDateToDDMMYYYY(today);

    // const data = { startDate, endDate };
    const response = await getRequest(
      `ho/tax-summery/?startDate=${formated_startdate}&endDate=${formated_endDate}`
    );

    console.log(response)
    const formatedData = response.data
    setData(formatedData);
    // setData(response.data);
    setLoading(false);
    
  };

  useEffect(() => {
    getData();
  }, [startDate, endDate]);
  return (

    <div className="p-4">
      <TableLayout
      // selectedRows = {[1]}
      // onBack
      // filters={{Branch:[]}}
        loading={loading}
        datePickerOptions={{
            showDatePicker: true,
            pickerType: "range",
        }}
        onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Tax Summary"
        />
    </div>
  );
}

const TaxSummeryReport = () => {

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
      <TaxDetails
      onChangeDate={onChangeDate}
        branchCode={selectedBranch?.BranchCode}
        branchName={selectedBranch?.BranchName}
        start={startDate}
        end={endDate}
        onBack={() => {
          setSelectedBranch(null);
        }}
      />
    ) : (
      <HoTaxSummary startDate={startDate} endDate={endDate} setStartDate={setStartDate} setendDate={setendDate}  selectBranch={(Branch)=>{setSelectedBranch(Branch)}}/>
    )};
    </MainLayout>
  };
  
  export default TaxSummeryReport;
  