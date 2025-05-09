import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableLayout from "../../../../../components/Table/TableLayout";
import { getRequest } from "../../../../../services/apis/requests";
import MainLayout from "../../../Layout/Layout";
import ProductCreationModal from "../ItemCreation/ItemCreation";
import ImportItemModal from "./ImportItem";
import DemoWarningModal from "./DemoWarning";
import { useToast } from "../../../../../hooks/UseToast";

function ItemsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDemoWarningModalOpen, setIsDemoWarningModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  const headers = [
    { key: "slNo", label: "Sl.No" },
    { key: "item", label: "Name" },
    { key: "category", label: "Category" },
    { key: "Price1", label: "Price 1" },
    { key: "Price2", label: "Price 2" },
    { key: "Price3", label: "Price 3" },
    { key: "demoSales", label: "Demo Sales" },
  ];

  const getData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`menu/non-imported-items/`);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    getData();
    setIsProductModalOpen(false);
  };

  const handleImportSuccess = () => {
    getData(); // Refresh the list after import
  };

  useEffect(() => {
    getData();
  }, []);

  const handleRowClick = (row) => {
    setSelectedItem(row);

    if (row.demoSales > 0) {
      setIsImportModalOpen(true);
    } else {
      // Instead of just showing a toast, open the demo warning modal
      setIsDemoWarningModalOpen(true);
    }
  };

  const handleTryDemoServer = () => {
    window.open("http://103.12.1.191:3200", "_blank");
    setIsDemoWarningModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="p-4">
        <TableLayout
          loading={loading}
          newRow={true}
          onNewRow={() => setIsProductModalOpen(true)}
          onRowClick={handleRowClick}
          enableRowClick
          headers={headers}
          data={data}
          title="Items List"
        />
      </div>

      <ProductCreationModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ImportItemModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        item={selectedItem}
        onSuccess={handleImportSuccess}
      />

      <DemoWarningModal
        isOpen={isDemoWarningModalOpen}
        onClose={() => setIsDemoWarningModalOpen(false)}
        rowData={selectedItem}
        onTryDemo={handleTryDemoServer}
      />
    </MainLayout>
  );
}

export default ItemsList;
