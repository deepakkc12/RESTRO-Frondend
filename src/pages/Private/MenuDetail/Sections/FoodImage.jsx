import React from 'react';
import { IMAGE_BASE_URL } from "../../../utils/constants";

export const FoodImage = ({ food }) => (
  <div className="w-1/2 md:w-full md:h-full h-1/2 aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
    <img
      src={`${IMAGE_BASE_URL}/SKU/${food.Code}.jpg`}
      alt={food.SubSkuName}
      className="w-full h-full object-cover"
    />
  </div>
);