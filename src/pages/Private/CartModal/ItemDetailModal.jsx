import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Currency, IMAGE_BASE_URL } from '../../../utils/constants';

const CartItemDetailsModal = ({ food, addOns, onClose, onAddAddon }) => {
  const [addonQuantities, setAddonQuantities] = useState({});

  const updateAddonQuantity = (addonCode, increment) => {
    setAddonQuantities(prev => ({
      ...prev,
      [addonCode]: Math.max(1, (prev[addonCode] || 1) + increment)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">{food.SubSkuName}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Food Image and Details */}
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            <img 
              src={`${IMAGE_BASE_URL}/SKU/${food.Code}.jpg`} 
              alt={food.SubSkuName} 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          <div className="md:w-1/2 space-y-3">
            <h3 className="text-lg font-semibold dark:text-white">{food.SkuName}</h3>
            <p className="text-gray-600 dark:text-gray-300">{food.Details}</p>
            
            {(food.Remark1 || food.Remark2) && (
              <div className="space-y-2">
                {food.Remark1 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{food.Remark1}</p>
                )}
                {food.Remark2 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{food.Remark2}</p>
                )}
              </div>
            )}
            
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {Currency} {parseFloat(food.Rate).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Addons Section */}
        {addOns && addOns.length > 0 && (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Add-ons</h3>
            <div className="space-y-3">
              {addOns.map((addon) => (
                <div
                  key={addon.Code}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-4">
                    <span className="dark:text-white">{addon.SubSkuName}</span>
                    <span className="text-green-600 dark:text-green-500">
                      +{Currency}{addon[`Price${food.priceCode}`]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 mr-4">
                      <button
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                        onClick={() => updateAddonQuantity(addon.Code, -1)}
                      >
                        <Minus className="w-5 h-5 dark:text-white" />
                      </button>
                      <span className="w-8 text-center dark:text-white">
                        {addonQuantities[addon.Code] || 1}
                      </span>
                      <button
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                        onClick={() => updateAddonQuantity(addon.Code, 1)}
                      >
                        <Plus className="w-5 h-5 dark:text-white" />
                      </button>
                    </div>
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                      onClick={() => onAddAddon(addon, addonQuantities[addon.Code] || 1)}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItemDetailsModal;