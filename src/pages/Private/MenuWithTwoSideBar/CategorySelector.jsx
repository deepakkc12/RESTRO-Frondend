import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";

const CategorySelector = ({
  categories = [],
  isLoadingCategories = false,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const allCategories = [{ SkuName: "Fast Moving", Code: "0" }, ...categories];

  useEffect(() => {
    if (!isLoadingCategories && allCategories.length > 0) {
      const categoryFromUrl = searchParams.get("category");
      if (categoryFromUrl && allCategories.some(cat => cat.Code === categoryFromUrl)) {
        setSelectedCategory(categoryFromUrl);
      } else if (selectedCategory) {
        setSearchParams(prev => {
          prev.set("category", selectedCategory);
          return prev;
        });
      }
    }
  }, [isLoadingCategories, allCategories, searchParams, setSearchParams, setSelectedCategory, selectedCategory]);

  const handleCategorySelect = (categoryCode) => {
    setSelectedCategory(categoryCode);
    setSearchParams(prev => {
      prev.set("category", categoryCode);
      return prev;
    });
    setIsOpen(false);
  };

  const getSelectedCategoryName = () => {
    const selected = allCategories.find(cat => cat.Code === selectedCategory);
    return selected?.SkuName || "Select Category";
  };

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden flex items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center space-x-2"
        >
          <Menu size={20} />
          <span className="text-sm font-medium truncate">
            {getSelectedCategoryName()}
          </span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-48 h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="p-3 border-b dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Categories
          </h2>
        </div>
        <CategoryList
          categories={allCategories}
          isLoading={isLoadingCategories}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Mobile Drawer */}
      <div
        className={`
          lg:hidden fixed inset-0 z-40 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer Content */}
        <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Categories
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>
          <CategoryList
            categories={allCategories}
            isLoading={isLoadingCategories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </div>
      </div>
    </>
  );
};

const CategoryList = ({ categories, isLoading, selectedCategory, onSelect }) => {
  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        {Array(8).fill(0).map((_, index) => (
          <div
            key={index}
            className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-2">
      {categories.map((category) => (
        <button
          key={category.Code}
          onClick={() => onSelect(category.Code)}
          className={`
            w-full flex items-center justify-between p-2 rounded-lg mb-1
            text-sm transition-colors duration-200
            ${
              selectedCategory === category.Code
                ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }
          `}
        >
          <span className="truncate">{category.SkuName}</span>
          {selectedCategory === category.Code && (
            <ChevronRight size={16} className="flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;