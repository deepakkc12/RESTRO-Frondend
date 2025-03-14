import Modal from "../../../components/ModalLayout/Modal";
import TableLayout from "../../../components/Table/TableLayout";
import React, { useState } from "react";

const RequstTable = ({ data }) => {
  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "SubSkuName", label: "Item" },
    { key: "DOT", label: "Requested On" },
    { key: "LoginCode", label: "Requested by" },
    { key: "Price1", label: "Req Price 1" },
    { key: "Price2", label: "Req Price 2" },
    { key: "Price3", label: "Req Price 3" },
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

function PendingRequests({ requests }) {
  const [loading, setLoading] = useState();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
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
                : "border border-blue-500 hover:bg-blue-600 active:bg-blue-700"
            }
            text-blue-500 hover:text-white font-medium transition-colors duration-200
          `}
        >
          Pending Requests
        </button>
      </div>

      {isOpen && (
        <Modal
        
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
          title={"Pending Requests"}
        >
          <RequstTable data={requests} />
        </Modal>
      )}
    </div>
  );
}

export default PendingRequests;
