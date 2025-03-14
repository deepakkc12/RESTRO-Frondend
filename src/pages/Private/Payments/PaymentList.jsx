import HomeHeader from "../../../components/Headers/HomeHeader";
import TableLayout from "../../../components/Table/TableLayout";
import { getRequest, patchRequest } from "../../../services/apis/requests";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../utils/helper";

import { Edit } from "lucide-react";
import React, { useEffect, useState } from "react";
import PaymentModal from "./NewPayment";

function PaymentList() {

  const [data, setData] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setendDate] = useState(null);

  const [loading, setLoading] = useState(false);

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };
  const [selectedRow, setSelectedRow] = useState(null);

  const [newPaymentodal, setnewPaymentodal] = useState(false);

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "DOT", label: "Date" },
    { key: "Amount", label: "Amount" },
    { key: "DrLedgerName", label: "TransactionAccount" },
    { key: "CrLedgerName", label: "PaymentAccount" },
    { key: "Remarks", label: "Remarks" },
  ];


 const getData = async () => {
    const today = new Date(); // Current date
    const weekAgo = new Date(today); // Clone the today date
    weekAgo.setDate(today.getDate() - 7);

    setLoading(true);
    const formated_startdate =startDate? formatDateToDDMMYYYY(startDate) : formatDateToDDMMYYYY(weekAgo)
    const formated_endDate =endDate? formatDateToDDMMYYYY(endDate) : formatDateToDDMMYYYY(today)

    console.log(formated_endDate,formated_startdate)
    const response = await getRequest(`payment/list/?startDate=${formated_startdate}&endDate=${formated_endDate}`);

    const formatedData = response.data.map(row=>({...row,DOT:convertDateFormat(row.DOT)}))
    setData(formatedData);
    setLoading(false);
  };

  const handleSubmit = (newRow) => {
    console.log("Form submitted:", newRow);
    // Handle form submission
    getData()
    // setData([...data, newRow]);
  };

  const onRowClick = (row) => {
    setSelectedRow(row);
    setEditModal(true);
    console.log(row);
  };


//   const UpdateInward = async (updatedRow) => {
//     setData((prev) =>
//       prev.map((row) => (row.Code == updatedRow.Code ? { ...updatedRow } : row))
//     );
//   };



  useEffect(() => {
    getData();
    // console.log(date);
  }, [startDate,endDate]);
  return (
    <div className="">
      <HomeHeader/>
   <div className="max-w-5xl mx-auto mt-10">
       {/* <InwardListChart/> */}

       <TableLayout
        // onRowClick={onRowClick}
        loading={loading}
        newRow
        onNewRow={() => setnewPaymentodal(true)}
        datePickerOptions={{
          showDatePicker: true,
          pickerType: "range",
        }}
        onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Payment List"
      />

      {newPaymentodal && (
        <PaymentModal
          open={newPaymentodal}
          onClose={() => setnewPaymentodal(false)}
          onSubmit={handleSubmit}
        //   isEditable={false}
        />
      )}
   </div>
    </div>
  );
}

export default PaymentList;
