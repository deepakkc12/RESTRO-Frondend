import TableLayout from "../../../../components/Table/TableLayout";
import { getRequest } from "../../../../services/apis/requests";

import React, { useEffect, useState } from "react";
import MainLayout from "../../Layout/Layout";
import { useNavigate } from "react-router-dom";
import NewVendorModal from "./NerwVendorModal";
import { Pen } from "lucide-react";
import UpdateVendorModal from "./UpdateVendor";

function VendorList() {
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
    { key: "Name", label: "Name" },

    { key: "MobileNumber", label: "MobileNumber" },
    { key: "PhoneNumber", label: "PhoneNumber" },

    { key: "TaxNumber", label: "TaxNumber" },
  ];

  const onSaveNEw = (newRow) => {
    setData([newRow, ...data]);
  };
  const getData = async () => {
    setLoading(true);

    // const data = { startDate, endDate };
    const response = await getRequest(`vendors/list/`);

    // console.log(response)

    setData(response.data);
    // setData(response.data);
    setLoading(false);
  };

  const [selectedUser, setSelectedUser] = useState(null);

  const [isUpdateVendorModal, setUpdateModal] = useState(false);

  const actions = [
    {
      label: "Update",
      icon: <Pen className="h-4 w-4" />,
      onClick: (row) => {
        const selectedRow = {
          code: row.Code,
          name: row.Name,
          mobileNo: row.MobileNumber,
          phoneNo: row.PhoneNumber,
          taxNo: row.TaxNumber,
          adress: row.Address,
        };
        setSelectedUser(selectedRow);
        setUpdateModal(true);
      },
    },
  ];

  const [isVendorModalOpen, setIsvendorModalOpen] = useState(false);

  const navigate = useNavigate();

  const onUpdate = (updatedRow) => {
    setData((prev) =>
      prev.map((row) => (row.Code == updatedRow.Code ? { ...updatedRow } : row))
    );
  };

  useEffect(() => {
    getData();
  }, [startDate, endDate]);

  return (
    <MainLayout>
      <div className="p-4">
        <TableLayout
          loading={loading}
          newRow={true}
          actions={actions}
          onNewRow={() => {
            setIsvendorModalOpen(true);
          }}
          headers={headers}
          data={data}
          title="Vendors"
        />
      </div>

      <NewVendorModal
        onSave={onSaveNEw}
        isOpen={isVendorModalOpen}
        onClose={() => {
          setIsvendorModalOpen(false);
        }}
      />
      <UpdateVendorModal
        onUpdate={onUpdate}
        isOpen={isUpdateVendorModal}
        onClose={() => {
          setUpdateModal(false);
        }}
        vendor={selectedUser}
      />
    </MainLayout>
  );
}

export default VendorList;
