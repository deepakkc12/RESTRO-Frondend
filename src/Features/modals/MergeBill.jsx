import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from "../../hooks/UseToast";
import { fetchCart } from "../../redux/cart/actions";
import { CloseMergeBillModal } from "../../redux/mergeBillModal/action";
import { getRequest, postRequest } from "../../services/apis/requests";
import { KOT_TYEPES } from "../../utils/constants";
import {
  X, Search, ArrowRightLeft, Loader2, Receipt, AlertCircle
} from "lucide-react";

const MergeBill = ({ onSuccess = () => {} }) => {
  const { isOpen } = useSelector((state) => state.mergeBillModal);
  const dispatch = useDispatch();
  const toast = useToast();

  const [salesMasters, setSalesMasters] = useState([]);
  const [filteredSalesMasters, setFilteredSalesMasters] = useState([]);
  const [selectedMasters, setSelectedMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mergingLoading, setMergingLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const onClose = () => {
    setSalesMasters([]);
    setFilteredSalesMasters([]);
    setSelectedMasters([]);
    setSearchTerm("");
    dispatch(CloseMergeBillModal());
  };

  const fetchSalesMasters = async () => {
    setLoading(true);
    try {
      const response = await getRequest("kot/active-list/");
      if (response.success) {
        const dineInList = response.data.filter(
          (master) => master.KotTypeCode == KOT_TYEPES.dineIn && master.PendingItems == 0
        );
        setSalesMasters(dineInList);
        setFilteredSalesMasters(dineInList);
      }
    } catch (error) {
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = salesMasters.filter((master) =>
      master.TokenNo?.toLowerCase().includes(term?.toLowerCase())
    );
    setFilteredSalesMasters(filtered);
  };

  const toggleMasterSelection = (master) => {
    if (selectedMasters.find(m => m.Code === master.Code)) {
      setSelectedMasters(selectedMasters.filter(m => m.Code !== master.Code));
    } else {
      setSelectedMasters([...selectedMasters, master]);
    }
  };

  const handleMergeBills = async () => {
    if (selectedMasters.length < 2) {
      toast.error("Please select at least two bills");
      return;
    }

    setMergingLoading(true);
    try {
      const response = await postRequest('kot/merge-orders/', {
       orderCodes:selectedMasters.map(order=>order.Code)
      });
      
      if (response.success) {
        dispatch(fetchCart());
        toast.success("Bills merged successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Failed to merge bills");
      }
    } catch (error) {
      toast.error("An error occurred while merging bills");
    } finally {
      setMergingLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSalesMasters();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 dark:text-black z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Merge Bills</h2>
              <p className="text-sm text-gray-500">Select bills to combine them into one</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Bill Selection */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Search by token number..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto extra-wide-scrollbar p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredSalesMasters.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No bills found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSalesMasters.map((master) => (
                    <div
                      key={master.Code}
                      onClick={() => toggleMasterSelection(master)}
                      className={`
                        flex items-center p-4 rounded-lg cursor-pointer transition-all
                        ${selectedMasters.find(m => m.Code === master.Code)
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                          : 'hover:bg-gray-50 border border-gray-200'
                        }
                      `}
                    >
                      <div className="flex-1 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Token #{master.TokenNo}</div>
                          <div className="text-sm text-gray-500">
                            {parseInt(master.KotItems) + parseInt(master.PendingItems)} items
                          </div>
                        </div>
                      </div>
                      {selectedMasters.find(m => m.Code === master.Code) && (
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {selectedMasters.findIndex(m => m.Code === master.Code) + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Merge Preview */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Merge Preview</h3>
              
              {selectedMasters.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <ArrowRightLeft className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg mb-2">No Bills Selected</p>
                  <p className="text-gray-400 text-sm">
                    Select bills from the left panel to preview the merge
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-medium">
                        Primary Bill
                      </span>
                      <span className="text-lg font-semibold">
                        #{selectedMasters[0]?.TokenNo}
                      </span>
                    </div>
                  </div>

                  {selectedMasters.slice(1).map((master, index) => (
                    <div 
                      key={master.Code}
                      className="bg-white p-4 rounded-lg border-l-4 border-blue-400 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium">
                          Merging Bill #{index + 2}
                        </span>
                        <span className="text-lg font-semibold">
                          #{master.TokenNo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="font-medium text-blue-600">{selectedMasters.length}</span>
            </div>
            <span className="text-gray-600">bills selected</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMergeBills}
              disabled={selectedMasters.length < 2 || mergingLoading}
              className={`
                px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors
                ${selectedMasters.length < 2 || mergingLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              {mergingLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Merging Bills...</span>
                </>
              ) : (
                <span>Merge Bills</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeBill;