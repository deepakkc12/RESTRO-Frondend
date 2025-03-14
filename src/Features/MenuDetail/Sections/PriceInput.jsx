import React from 'react';
import { Currency } from "../../utils/constants";

export const PriceInput = ({ editedRate, setEditedRate }) => (
  <div className="flex flex-col space-y-2">
    <p className="text-gray-700 dark:text-gray-300">Enter price</p>
    <div className="flex items-center space-x-2">
      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{Currency}</span>
      <input
        type="number"
        value={editedRate}
        onMouseDown={() => editedRate === 0 && setEditedRate("")}
        onFocus={() => editedRate === 0 && setEditedRate("")}
        onBlur={() => (editedRate === "" || editedRate === null) && setEditedRate(0)}
        onChange={(e) => setEditedRate(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
        className="border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
      />
    </div>
  </div>
);