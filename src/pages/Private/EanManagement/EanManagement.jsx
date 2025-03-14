import AdminPanelHeader from "../../../components/Headers/AdminPanelHeader";
import { useToast } from "../../../hooks/UseToast";
import { getRequest, postRequest } from "../../../services/apis/requests";
import PriceUpdateModal from "./PriceUpdateModal";
import { Pencil, Search, Trash2, X, Check } from "lucide-react";
import React, { useEffect, useState } from "react";

const EanManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubSku, setSelectedSubSku] = useState(null);
  const [newBarcode, setNewBarcode] = useState("");
  const [newBarcodeName, setNewBarcodeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingBarcodeId, setEditingBarcodeId] = useState(null);
  const [editForm, setEditForm] = useState({ Name: "", BarCode: "" });

  const [selectedEan, setSelectedEan] = useState(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [existingBarcodes, setExistingBarcodes] = useState([]);
  const [subSkuList, setSubSkuList] = useState([]);

  const toast = useToast();

  const getEans = async (subSkuCode) => {
    setExistingBarcodes([])

    const response = await getRequest(`ean/list?sub_sku=${subSkuCode}`);
    if (response.success) {
      setExistingBarcodes(response.data);
    }
  };

  const getSubSku = async () => {
    setLoading(true);
    setExistingBarcodes([])

    const response = await getRequest(`menu/sub-sku-list/`);
    setSubSkuList(response.data);
    setLoading(false);
  };

  useEffect(() => {
    getSubSku();
  }, []);

  useEffect(() => {
    if (selectedSubSku) {
      getEans(selectedSubSku.Code);
    }
  }, [selectedSubSku]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSubSkuList([]);
    try {
      setLoading(true);
      setError("");
      const response = await getRequest(`menu/sub-sku-list/?search=${searchTerm}`);
      setSubSkuList(response.data);
      if (response.data.length === 0) {
        setError("No items found");
      }
    } catch (err) {
      setSubSkuList([]);
      setError("Failed to fetch SubSKUs");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubSku = (subSku) => {
    setSelectedSubSku(subSku);
    setEditingBarcodeId(null);
    setEditForm({ Name: "", BarCode: "" });
  };

  const handleAddBarcode = async () => {
    if (!selectedSubSku || !newBarcode || !newBarcodeName) {
      toast.error("Fill All fields to add new ean");
      return;
    }

    try {
      const body = {
        subSkuCode: selectedSubSku.Code,
        barcode: newBarcode,
        name: newBarcodeName,
      };

      const response = await postRequest("ean/add/", body);

      if (response.success) {
        toast.success("New ean added");
        setExistingBarcodes((prev) => [...prev, response.data]);
      }

      setNewBarcode("");
      setNewBarcodeName("");
    } catch (err) {
      toast.error("Failed to add barcode");
    }
  };

  const handleStartEdit = (barcode) => {
    setEditingBarcodeId(barcode.Code);
    setEditForm({
      Name: barcode.Name,
      BarCode: barcode.BarCode
    });
  };

  const handleCancelEdit = () => {
    setEditingBarcodeId(null);
    setEditForm({ Name: "", BarCode: "" });
  };

  const handleSaveEdit = async () => {
    try {
        const body = {
            name:editForm.Name,
            barcode:editForm.BarCode
        }
      const response = await postRequest(`ean/update/${editingBarcodeId}/`, body);
      if (response.success) {
        const updatedBarcodes = existingBarcodes.map(barcode =>
          barcode.Code === editingBarcodeId ? { ...barcode, ...editForm } : barcode
        );
        setExistingBarcodes(updatedBarcodes);
        toast.success("Barcode updated successfully");
        handleCancelEdit();
      }
    } catch (err) {
      toast.error("Failed to update barcode");
    }
  };

  const handleDelete = async (barcodeId) => {
    if (window.confirm("Are you sure you want to delete this barcode?")) {
      try {
        const response = await postRequest(`ean/delete/${barcodeId}/`);
        if (response.success) {
          setExistingBarcodes(existingBarcodes.filter(b => b.Code !== barcodeId));
          toast.success("Barcode deleted successfully");
        }
      } catch (err) {
        toast.error("Failed to delete barcode");
      }
    }
  };

  const handleOpenPriceModal = (ean) => {
    setSelectedEan(ean);
    setIsPriceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AdminPanelHeader />
      <div className="mx-auto px-4 py-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900">EAN Manager</h1>
          <p className="text-indigo-600">Manage EAN Details</p>
        </div>
        <div className="flex gap-4">
          <div className={`${selectedSubSku ? "w-1/3" : "w-full"} transition-all min-h-screen bg-white p-4 border rounded-lg`}>
            <h2 className="text-xl font-bold mb-4">Search for Item</h2>
            <form onSubmit={handleSearch}>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search SubSKUs..."
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={handleSearch}
                  className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                  disabled={loading}
                >
                  <Search size={20} />
                  Search
                </button>
              </div>
            </form>

            {loading && (
              <div className="bg-gray-400 text-white p-2 animate-pulse rounded mb-4">
                Loading....
              </div>
            )}
            {error && (
              <div className="bg-gray-100 text-red-700 p-2 rounded mb-4">
                No item found
              </div>
            )}

            <div className={`space-y-2 grid ${selectedSubSku ? "grid-cols-3" : "grid-cols-8"} gap-3`}>
              {subSkuList.map((subSku) => (
                <div
                  key={subSku.Code}
                  onClick={() => handleSelectSubSku(subSku)}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedSubSku?.Code === subSku.Code ? "bg-blue-50 border-blue-500" : ""
                  }`}
                >
                  <div className="text-sm">{subSku.Code}</div>
                  <div className="text-blue-600 font-semibold">{subSku.SubSkuName}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedSubSku && (
            <div className={`${selectedSubSku ? "w-2/3" : "w-0"} transition-all bg-white p-4 border rounded-lg`}>
              <h2 className="text-xl font-bold mb-4">Barcode Management</h2>
              {selectedSubSku && (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Selected: {selectedSubSku.SubSkuName}</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newBarcode}
                        onChange={(e) => setNewBarcode(e.target.value)}
                        placeholder="Enter barcode number"
                        className="w-full p-2 border rounded mb-2"
                      />
                      <input
                        type="text"
                        value={newBarcodeName}
                        onChange={(e) => setNewBarcodeName(e.target.value)}
                        placeholder="Enter barcode name"
                        className="w-full p-2 border rounded mb-2"
                      />
                      <button
                        onClick={handleAddBarcode}
                        className="bg-green-500 text-white px-4 py-2 rounded w-full"
                      >
                        Add Barcode
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Existing Barcodes</h3>
                    <div className="space-y-2">
                      {existingBarcodes.length > 0 ? (
                        existingBarcodes.map((item) => (
                          <div
                            key={item.Code}
                            className="flex items-center justify-between p-4 bg-white border rounded-lg hover:border-blue-500 transition-all"
                          >
                            {editingBarcodeId === item.Code ? (
                              <div className="flex-1 mr-4">
                                <input
                                  type="text"
                                  value={editForm.Name}
                                  onChange={(e) => setEditForm({ ...editForm, Name: e.target.value })}
                                  className="w-full p-2 border rounded mb-2"
                                  placeholder="Barcode Name"
                                />
                                <input
                                  type="text"
                                  value={editForm.BarCode}
                                  onChange={(e) => setEditForm({ ...editForm, BarCode: e.target.value })}
                                  className="w-full p-2 border rounded"
                                  placeholder="Barcode Number"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-gray-900">{item.Name}</div>
                                <div className="text-sm text-gray-600">{item.BarCode}</div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              {editingBarcodeId === item.Code ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(item)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.Code)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenPriceModal(item)}
                                    className="ml-2 flex items-center gap-2 text-sm border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100"
                                  >
                                    <Pencil size={16} />
                                    <span>Update Prices</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
                          No barcodes set for this item
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {selectedEan && (
        <PriceUpdateModal
          isOpen={isPriceModalOpen}
          onClose={() => setIsPriceModalOpen(false)}
          ean={selectedEan}
        />
      )}
    </div>
  );
};

export default EanManagement;