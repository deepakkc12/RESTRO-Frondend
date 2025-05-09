import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";
import React, { useEffect, useState } from "react";
import MainLayout from "../../Layout/Layout";
import { useNavigate } from "react-router-dom";
import CreateItemModal from "./NewItemModal";

function V2ItemList() {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "DOT", label: "Created On" },
    { key: "SkuName", label: "Name" },
    { key: "GroupName", label: "Group" },
    { key: "BrandName", label: "Brand" },
    { key: "MaxPrice", label: "MaxPrice", },
    { key: "SalesPrice", label: "SalesPrice" },
    { key: "LoginCode", label: "LoginCode" },    
  ];


  const onSaveNEw = (newRow)=>{
    getData()
  }
  const getData = async () => {
    setLoading(true);
    const response = await getRequest(
      `v2/items/`
    );
    setData(response.data);
    setLoading(false);
  };

  const [isnewItemModal,setIsnewItemModal] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    getData();
  }, []);
  
  return (
    
   <MainLayout>
     <div className="p-4">
      <TableLayout
        loading={loading}
        newRow = {true}

        onNewRow={()=>{setIsnewItemModal(true)}}
        // datePickerOptions={{
        //   showDatePicker: true,
        //   pickerType: "range",
        // }}
        // onRowClick={(row)=>{navigate("/ho/branch/details",{state:{branch:row}})}}
        // onDateRangeChange={onChangeDate}
        headers={headers}
        data={data}
        title="Items"
      />
    </div>

    <CreateItemModal onSuccess={onSaveNEw} isOpen={isnewItemModal} onClose={()=>{setIsnewItemModal(false)}}/>
   </MainLayout>
  );
}

export default V2ItemList;