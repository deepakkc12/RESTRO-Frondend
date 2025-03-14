import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../utils/helper";
import React, { useEffect, useState } from "react";
import MainLayout from "../../Layout/Layout";

function HoSalesSummary() {
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
    { key: "TotalSalesAmount", label: "Total Sales" },
    { key: "Cash", label: "Cash" },
    { key: "Card", label: "Card" },
    { key: "BankQR", label: "BankQR" },
    { key: "TouchNgo", label: "TouchNgo" },
    { key: "Credit", label: "Credit" },
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
      `ho/sales-summery/?startDate=${formated_startdate}&endDate=${formated_endDate}`
    );

    console.log(response)
    const formatedData = response.data.map(row=>({...row,InvoiceDate:convertDateFormat(row.InvoiceDate)}))
    setData(formatedData);
    // setData(response.data);
    setLoading(false);
    
  };

  useEffect(() => {
    getData();
  }, [startDate, endDate]);
  return (
    <MainLayout>

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
        title="Sales Summary"
        />
    </div>
        </MainLayout>
  );
}

export default HoSalesSummary;
