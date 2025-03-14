import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import { formatDateToDDMMYYYY } from "../../../../utils/helper";
import DailySalesChart from "../Graphs/DailySalesGraph";
import React, { useEffect, useState } from "react";

function DailySales() {
  const [data, setData] = useState([]);

  const [loading,setLoading] = useState(false)

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "InvoiceNo", label: "InvoiceNo",   },
    { key: "Details", label: "Details" },
    // { key: "TableName", label: "Table"},
    // { key: "Details", label: "Details" },
    { key: "TotalBillAmount", label: "TotalBillAmount" },
    { key: "Cash", label: "Cash" },
    { key: "Digitel/Bank", label: "Digital/Bank" },
    { key: "CreditAmount", label: "credit" },
  ];

  const [date, setDate] = useState(new Date());

  const getData = async () => {
    setLoading(true)
    const formated_date = date? formatDateToDDMMYYYY(date):formatDateToDDMMYYYY(new Date)

    console.log(formated_date)
    const response = await getRequest(`reports/daily-sales-summery/?date=${formated_date}`);

    const formatedData = response.data.map(data=>{
      return {
        ...data,CreditAmount:parseFloat(data.CreditAmount).toFixed(2)
      }
    })
    setData(formatedData);
    setLoading(false)
  };

  const onChangeDate = (date) => {
    setDate(date);
  };

  useEffect(() => {
    getData();
    console.log(date)
  }, [date]);
  return (
    <div className="p-4">
      {/* <DailySalesChart/> */}

      <TableLayout
      loading={loading}
        datePickerOptions={{
          showDatePicker: true,
          pickerType: "single", 
        }}
        onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Daily Sales"
      />

    </div>
  );
}

export default DailySales;
