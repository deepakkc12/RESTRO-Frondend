import HomeHeader from "../../../components/Headers/HomeHeader";
import TableLayout from "../../../components/Table/TableLayout";
import { useToast } from "../../../hooks/UseToast";
import { getRequest, patchRequest } from "../../../services/apis/requests";
import { formatDateToDDMMYYYY } from "../../../utils/helper";
import EditInwardDetail from "./EditInward";
import InvoiceFormModal from "./NewInward";
import { Edit } from "lucide-react";
import React, { act, useEffect, useState } from "react";

function InwardList() {
  const [data, setData] = useState([]);

  const [ogData, setOgData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);

  const [EditModal, setEditModal] = useState(false);

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "InvoiceDate", label: "Invoice Date" },
    { key: "InvoiceNumber", label: "Invoice Number" },
    // { key: "TableName", label: "Table"},
    // { key: "Details", label: "Details" },
    { key: "VendorName", label: "Vendor" },
    { key: "TaxableAmount", label: "TaxableAmount" },

    { key: "Tax", label: "Tax" },

    { key: "Charges", label: "Charges" },
    { key: "Discount", label: "Discount" },
    { key: "PayableAmount", label: "Payable Amount" },

    { key: "Cash", label: "Cash" },
    { key: "Credit", label: "Credit" },
    { key: "DueDate", label: "DueDate" },

    {
      key: "Completed",
      label: "Account Posted",
      isStatusField: true,
      style: (row) => {
        console.log(row);
        if (row.Completed == 0) {
          return "bg-red-50 text-red-400";
        } else {
          return "bg-green-50 text-green-400";
        }
      },
    },
    {
      key: "PaymentSettled",
      label: "Payment Settled",
      isStatusField: true,

      style: (row) => {
        if (row.PaymentSettled == 0) {
          return "bg-red-50 text-red-400";
        } else {
          return "bg-green-50 text-green-400";
        }
      },
    },
    {
      key: "SubmitToAudit",
      label: "Submited to HO",
      isStatusField: true,

      style: (row) => {
        if (row.SubmitToAudit == 0) return "bg-red-50 text-red-400";
        else {
          return "bg-green-50 text-green-400";
        }
      },
    },
  ];

  const onStatusUpdate = (status, code) => {
    setData((prev) =>
      prev.map((row) => (row.Code === code ? { ...row, [status]: 1 } : row))
    );
  };

  const [startDate, setStartDate] = useState(null);
  const [endDate, setendDate] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({ Vendors: [] });

  const [enableSearchButton, setEnableSearchButton] = useState(false);

  const [seachTerm, setSearhcTerm] = useState("");

  const [activeFilter, setActiveFilter] = useState({});

  const getVendors = async () => {
    const response = await getRequest("vendors/list/");

    const vendorfilters = response.data.map((data) => ({
      id: data.Code,
      name: data.Name,
    }));
    setFilters({ ...filters, Vendors: vendorfilters });

    setVendors(response.data);
  };

  const getData = async () => {
    setLoading(true);
    const today = new Date(); // Current date
    const weekAgo = new Date(today); // Clone the today date
    weekAgo.setDate(today.getDate() - 7);

    const formated_startdate = startDate
      ? formatDateToDDMMYYYY(startDate)
      : formatDateToDDMMYYYY(weekAgo);
    const formated_endDate = endDate
      ? formatDateToDDMMYYYY(endDate)
      : formatDateToDDMMYYYY(today);

    // console.log(formated_date);
    const response = await getRequest(
      `inward/list/?startDate=${formated_startdate}&endDate=${formated_endDate}&invNo=${seachTerm}&vendor=${activeFilter?.Vendors?.id}`
    );

    const formatedData = response.data.map((data) => {
      return {
        ...data,
      };
    });
    setData(formatedData);
    setLoading(false);
    setEnableSearchButton(false)
  };

  const toast = useToast();
  const handleSubmit = (newRow) => {
    console.log("Form submitted:", newRow);
    // Handle form submission
    // setData([...data, newRow]);

    // toast.success("Invoice Saved")
    getData();
  };

  const onRowClick = (row) => {
    setSelectedRow(row);
    setEditModal(true);
    console.log(row);
  };

  const onChangeDate = (startDate, endDate) => {
    setStartDate(startDate);
    setendDate(endDate);
  };

  const UpdateInward = async (updatedRow) => {
    setData((prev) =>
      prev.map((row) => (row.Code == updatedRow.Code ? { ...updatedRow } : row))
    );
  };

  const onSuccessSave = (newRow) => {};
  //   const actions = [
  //     {
  //       label: "Privilege",
  //       icon: <Edit className="h-4 w-4" />,
  //       onClick: (row) => {
  //         setSelectedUser(row);
  //         setIsModalOpen(true);
  //       },
  //     },

  //   ];

  const handleFIlterChange = (newFilters) => {
    setActiveFilter(newFilters);
  };

  useEffect(() => {
    if (activeFilter?.Vendors?.name || seachTerm || startDate || endDate) {
      setEnableSearchButton(true);
    } else {
      setEnableSearchButton(false);
    }
  }, [activeFilter, seachTerm, startDate, endDate]);
  

  useEffect(() => {
    getVendors();
  }, []);

  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="">
      <HomeHeader />
      <div className="p-16 mx-auto mt-10">
        {/* <InwardListChart/> */}

        <TableLayout
        enableRowClick
          searchType="external"
          onFilterChange={handleFIlterChange}
          filters={filters}
          externalSearchEnable={enableSearchButton}
          onExternalSearchChange={(value) => {
            setSearhcTerm(value);
          }}
          onRowClick={onRowClick}
          loading={loading}
          newRow
          onNewRow={() => setIsModalOpen(true)}
          datePickerOptions={{
            showDatePicker: true,
            pickerType: "range",
          }}
          filtrationAlignement="start"
          onExternalSearch={()=>  getData()}
          searchPlaceholder="Search by Invoice Number"
          onDateRangeChange={onChangeDate}
          headers={headers}
          data={data}
          title="Inward List"
          filterTitle="Vendor Filter"
        />

        {isModalOpen && (
          <InvoiceFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            isEditable={false}
          />
        )}

        {EditModal && (
          <EditInwardDetail
            onSuccessUpdate={UpdateInward}
            onStatusUpdate={onStatusUpdate}
            isOpen={EditModal}
            onClose={() => {
              setEditModal(false);
            }}
            defaultValues={selectedRow}
            isEditable
          />
        )}
      </div>
    </div>
  );
}

export default InwardList;
