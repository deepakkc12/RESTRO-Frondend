import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const CategorySelector = ({
  categories,
  isLoadingCategories,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  categories = [{SkuName:"Fast Moving",Code:"0"},...categories]

  // Effect to handle initial URL parameter
  useEffect(() => {
    if (!isLoadingCategories && categories.length > 0) {
      const categoryFromUrl = searchParams.get("category");
      if (categoryFromUrl && categories.some(cat => cat.Code === categoryFromUrl)) {
        setSelectedCategory(categoryFromUrl);
      } else if (selectedCategory) {
        // If there's a selected category but no URL param, update URL
        setSearchParams(prev => {
          prev.set("category", selectedCategory);
          return prev;
        });
      }
    }
  }, [isLoadingCategories, categories, searchParams, setSearchParams, setSelectedCategory, selectedCategory]);

  const handleCategorySelect = (categoryCode) => {
    setSelectedCategory(categoryCode);
    setSearchParams(prev => {
      prev.set("category", categoryCode);
      return prev;
    });
  };

  return (
    <div className="relative w-full">
      {/* Categories Container */}
      <div
        className={`
          flex flex-wrap gap-2 max-w-full 
          overflow-hidden px-2 transition-all duration-300 ease-in-out
          ${
            isExpanded
              ? "max-h-96" // Expanded state
              : "max-h-[44px]" // Collapsed state
          }
        `}
      >
        {isLoadingCategories
          ? Array(9)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="w-24 h-10 bg-gray-200 animate-pulse rounded"
                />
              ))
          : categories.map((category) => (
              <button
                key={category.Code}
                onClick={() => handleCategorySelect(category.Code)}
                className={`
                px-4 py-2 rounded-lg transition-all duration-200
                ${
                  selectedCategory === category.Code
                    ? "bg-emerald-100 dark:bg-emerald-900/50 border border-green-600 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 border border-green-300 dark:hover:bg-gray-800"
                }
              `}
              >
                {category.SkuName}
              </button>
            ))}
      </div>

      {/* Expand/Collapse Toggle */}
      {categories.length > 0 && !isLoadingCategories && (
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              bg-white dark:bg-bg-gray-50 
              border border-gray-200 dark:border-gray-700 
              rounded-b-lg 
              px-4 py-1 
              shadow-sm 
              flex items-center gap-2
            "
          >
            {isExpanded ? (
              <ChevronUp className="font-bold" size={16} />
            ) : (
              <ChevronDown className="font-bold" size={16} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;

{
  /* <div className="flex space-x-4 max-w-[calc(100%-100px)] overflow-x-auto hide-scrollbar">
          {isLoadingCategories ? (
            Array(9).fill(0).map((_, index) => (
              <div 
                key={index} 
                className="w-24 h-10 bg-gray-200 animate-pulse rounded"
              />
            ))
          ) : (
            displayedCategories.map((category) => (
              <button
                key={category.Code}
                onClick={() => setSelectedCategory(category.Code)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.Code
                    ? "bg-emerald-100 dark:bg-emerald-900/50 border border-green-600 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 border border-green-300 dark:hover:bg-gray-800 "
                }`}
              >
                {category.SkuName}
              </button>
            ))
          )}
        </div>*/
}

{
  /* Navigation Buttons Container - Always on right side */
}
{
  /* {hasMoreCategoriesToShow && (
          <div className="absolute right-8 flex items-center space-x-2">
            {!isFirstPage && (
              <button 
                onClick={handlePrevCategories}
                className="p-1 rounded-lg bg-green-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="text-gray-600 dark:text-gray-300" />
              </button>
            )}
            {!isLastPage && (
              <button 
                onClick={handleNextCategories}
                className="p-1 bg-green-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>
        )} */
}


        {/* Category Buttons Container */}
        {/* <div className="flex space-x-4 max-w-[calc(100%-100px)] overflow-x-auto hide-scrollbar">
          {isLoadingCategories ? (
            Array(9).fill(0).map((_, index) => (
              <div 
                key={index} 
                className="w-24 h-10 bg-gray-200 animate-pulse rounded"
              />
            ))
          ) : (
            displayedCategories.map((category) => (
              <button
                key={category.Code}
                onClick={() => setSelectedCategory(category.Code)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.Code
                    ? "bg-emerald-100 dark:bg-emerald-900/50 border border-green-600 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 border border-green-300 dark:hover:bg-gray-800 "
                }`}
              >
                {category.SkuName}
              </button>
            ))
          )}
        </div> */}
        
        {/* Navigation Buttons Container - Always on right side */}
        {/* {hasMoreCategoriesToShow && (
          <div className="absolute right-8 flex items-center space-x-2">
            {!isFirstPage && (
              <button 
                onClick={handlePrevCategories}
                className="p-1 rounded-lg bg-green-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="text-gray-600 dark:text-gray-300" />
              </button>
            )}
            {!isLastPage && (
              <button 
                onClick={handleNextCategories}
                className="p-1 bg-green-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>
        )} */}