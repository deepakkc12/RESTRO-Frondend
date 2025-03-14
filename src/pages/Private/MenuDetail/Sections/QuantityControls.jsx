import React from 'react';
import { Plus, Minus } from "lucide-react";

export const QuantityControls = ({ quantity, updateQuantity }) => (
  <div className="flex items-center space-x-4">
    <button
      className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
      onClick={() => updateQuantity(-1)}
      disabled={quantity <= 1}
    >
      <Minus className="w-5 h-5" />
    </button>
    <span className="text-xl font-semibold">{quantity}</span>
    <button
      className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
      onClick={() => updateQuantity(1)}
    >
      <Plus className="w-5 h-5" />
    </button>
  </div>
);