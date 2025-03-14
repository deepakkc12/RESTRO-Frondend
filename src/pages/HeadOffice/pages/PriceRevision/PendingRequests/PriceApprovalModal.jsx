import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, Loader2 } from 'lucide-react';
import { Currency } from '../../../../../utils/constants';

const PriceInput = ({ label, currentPrice, value, onChange }) => {
  const calculatePriceChange = (newPrice, currentPrice) => {
    if (!newPrice || !currentPrice) return null;
    const numNew = parseFloat(newPrice);
    const numCurrent = parseFloat(currentPrice);
    if (isNaN(numNew) || isNaN(numCurrent)) return null;
    return ((numNew - numCurrent) / numCurrent) * 100;
  };

  const priceChange = calculatePriceChange(value, currentPrice);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-500">Current</div>
          <div className="font-medium text-gray-900">
            {currentPrice ? `${Currency + parseFloat(currentPrice).toFixed(2)}` : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">New</div>
          <div className="relative">
            <input
            disabled
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="flex items-center">
          {priceChange !== null && (
            <div className={`flex items-center ${
              priceChange > 0 ? 'text-red-600' : priceChange < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {priceChange > 0 ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : priceChange < 0 ? (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              ) : null}
              <span className="font-medium">{Math.abs(priceChange).toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PriceApprovalModal = ({ isOpen, onClose, selectedRow, onApprove, loading }) => {
  const [price1, setPrice1] = React.useState('');
  const [price2, setPrice2] = React.useState('');
  const [price3, setPrice3] = React.useState('');

  React.useEffect(() => {
    if (selectedRow) {
      setPrice1(selectedRow.Price1 || '');
      setPrice2(selectedRow.Price2 || '');
      setPrice3(selectedRow.Price3 || '');
    }
  }, [selectedRow]);

  const handleApprove = () => {
    onApprove({
      ...selectedRow,
      approvedPrice1: price1,
      approvedPrice2: price2,
      approvedPrice3: price3,
    });
    onClose();
  };

  if (!isOpen || !selectedRow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Price Revision Request</h2>
            <p className="text-gray-600 mt-1">Review and approve price changes for this item</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Item Name</div>
              <div className="font-medium text-gray-900">{selectedRow.SubSkuName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Branch</div>
              <div className="font-medium text-gray-900">{selectedRow.BranchName || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <PriceInput 
            label="Price 1"
            currentPrice={selectedRow.CurrentP1}
            value={price1}
            onChange={setPrice1}
          />
          <PriceInput 
            label="Price 2"
            currentPrice={selectedRow.CurrentP2}
            value={price2}
            onChange={setPrice2}
          />
          <PriceInput 
            label="Price 3"
            currentPrice={selectedRow.CurrentP3}
            value={price3}
            onChange={setPrice3}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium flex items-center ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Approving..." : "Approve Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceApprovalModal;