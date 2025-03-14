import AdminPanelHeader from "../../../components/Headers/AdminPanelHeader";
import { useToast } from "../../../hooks/UseToast";
import { getRequest, postRequest } from "../../../services/apis/requests";
import { Search, Printer, Edit2, Save, X, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";

const PrinterManagement = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [bulkPrinterName, setBulkPrinterName] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [tempPrinterName, setTempPrinterName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await getRequest("menu/master-list/");
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const getItems = async (menuId) => {
    setIsLoadingItems(true);
    try {
      const response = await postRequest(`menu/${menuId}/item-list/`);
      if (response.success) {
        setItems(response.data);
        setOriginalItems(JSON.parse(JSON.stringify(response.data))); // Deep copy
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      getItems(selectedCategory);
      setBulkPrinterName("");
    }
  }, [selectedCategory]);

  // Check for changes in items compared to original state
  useEffect(() => {
    const hasChanges = JSON.stringify(items) !== JSON.stringify(originalItems);
    setHasUnsavedChanges(hasChanges);
  }, [items, originalItems]);

  const handleBulkUpdate = () => {
    if (!selectedCategory || !bulkPrinterName.trim()) return;
    const updatedItems = items.map((item) => ({
      ...item,
      KotPrinter: bulkPrinterName.trim(),
    }));
    setItems(updatedItems);
  };

  const handleItemPrinterUpdate = (itemId) => {
    const updatedItems = items.map((item) =>
      item.SubSkuCode === itemId
        ? { ...item, KotPrinter: tempPrinterName }
        : item
    );
    setItems(updatedItems);
    setEditingItemId(null);
    setTempPrinterName("");
  };

  const filteredCategories = categories.filter((category) =>
    category.SkuName.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const filteredItems = items.filter((item) =>
    item.SubSkuName.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  const toast = useToast();

  const onSave = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!hasUnsavedChanges) {
      toast.error("No changes to save");
      return;
    }

    setIsLoading(true);
    const itemList = items.map((item) => ({
      itemCode: item.ItemCode,
      printer: item.KotPrinter,
    }));

    try {
      const response = await postRequest("branch-item/update-printer/", {
        iteList: itemList,
      });
      if (response.success) {
        toast.success("Printer details saved successfully");
        setOriginalItems(JSON.parse(JSON.stringify(items))); // Update original state
        setHasUnsavedChanges(false);
      } else {
        toast.error("Failed to save printer details");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsLoading(false);
      setEditingItemId(null);
    }
  };

  return (
    <>
      <AdminPanelHeader />
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-indigo-900">
              Printer Management
            </h1>
            <p className="text-indigo-600">
              Configure and manage printer assignments for menu items
            </p>
          </div>

          {hasUnsavedChanges && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-500 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-yellow-800">
                You have unsaved changes. Please save your changes before leaving this page.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Categories Panel */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <h2 className="text-lg font-semibold mb-4">Categories</h2>
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search categories..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {isLoadingCategories ? (
                    <div className="text-center py-4 text-gray-500">
                      Loading categories...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCategories.map((category) => (
                        <button
                          key={category.Code}
                          onClick={() => {
                            if (hasUnsavedChanges) {
                              if (window.confirm("You have unsaved changes. Are you sure you want to switch categories?")) {
                                setSelectedCategory(category.Code);
                              }
                            } else {
                              setSelectedCategory(category.Code);
                            }
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedCategory === category.Code
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {category.SkuName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex gap-4 mb-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bulk Update Printer Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={bulkPrinterName}
                      onChange={(e) => setBulkPrinterName(e.target.value)}
                      placeholder="Enter printer name to apply to all items"
                      disabled={!selectedCategory}
                    />
                  </div>
                  <button
                    onClick={handleBulkUpdate}
                    disabled={!selectedCategory || !bulkPrinterName.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Printer size={20} />
                    <span>Apply to All</span>
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search items..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                  />
                </div>

                <div className="max-h-[calc(100vh)] overflow-y-auto">
                  {isLoadingItems ? (
                    <div className="text-center py-4 text-gray-500">
                      Loading items...
                    </div>
                  ) : filteredItems.length > 0 ? (
                    <div className="space-y-3">
                      {filteredItems.map((item) => {
                        const originalItem = originalItems.find(
                          (orig) => orig.SubSkuCode === item.SubSkuCode
                        );
                        const hasChanged =
                          originalItem && originalItem.KotPrinter !== item.KotPrinter;

                        return (
                          <div
                            key={item.SubSkuCode}
                            className={`p-4 border rounded-lg transition-colors ${
                              hasChanged ? "border-yellow-400 bg-yellow-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {item.SubSkuName}
                              </span>
                              {editingItemId === item.SubSkuCode ? (
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={tempPrinterName}
                                    onChange={(e) =>
                                      setTempPrinterName(e.target.value)
                                    }
                                    placeholder="Printer name"
                                  />
                                  <button
                                    onClick={() =>
                                      handleItemPrinterUpdate(item.SubSkuCode)
                                    }
                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingItemId(null);
                                      setTempPrinterName("");
                                    }}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                    {item.KotPrinter || "No printer"}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingItemId(item.SubSkuCode);
                                      setTempPrinterName(item.KotPrinter || "");
                                    }}
                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                            {hasChanged && (
                              <div className="mt-2 text-sm text-yellow-600">
                                Original printer: {originalItem.KotPrinter || "None"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {selectedCategory
                        ? "No items found"
                        : "Select a category to view items"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Save Button */}
        <div className="max-w-7xl mx-auto flex justify-end">
          <button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isLoading}
            className="fixed bottom-2 right-8 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default PrinterManagement;