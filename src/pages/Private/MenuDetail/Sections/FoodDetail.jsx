import React from 'react';

export const FoodDetails = ({ food }) => (
  <div>
    <h2 className="text-2xl font-bold mb-2">{food.SubSkuName}</h2>
    <p className="text-gray-700 dark:text-gray-300">{food.Details}</p>
    {(food.Remark1 || food.Remark2) && (
      <div className="space-y-2 mt-4">
        {food.Remark1 && <p className="text-sm text-gray-600 dark:text-gray-400">{food.Remark1}</p>}
        {food.Remark2 && <p className="text-sm text-gray-600 dark:text-gray-400">{food.Remark2}</p>}
      </div>
    )}
  </div>
);