import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import React, { useEffect, useState } from "react";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../utils/helper";

function BearerWiseReport() {
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
    { key: "DOT", label: "Date" },
    { key: "InvoiceNo", label: "InvoiceNo" },
    { key: "BearerName", label: "BearerName" },
    { key: "TotalBillAmount", label: "TotalBillAmount" },
    { key: "TableNo", label: "TableNo" },
    // { key: "Digitel/Bank", label: "Digitel/Bank" }
  ];

  const getData = async () => {
    const today = new Date(); // Current date
const weekAgo = new Date(today); // Clone the today date
weekAgo.setDate(today.getDate() - 7);

    setLoading(true);
    const formated_startdate =startDate? formatDateToDDMMYYYY(startDate) : formatDateToDDMMYYYY(weekAgo)
    const formated_endDate =endDate? formatDateToDDMMYYYY(endDate) : formatDateToDDMMYYYY(today)

    console.log(formated_endDate,formated_startdate)
    const response = await getRequest(`reports/bearer-wise/?startDate=${formated_startdate}&endDate=${formated_endDate}`);

    const formatedData = response.data.map(row=>({...row,DOT:convertDateFormat(row.DOT)}))
    setData(formatedData);
    setLoading(false);
  };
  useEffect(() => {
    getData();
  }, [startDate,endDate]);
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
        title="Bearer Wise Report"
      />
    </div>
  );
}

export default BearerWiseReport;
