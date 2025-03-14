// import AdminPanelHeader from "../../../components/Headers/AdminPanelHeader";
// import TableLayout from "../../../components/Table/TableLayout";
// import { getRequest } from "../../../services/apis/requests";
// import React, { useEffect, useState } from "react";
// import { convertDateFormat } from "../../../utils/helper";
// import { Edit, ShieldPlus, Trash } from "lucide-react";





// function ItemManagement() {

//     const [data, setData] = useState([]);
//     const [startDate, setStartDate] = useState(null);
//     const [endDate, setendDate] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
  
//     const onChangeDate = (startDate, endDate) => {
//       setStartDate(startDate);
//       setendDate(endDate);
//     };
  
//     const headers = [
//       { key: "slNo", label: "Sl.No" },
//       { key: "DOT", label: "Created Date" },
//       { key: "LoginCode", label: "Login code" },
//       { key: "Username", label: "User name" },
//       { key: "LicenceCode", label: "Licence code" },
//     ];
  
//     const actions = [
//       {
//         label: "Privilege",
//         icon: <ShieldPlus className="h-4 w-4" />,
//         onClick: (row) => {
//           setSelectedUser(row);
//           setIsModalOpen(true);
//         },
//       }
//     ];
  
//     const getData = async () => {
//       setLoading(true);
//       const response = await getRequest(`user/branch-users/`);
//       const formatedData = response.data.map(row => ({
//         ...row,
//         DOT: convertDateFormat(row.DOT)
//       }));
//       setData(formatedData);
//       setLoading(false);
//     };
  
//     useEffect(() => {
//       getData();
//     }, [startDate, endDate]);
  
//     return (
//       <>
//         <AdminPanelHeader />
//         <div className="p-4 max-w-7xl mx-auto">
//           <TableLayout
//             actions={actions}
//             loading={loading}
//             pdf={false}
//             excel={false}
//             headers={headers}
//             data={data}
//             title="User Management"
//           />
//         </div>
//         <PrivilegeModal
//           isOpen={isModalOpen}
//           onClose={() => {
//             setIsModalOpen(false);
//             setSelectedUser(null);
//           }}
//           userId={selectedUser?.Code}
//           userName={selectedUser?.Username}
//         />
//       </>
//     );
//   }
  
//   export default ItemManagement;