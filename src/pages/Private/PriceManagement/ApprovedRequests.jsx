import Modal from "../../../components/ModalLayout/Modal";
import TableLayout from "../../../components/Table/TableLayout";
import React, { useState } from "react";

const RequstTable = ({ data }) => {
  const headers = [
    { key: "slNo", label: "Sl.No" },
    
    { key: "SubSkuName", label: "Item" },
    { key: "DOT", label: "Requested On" },

    { key: "LoginCode", label: "Requested by" },
    { key: "updatedLoginCode", label: "Updated By" },
    { key: "UpdatedDOT", label: "Updated On" },

    { key: "Price1", label: "Requested Price 1" },
    { key: "ModifiedPrice1", label: "Updated Price 1" },

    { key: "Price2", label: "Price 2" },
    { key: "ModifiedPrice2", label: "Updated Price 2" },

    { key: "Price3", label: "Price 3" },
    { key: "ModifiedPrice3", label: "Updated Price 3" },

  ];

  return (
    <TableLayout
      excel={true}
      // pdf={false}
      headers={headers}
      data={data}
      title="Pending Requests"
    />
  );
};

function ApprovedRequests({ requests }) {

  const [loading, setLoading] = useState();

  const [isOpen, setIsOpen] = useState(false);

  return (

    <div className="overflow-auto"> 
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            setIsOpen(true);
          }}
          disabled={loading}
          className={`
            px-4 py-2 rounded-lg
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "border border-green-500 hover:bg-green-600 active:bg-green-700"
            }
            text-green-500 hover:text-white font-medium transition-colors duration-200
          `}
        >
          Approved Requests

        </button>
      </div>

      {isOpen && (
        <Modal
        size="xl"
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
          title={"Approved Requests"}
        >
          <RequstTable data={requests} />
        </Modal>
      )}
    </div>
  );
}

export default ApprovedRequests;
