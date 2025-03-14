import TableLayout from "../../../../../components/Table/TableLayout";
import { getRequest } from "../../../../../services/apis/requests";
import { convertDateFormat, formatDateToDDMMYYYY } from "../../../../../utils/helper";
import React, { useEffect, useState } from "react";
import MainLayout from "../../../Layout/Layout";
import { useNavigate } from "react-router-dom";

function BranchList() {
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
    { key: "Name", label: "Name", },
    // { key: "Count", label: "Count" },
    { key: "PhoneNo", label: "PhoneNo" },
   
  ];

  const getData = async () => {
    setLoading(true);


    // const data = { startDate, endDate };
    const response = await getRequest(
      `branch/list`
    );

    console.log(response)
    // const formatedData = response.data.map(row=>({...row,InvoiceDate:convertDateFormat(row.InvoiceDate)}))

    setData(response.data);
    // setData(response.data);
    setLoading(false);
  };

  const navigate = useNavigate()

  useEffect(() => {
    getData();
  }, [startDate, endDate]);
  
  return (
   <MainLayout>
     <div className="p-4">
      <TableLayout
        loading={loading}
        datePickerOptions={{
          showDatePicker: true,
          pickerType: "range",
        }}
        onRowClick={(row)=>{navigate("/ho/branch/details",{state:{branch:row}})}}
        onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Branches"
      />
    </div>
   </MainLayout>
  );
}

export default BranchList;
