import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import React, { useEffect, useState } from "react";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../utils/helper";

function TaxDetails({branchCode,onBack,branchName,start=null,end=null,onChangeDate}) {

  const [data, setData] = useState([]);

  const [startDate, setStartDate] = useState(start);
  const [endDate, setendDate] = useState(end);

  const [loading, setLoading] = useState(false);

  const onChangeDates = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
    onChangeDate(startDate, endDate)
  };
  
  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "InvoiceNo", label: "InvoiceNumber" },
    { key: "InvoiceDate", label: "InvoiceDate" },
    { key: "TotalTaxable", label: "TotalTaxable" },
    { key: "TotalTax", label: "TotalTax" },
    { key: "GrossAmount", label: "NetValue" },

  ];

  const getData = async () => {
    const today = new Date(); // Current date
    const weekAgo = new Date(today); // Clone the today date
    weekAgo.setDate(today.getDate() - 7);


    setLoading(true)
    const formated_startdate =startDate? formatDateToDDMMYYYY(startDate) : formatDateToDDMMYYYY(weekAgo)
    const formated_endDate =endDate? formatDateToDDMMYYYY(endDate) : formatDateToDDMMYYYY(today)
    const response = await getRequest(`ho/branch-tax-details/?startDate=${formated_startdate}&endDate=${formated_endDate}&branchCode=${branchCode}`);
    
    const formatedData = response.data.map(row=>({...row,InvoiceDate:convertDateFormat(row.InvoiceDate)}))
    
    setData(formatedData);

    setLoading(false)
  };


  useEffect(() => {
    getData();
  }, [startDate,endDate]);
  return (
    <div className="p-4">


      <TableLayout
      onBack = {onBack}
        loading={loading}
        datePickerOptions={{
          showDatePicker: true,
          pickerType: "range",
        }}
        startDate={start}
        endDate={end}
        onDateRangeChange={onChangeDates}
        headers={headers}
        data={data}
        title={`Tax details in ${branchName}`}
      />

    </div>
  );
}

export default TaxDetails;
