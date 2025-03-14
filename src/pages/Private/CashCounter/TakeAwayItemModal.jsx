import React from 'react';

const TakeAwayItemModal = ({ items, isOpen, onClose }) => {
  // Filter take-away items
  const takeAwayItems = items.filter(item => item.TakeAway === 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[500px] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Take Away Items</h2>
          <button
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {takeAwayItems.length === 0 ? (
            <p className="text-center text-gray-500">No take-away items</p>
          ) : (
            <ul className="space-y-4">
              {takeAwayItems.map((item, index) => (
                <li 
                  key={index} 
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.SkuName}</p>
                    <p className="text-sm text-gray-600">Quantity: {parseInt(item.Qty)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeAwayItemModal;