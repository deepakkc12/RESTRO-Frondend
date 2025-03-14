import TableLayout from "../../../../components/Table/TableLayout";
import { useToast } from "../../../../hooks/UseToast";
import { getRequest, postRequest } from "../../../../services/apis/requests";
import { convertDateFormat } from "../../../../utils/helper";
import BranchAssignModal from "./Actions/BranchAssignModal";
import PrivilegeModal from "./Actions/PrivilegeModal";
import NewUserModal from "./NewUserModal";
import { Building2, Edit, ShieldPlus, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";

function UserManager({branchCode}) {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setendDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [isBranchAssignModalOpen,setBranchAssignModal] = useState(false)
  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };

  const toast = useToast();

  const [newRowodal, setOpenNewRowModal] = useState(false);

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "DOT", label: "Created Date" },
    { key: "LoginCode", label: "Login code" },
    { key: "Username", label: "User name" },
    { key: "LicenceCode", label: "Licence code" },
  ];

  const actions = [
    {
      label: "Privilege",
      icon: <ShieldPlus className="h-4 w-4" />,
      onClick: (row) => {
        setSelectedUser(row);
        setIsModalOpen(true);
      },
    },
    {
      label: "Assign branches",
      icon: <Building2 className="h-4 w-4" />,
      onClick: (row) => {
        setSelectedUser(row);
        setBranchAssignModal(true);
      },
    },
  ];

  const getData = async () => {
    setLoading(true);
    const response = await getRequest(`user/branch-users/?branch=${branchCode}`,{branchCode:branchCode});
    const formatedData = response.data.map((row) => ({
      ...row,
      DOT: convertDateFormat(row.DOT),
    }));
    setData(formatedData);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [startDate, endDate]);

  return (
    <>
      {/* <AdminPanelHeader /> */}
      <div className="mx-auto rounded-2xl  bg-gray-100">
        <TableLayout
          actions={actions}
          loading={loading}
          pdf={false}
          excel={false}
          headers={headers}
          data={data}
          title="User Management"
          newRow
          onNewRow={() => setOpenNewRowModal(true)}
        />
      </div>

      <PrivilegeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        userId={selectedUser?.Code}
        userName={selectedUser?.Username}
      />
      <BranchAssignModal
        isOpen={isBranchAssignModalOpen}
        onClose={() => {
          setBranchAssignModal(false);
          setSelectedUser(null);
        }}
        userId={selectedUser?.Code}
        userName={selectedUser?.Username}
      />

      <NewUserModal
      branchCode={branchCode}
        isOpen={newRowodal}
        onClose={() => setOpenNewRowModal(false)}
        onSuccess={getData}
      />
    </>
  );
}

export default UserManager;
