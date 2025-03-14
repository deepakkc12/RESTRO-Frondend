import AdminPanelHeader from "../../../components/Headers/AdminPanelHeader";
import TableLayout from "../../../components/Table/TableLayout";
import { getRequest } from "../../../services/apis/requests";
import React, { useEffect, useState } from "react";
import { convertDateFormat } from "../../../utils/helper";
import { ShieldPlus } from "lucide-react";
import NewCustomerModal from "./NewCustomerModal"; // Add this import

function CustomerManager() {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setendDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRowModal, setOpenNewRowModal] = useState(false);

    const onChangeDate = (startDate, endDate) => {
      setStartDate(startDate);
      setendDate(endDate);
    };
  
    const headers = [
      { key: "slNo", label: "Sl.No" },
      { key: "Name", label: "Name" },
      { key: "MobileNumber", label: "Mobile No" },
      { key: "LoginCode", label: "Created by" },
    ];

    const actions = [
      {
        label: "Privilege",
        icon: <ShieldPlus className="h-4 w-4" />,
        onClick: (row) => {
          setSelectedUser(row);
          setIsModalOpen(true);
        },
      }
    ];
  
    const getData = async () => {
      setLoading(true);
      const response = await getRequest(`ledgers/ordinary-customers/`);
      const formatedData = response.data.map(row => ({
        ...row,
        DOT: convertDateFormat(row.DOT)
      }));
      setData(formatedData);
      setLoading(false);
    };
  
    useEffect(() => {
      getData();
    }, [startDate, endDate]);
  
    return (
      <>
        <AdminPanelHeader />
        <div className="p-4 max-w-7xl mx-auto">
          <TableLayout
            loading={loading}
            pdf={false}
            excel={false}
            headers={headers}
            data={data}
            title="Customer Management"
            newRow
            onNewRow={() => setOpenNewRowModal(true)}
          />
        </div>
        <NewCustomerModal
          isOpen={newRowModal}
          onClose={() => setOpenNewRowModal(false)}
          onSuccess={() => {
            getData(); // Refresh the table after successful creation
          }}
        />
      </>
    );
  }
  
  export default CustomerManager;