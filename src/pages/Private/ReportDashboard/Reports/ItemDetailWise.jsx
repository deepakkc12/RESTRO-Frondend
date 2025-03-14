import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import React, { useEffect, useState } from "react";
import { formatDateToDDMMYYYY } from "../../../../utils/helper";

function ItemDetailWiseReport({skuCode,onBack,skuName}) {

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
    { key: "SubSkuName", label: "Item" },
    // { key: "Rate", label: "Rate" },
    { key: "Qty", label: "Qty" },
    { key: "TotalAmount", label: "TotalAmount" },
  ];

  const getData = async () => {
    const today = new Date(); // Current date
    const weekAgo = new Date(today); // Clone the today date
    weekAgo.setDate(today.getDate() - 7);


    setLoading(true)
    const formated_startdate =startDate? formatDateToDDMMYYYY(startDate) : formatDateToDDMMYYYY(weekAgo)
    const formated_endDate =endDate? formatDateToDDMMYYYY(endDate) : formatDateToDDMMYYYY(today)
    const response = await getRequest(`reports/item-detail-wise/?startDate=${formated_startdate}&endDate=${formated_endDate}&skuCode=${skuCode}`);
    setData(response.data);
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
        onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title={`Item Wise Report for ${skuName}`}
      />
    </div>
  );
}

export default ItemDetailWiseReport;
