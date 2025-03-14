import AdminPanelHeader from "../../../components/Headers/AdminPanelHeader";
import { useToast } from "../../../hooks/UseToast";
import { getRequest, postRequest } from "../../../services/apis/requests";
import { Currency } from "../../../utils/constants";
import ApprovedRequests from "./ApprovedRequests";
import ExcelExport from "./ExportExcel";
import PendingRequests from "./PendingRequests";
import { Search, Clock, CheckCircle, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">{children}</div>
    </div>
  );
};

const PriceManagement = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [priceData, setPriceData] = useState({
    price1: "",
    price2: "",
    price3: "",
  });

  const [approvedReqs, setApprovedReqs] = useState([]);

  const toast = useToast();

  const getPriceRevRequests = async () => {
    const response = await getRequest(
      "menu/price-rev-requests/?status=pending"
    );
    if (response.success) {
      setRequests(response.data);
    }
    return response
  };

  const getApprovedPriceRevRequests = async () => {
    const response = await getRequest(
      "menu/price-rev-requests/?status=approved"
    );
    if (response.success) {
      setApprovedReqs(response.data);
    }
  };

  const getCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await getRequest("menu/master-list/");
      if (response.success) {
        setCategories(response.data);
        setSelectedCategory(response.data[0].Code);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const getItems = async (menuId) => {
    setIsLoadingItems(true);
    try {
      const response = await postRequest(`menu/${menuId}/item-list/`);
      if (response.success) {
        // Merge items with their corresponding requests
        const itemsWithRequests = response.data.map((item) => {
          const pendingRequest = requests.find(
            (req) => req.KotItemCode === item.ItemCode && req.IsUpdated === "0"
          );
          return {
            ...item,
            pendingRequest,
          };
        });
        setItems(itemsWithRequests);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast.error("Failed to load items");
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    getPriceRevRequests();
    getApprovedPriceRevRequests();
    getCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      getItems(selectedCategory);
    }
  }, [selectedCategory, requests]);

  const handleEditPrice = (item) => {
    setSelectedItem(item);
    // If there's a pending request, use those values, otherwise use current prices
    if (item.pendingRequest) {
      setPriceData({
        price1: item.pendingRequest.Price1 || "",
        price2: item.pendingRequest.Price2 || "",
        price3: item.pendingRequest.Price3 || "",
      });
    } else {
      setPriceData({
        price1: item.Price1 || "",
        price2: item.Price2 || "",
        price3: item.Price3 || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleUpdatePrice = async () => {
    if (!selectedItem) return;

    setIsUpdating(true);
    try {
      const body = {
        itemCode: selectedItem.ItemCode,
        price1: parseFloat(priceData.price1 || 0),
        price2: parseFloat(priceData.price2 || 0),
        price3: parseFloat(priceData.price3 || 0),
        // Add request ID if updating an existing request
        reqCode: selectedItem.pendingRequest?.IsUpdated == "0" 
          ? selectedItem.pendingRequest.Code 
          : undefined
      };

      const endpoint = selectedItem.pendingRequest?.IsUpdated === "0"
        ? "menu/update-price-rev-req/"
        : "menu/post-price-rev-req/";

      const response = await postRequest(endpoint, body);

      if (response.success) {
        await getPriceRevRequests();
        await getItems(selectedCategory);
        toast.success(
          selectedItem.pendingRequest?.IsUpdated == "0"
            ? "Price revision request updated successfully"
            : "Price revision request submitted successfully"
        );
        await getPriceRevRequests()
      getItems(selectedCategory);

        setIsModalOpen(false);

      } else {
        toast.error(
          selectedItem.pendingRequest?.IsUpdated === "0"
            ? "Failed to update price revision request"
            : "Failed to submit price revision request"
        );
      }
    } catch (error) {
      console.error("Failed to handle price revision request:", error);
      toast.error("Failed to process price revision request");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.SkuName.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const filteredItems = items.filter((item) =>
    item.SubSkuName.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  const getRequestStatus = (item) => {
    if (!item.pendingRequest) return null;

    return (
      <div className="mt-2 flex items-center gap-2 text-sm">
        {item.pendingRequest.IsUpdated === "0" ? (
          <>
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500">Pending Approval</span>
          </>
        ) : item.pendingRequest.IsUpdated === "1" ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-500">Approved</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Rejected</span>
          </>
        )}
        <span className="text-gray-500 ml-2">
          Requested on: {new Date(item.pendingRequest.DOT).toLocaleDateString()}
        </span>
      </div>
    );
  };

  return (
    <>
      <AdminPanelHeader />
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="mx-auto p-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">
                Price Management
              </h1>
              <p className="text-indigo-600">
                Update and manage prices for menu items
              </p>
            </div>

            <div className="gap-5 flex items-center">
              <ApprovedRequests requests={approvedReqs}/>
              <PendingRequests requests={requests}/>
              <ExcelExport/>
            </div>
          </div>

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
                          onClick={() => setSelectedCategory(category.Code)}
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

            {/* Items Panel */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Items</h2>
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

                <div className="space-y-4">
                  {isLoadingItems ? (
                    <div className="text-center py-4 text-gray-500">
                      Loading items...
                    </div>
                  ) : filteredItems.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredItems.map((item) => (
                        <div
                          key={item.SubSkuCode}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{item.SubSkuName}</h3>
                              <div className="mt-1 space-x-4 text-sm text-gray-600">
                                <span>
                                  Current Price 1: {Currency} {item.Price1}
                                </span>
                                <span>
                                  Current Price 2: {Currency} {item.Price2}
                                </span>
                                <span>
                                  Current Price 3: {Currency} {item.Price3}
                                </span>
                              </div>
                              {item.pendingRequest && (
                                <div className="mt-1 space-x-4 text-sm text-blue-600">
                                  <span>
                                    Requested Price 1: {Currency}{" "}
                                    {item.pendingRequest.Price1}
                                  </span>
                                  <span>
                                    Requested Price 2: {Currency}{" "}
                                    {item.pendingRequest.Price2}
                                  </span>
                                  <span>
                                    Requested Price 3: {Currency}{" "}
                                    {item.pendingRequest.Price3}
                                  </span>
                                </div>
                              )}
                              {getRequestStatus(item)}
                            </div>
                            <button
                              onClick={() => handleEditPrice(item)}
                              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-600 transition-colors"
                              // disabled={item.pendingRequest?.IsUpdated === "0"}
                            >
                              {item.pendingRequest?.IsUpdated === "0"
                                ? "Request Pending"
                                : "Edit Prices"}
                            </button>
                          </div>
                        </div>
                      ))}
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

        {/* Price Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedItem?.pendingRequest?.IsUpdated === "0"
                  ? "Update Price Revision Request"
                  : "Submit Price Revision Request"}{" "}
                - {selectedItem?.SubSkuName}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {selectedItem?.pendingRequest?.IsUpdated === "0" && (
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-yellow-700 mb-2">
                  Editing Pending Request
                </h4>
                <p className="text-sm text-yellow-600">
                  You are updating an existing price revision request submitted on{" "}
                  {new Date(selectedItem.pendingRequest.DOT).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* Price Input Fields */}
              {[1, 2, 3].map((priceNum) => (
                <div key={priceNum}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price {priceNum}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceData[`price${priceNum}`]}
                      onChange={(e) =>
                        setPriceData((prev) => ({
                          ...prev,
                          [`price${priceNum}`]: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter Price ${priceNum}`}
                    />
                    {selectedItem && (
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        Current: {Currency} {selectedItem[`Price${priceNum}`]}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Price Changes Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  Price Changes Summary
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedItem &&
                    [1, 2, 3].map((priceNum) => (
                      <div key={priceNum} className="flex justify-between">
                        <span>Price {priceNum} Change:</span>
                        <span
                          className={`font-medium ${
                            parseFloat(priceData[`price${priceNum}`]) >
                            parseFloat(selectedItem[`Price${priceNum}`])
                              ? "text-green-600"
                              : parseFloat(priceData[`price${priceNum}`]) <
                                parseFloat(selectedItem[`Price${priceNum}`])
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {parseFloat(priceData[`price${priceNum}`]) !==
                          parseFloat(selectedItem[`Price${priceNum}`])
                            ? `${Currency} ${(
                                parseFloat(priceData[`price${priceNum}`]) -
                                parseFloat(selectedItem[`Price${priceNum}`])
                              ).toFixed(2)}`
                            : "No change"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePrice}
                disabled={isUpdating}
                className={`px-4 py-2 text-white rounded-lg ${
                  isUpdating
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {selectedItem?.pendingRequest?.IsUpdated === "0"
                      ? "Updating Request..."
                      : "Submitting Request..."}
                  </span>
                ) : selectedItem?.pendingRequest?.IsUpdated === "0" ? (
                  "Update Price Revision Request"
                ) : (
                  "Submit Price Revision Request"
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default PriceManagement;
