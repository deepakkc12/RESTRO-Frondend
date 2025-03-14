import React from 'react';
import { ShoppingCart } from "lucide-react";

export const AddToCartButton = ({ food, editedRate, loading, onClick }) => (
  <button
    className={`w-full sm:w-auto flex items-center justify-center space-x-2 ${
      food.Rate > 0
        ? "bg-green-600 hover:bg-green-700"
        : editedRate == 0
        ? "bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    } text-white px-5 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500`}
    onClick={onClick}
    disabled={loading}
  >
    <ShoppingCart className="w-5 h-5" />
    {loading ? <span>Adding...</span> : <span>Add to Cart</span>}
  </button>
);