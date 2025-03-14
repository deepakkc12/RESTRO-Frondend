import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import { formatDateToDDMMYYYY } from "../../../../utils/helper";
import DailySalesChart from "../Graphs/DailySalesGraph";
import React, { useEffect, useState } from "react";

function DailyTableWiseSales() {
  const [data, setData] = useState([]);

  const [loading,setLoading] = useState(false)

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "TableNo", label: "Table",  },
    { key: "NOB", label: "NOB",  },



    { key: "TotalItems", label: "Total Items" },
    // { key: "TableName", label: "Table", onColumnClick: (value, row) => {
      // window.location.href = `mailto:${value}`;
    // }},
    // { key: "Details", label: "Details" },
    { key: "TotalAmount", label: "Total Amount" },

  ];

  const [date, setDate] = useState(new Date());

  const getData = async () => {
    setLoading(true)
    const formated_date = date? formatDateToDDMMYYYY(date):formatDateToDDMMYYYY(new Date)

    console.log(formated_date)
    const response = await getRequest(`reports/table-wise-summery/?date=${formated_date}`);

    const formatedData = response.data.map(row=>({
        ...row,TableNo:`T-${row.TableNo}`
    }))
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
        title="Daily Table Wise Summary"
      />

    </div>
  );
}

export default DailyTableWiseSales;
