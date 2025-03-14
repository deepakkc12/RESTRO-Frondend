import { useToast } from "../../hooks/UseToast";
import { fetchCart } from "../../redux/cart/actions";
import { CloseSplitBillModal } from "../../redux/spliBillModal/action";
import { getRequest, postRequest } from "../../services/apis/requests";
import { Currency, KOT_TYEPES } from "../../utils/constants";
import {
  Check,
  X,
  ChevronRight,
  ListChecks,
  CheckSquare,
  SquareIcon,
  SplitIcon,
  Search,
  Plus,
  Minus,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const SplitBill = ({onSuccess=()=>{}}) => {
  const { isOpen } = useSelector((state) => state.splitBillModal);

  const dispatch = useDispatch();

  const toast = useToast();
  const [salesMasters, setSalesMasters] = useState([]);
  const [filteredSalesMasters, setFilteredSalesMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [splitBillLoading, setSplitBillLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  const [newTokenNumber, setNewTokenNumber] = useState(""); // New state for token input

  const onClose = () => {
    setSalesMasters([]);
    setFilteredSalesMasters([]);
    setSearchTerm("");
    setSelectedMaster(null);
    dispatch(CloseSplitBillModal());
  };

  // Fetch sales masters
  const fetchSalesMasters = async () => {
    setLoading(true);
    try {
      const response = await getRequest("kot/active-list/");
      if (response.success) {
        const dineInList = response.data.filter(
          (master) =>
            master.KotTypeCode == KOT_TYEPES.dineIn && master.KotItems > 0
        );
        const enrichedSalesMasters =
          dineInList.map((master) => ({
            ...master,
            items: [],
            itemsLoaded: false,
          })) || [];
        setSalesMasters(enrichedSalesMasters);
        setFilteredSalesMasters(enrichedSalesMasters);
      } else {
        setSalesMasters([]);
        setFilteredSalesMasters([]);
      }
    } catch (error) {
      console.error("Error fetching sales masters:", error);
      setSalesMasters([]);
      setFilteredSalesMasters([]);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = salesMasters.filter((master) =>
      master.TokenNo?.toLowerCase().includes(term?.toLowerCase())
    );
    setFilteredSalesMasters(filtered);
  };

  // Fetch details for a specific sales master
  const fetchSalesMasterDetails = async (masterCode) => {
    const masterIndex = salesMasters.findIndex(
      (master) => master.Code == masterCode
    );

    console.log(masterIndex);

    if (masterIndex === -1) return;

    const master = salesMasters[masterIndex];

    if (master.itemsLoaded) {
      setSelectedMaster({
        ...master,
      });
      return;
    }
    try {
      const response = await getRequest(`kot-items/${masterCode}/`);
      if (response.success) {
        const detailsWithSelection = {
          ...response.data,
          items: response.data?.items?.map((item) => ({
            ...item,
            selected: false,
            Code: item.Code || item.id,
            selectedQty: 0,
          })),
        };

        // Update salesMasters state
        setSalesMasters((prev) =>
          prev.map((master) =>
            master.Code == masterCode
              ? {
                  ...master,
                  items: detailsWithSelection.items,
                  itemsLoaded: true,
                  totalAmount: detailsWithSelection.totalAmount,
                  subSkuName: detailsWithSelection.subSkuName,
                }
              : master
          )
        );

        // Set the selected master with the loaded details
        setSelectedMaster({
          ...master,
          ...detailsWithSelection,
          itemsLoaded: true,
        });
      }
    } catch (error) {
      console.error("Error fetching sales master details:", error);
    }
  };
  // Initial data fetch
  useEffect(() => {
    if (isOpen) {
      fetchSalesMasters();
    }
  }, [isOpen]);

  // Select a master and load its details
  const selectMaster = (master) => {
    // If items are already loaded, directly set the selected master
    if (master.itemsLoaded) {
      setSelectedMaster(master);
      return;
    }

    // If items are not loaded, fetch the details
    fetchSalesMasterDetails(master.Code);
  };
  // Increase or decrease item quantity
  const updateItemQuantity = (itemCode, change) => {
    if (!selectedMaster) return;

    const updatedItems = selectedMaster.items.map((item) => {
      if (item.Code === itemCode) {
        const newSelectedQty = Math.max(
          0,
          Math.min(item.Qty, (item.selectedQty || 0) + change)
        );

        // Toggle selection based on quantity
        const selected = newSelectedQty > 0;

        return {
          ...item,
          selectedQty: newSelectedQty,
          selected,
        };
      }
      return item;
    });

    setSelectedMaster((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Update the main salesMasters state
    setSalesMasters((masters) =>
      masters.map((master) =>
        master.Code === selectedMaster.Code
          ? { ...master, items: updatedItems }
          : master
      )
    );
  };

  useEffect(() => {
    setFilteredSalesMasters(salesMasters);
  }, [salesMasters]);

  console.log(selectedMaster);

  // Select or deselect all items in the selected master
  const toggleSelectAllItems = () => {
    if (!selectedMaster) return;

    const allCurrentlySelected = selectedMaster.items.every(
      (item) => item.selectedQty > 0
    );

    const updatedItems = selectedMaster.items.map((item) => ({
      ...item,
      selectedQty: allCurrentlySelected ? 0 : item.Qty,
      selected: !allCurrentlySelected,
    }));

    setSelectedMaster((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Update the main salesMasters state
    setSalesMasters((masters) =>
      masters.map((master) =>
        master.Code === selectedMaster.Code
          ? { ...master, items: updatedItems }
          : master
      )
    );
  };

  // Get all selected items
  const getSelectedItems = () => {
    return salesMasters.flatMap((master) =>
      master.items
        .filter((item) => item.selectedQty > 0 && item.MasterCode == selectedMaster.Code)
        .map((item) => ({
          ...item,
          quantity: item.selectedQty,
        }))
    );
  };

  // Get selected masters
  const getSelectedMasters = () => {
    return salesMasters
      .filter((master) => master.items.some((item) => item.selectedQty > 0))
      .map((master) => master.Code);
  };

  // Handle Split Bill API Call
  const handleSplitBill = async () => {

    const selectedItems = getSelectedItems();

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to split");
      return;
    }

    if (!newTokenNumber.trim()) {
      toast.error("Please enter a token number for the new order");
      tokenInputRef.current?.focus();
      return;
    }

    const data = selectedItems.map((item) => ({
      code: item.Code,
      currentQty: item.Qty || 0,
      newQty: item.selectedQty || 0,
      subSkuCode: item.SkuCode,
      rate: item.Rate,
      previousMasterCode: item.MasterCode,
    }));
    console.log(data);
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to split");
      return;
    }

    const body = {
      token:newTokenNumber.trim(),
      masterCode:selectedMaster.Code,
      details:data
    }

    setSplitBillLoading(true);
    try {
      const response = await postRequest(`kot/split-bill/`, body);

      if (response.success) {
        dispatch(fetchCart());
        toast.success("Bill split successfully");
        onSuccess()
        onClose();
      } else {
        toast.error(response.message || "Failed to split bill");
      }
    } catch (error) {
      console.error("Error splitting bill:", error);

      toast.error("An error occurred while splitting the bill");
    } finally {
      setSplitBillLoading(false);
    }
  };

  // Calculate total selected amount
  const totalSelectedAmount = getSelectedItems().reduce(
    (total, item) => total + item.Rate * item.quantity,
    0
  );

  const tokenInputRef = useRef(null);

  // Render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative p-5 border-b dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SplitIcon className="w-8 h-8 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Split Bill
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-7 h-7 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-grow overflow-hidden">
          {/* Left Sidebar - Sales Masters */}
          <div className="w-1/3 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Search Token Number"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl 
                                    dark:bg-gray-700 dark:border-gray-600 
                                    focus:outline-none focus:ring-2 focus:ring-green-500
                                    text-gray-800 dark:text-gray-100"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                text-gray-500 dark:text-gray-400"
                />
              </div>
            </div>

            {/* Sales Masters List */}
            <div className="flex-grow p-4 overflow-y-auto extra-wide-scrollbar space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                filteredSalesMasters.map((master) => {
                  console.log(master.items);

                  const selected = master.items.filter(
                    (item) => item.selected === true
                  );
                  // console.log(selected)
                  const hasSomeItemsSelected =
                    selected.length > 0 ? true : false;

                  // console.log(hasSomeItemsSelected)

                  return (
                    <div
                      key={master.Code}
                      onClick={() => selectMaster(master)}
                      className={`
                                            flex items-center justify-between p-4 rounded-xl cursor-pointer 
                                            transition-all duration-300 shadow-sm
                                            ${
                                              selectedMaster?.Code ==
                                              master.Code
                                                ? "bg-green-100 dark:bg-green-900 border-2 border-green-500"
                                                : hasSomeItemsSelected
                                                ? "hover:bg-white dark:hover:bg-gray-700 bg-white dark:bg-gray-900"
                                                : "hover:bg-white dark:hover:bg-gray-700 bg-white dark:bg-gray-900"
                                            }
                                        `}
                    >
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">
                          Token - {master.TokenNo || master.CustomerMobileNo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {`${
                            parseInt(master.KotItems) +
                            parseInt(master.PendingItems)
                          } Items `}
                        </p>
                      </div>
                      {selectedMaster?.Code ==
                                              master.Code && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Content - Split Bill Details */}
          <div className="w-2/3 flex flex-col bg-white dark:bg-gray-900">
            {/* Items List */}
            <div className="flex-grow overflow-y-auto extra-wide-scrollbar p-6">
              {selectedMaster ? (
                <>
                  {/* Master Details Header */}
                  <div className="flex justify-between mb-4 items-center space-x-4">
                    {/* Token Input */}
                    <div className="flex-1">
                      <input
                      ref={tokenInputRef}
                        type="number"
                        placeholder="Enter New Token Number"
                        value={newTokenNumber}
                        onChange={(e) => setNewTokenNumber(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg 
                          dark:bg-gray-700 dark:border-gray-600 
                          focus:outline-none focus:ring-2 focus:ring-green-500
                          text-gray-800 dark:text-gray-100"
                      />
                    </div>

                    {/* Select All Button */}
                    <button
                      onClick={toggleSelectAllItems}
                      className="flex items-center space-x-2 px-4 py-2 
                        bg-green-100 dark:bg-green-900 
                        text-green-700 dark:text-green-300 
                        rounded-lg hover:bg-green-200 
                        transition-colors duration-300"
                    >
                      {selectedMaster.items.every((item) => item.selectedQty > 0) ? (
                        <>
                          <SquareIcon className="w-5 h-5" />
                          <span>Deselect All</span>
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-5 h-5" />
                          <span>Select All</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {selectedMaster.items.map((item) => (
                      <div
                        key={item.Code}
                        className={`
                                                flex items-center justify-between p-4 rounded-xl 
                                                transition-all duration-300 shadow-sm
                                                ${
                                                  item.selectedQty > 0
                                                    ? "bg-green-100 dark:bg-green-900 border-2 border-green-500"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
                                                }
                                            `}
                      >
                        <div className="flex-1 mr-4">
                          <h4 className="font-bold text-gray-800 dark:text-gray-100">
                            {item.SkuName}
                            <span className="ml-4 text-sm text-gray-800 font-normal dark:text-gray-50">
                              Kot - {item.KOTNo ? item.KOTNo : "Pending..!"}
                            </span>
                          </h4>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Available Qty: {parseInt(item.Qty-item.selectedQty || 0)} | {Currency}{" "}
                            {item.Rate}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateItemQuantity(item.Code, -1);
                            }}
                            disabled={item.selectedQty <= 0}
                            className={`
                                                        p-2 rounded-full 
                                                        ${
                                                          item.selectedQty > 0
                                                            ? "bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700"
                                                            : "bg-gray-200 cursor-not-allowed dark:bg-gray-700"
                                                        }
                                                    `}
                          >
                            <Minus className="w-5 h-5 text-gray-800 dark:text-gray-100" />
                          </button>
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {item.selectedQty || 0}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateItemQuantity(item.Code, 1);
                            }}
                            disabled={item.selectedQty >= item.Qty}
                            className={`
                                                        p-2 rounded-full 
                                                        ${
                                                          item.selectedQty <
                                                          item.Qty
                                                            ? "bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700"
                                                            : "bg-gray-200 cursor-not-allowed dark:bg-gray-700"
                                                        }
                                                    `}
                          >
                            <Plus className="w-5 h-5 text-gray-800 dark:text-gray-100" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <p className="text-lg">
                    Select a Sales Master to view details
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 border-t dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <ListChecks className="w-7 h-7 text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {getSelectedItems().length} Items Selected
              </span>
            </div>
            <div>
              <span className="font-semibold text-green-700 dark:text-green-400 text-lg">
                Total: {Currency} {totalSelectedAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* New Token Input */}
            {/* <input
              type="number"
              placeholder="Enter New Token Number"
              value={newTokenNumber}
              onChange={(e) => setNewTokenNumber(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 
                        focus:outline-none focus:ring-2 focus:ring-green-500
                        text-gray-800 dark:text-gray-100"
            /> */}

            {/* Split Bill Button */}
            <button
              onClick={handleSplitBill}
              disabled={getSelectedItems().length === 0 || splitBillLoading}
              className={`
                px-6 py-3 rounded-lg 
                flex items-center 
                transition-colors duration-300
                text-base font-semibold
                ${
                  getSelectedItems().length === 0 || splitBillLoading
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }
              `}
            >
              {splitBillLoading ? (
                <>
                  <span className="mr-2">Splitting...</span>
                  <div className="animate-spin">
                    <ChevronRight />
                  </div>
                </>
              ) : (
                <>
                  Split Bill
                  <ChevronRight className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitBill;
