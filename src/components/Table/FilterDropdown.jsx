import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Filter, Search } from "lucide-react";

const FilterDropdown = ({ filters, onFilterChange,title="Filter" }) => {
  const [filterDropDown, setFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilterDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterSelect = useCallback((filterType, option) => {
    setSelectedFilters((prev) => {
      const newFilters = {
        ...prev,
        [filterType]: option,
      };
      onFilterChange(newFilters);
      return newFilters;
    });
    setFilterDropdown(false);
    setSearchQuery("");
  }, [onFilterChange]);

  const removeFilter = useCallback((filterType) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterType];
      onFilterChange(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return filters;

    const searchLower = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(filters).forEach(([filterType, options]) => {
      const matchingOptions = options?.filter(option =>
        option.name.toLowerCase().includes(searchLower)
      );
      
      if (matchingOptions?.length > 0) {
        filtered[filterType] = matchingOptions;
      }
    });

    return filtered;
  }, [filters, searchQuery]);

  const selectedFiltersList = useMemo(() => {
    return Object.entries(selectedFilters).map(([filterType, filter]) => (
      <div key={filterType} className="relative inline-flex mr-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
        {filter.name}
        <button
          onClick={() => removeFilter(filterType)}
          className="ml-2 text-xs hover:text-blue-900"
        >
          ×
        </button>
      </div>
    ));
  }, [selectedFilters, removeFilter]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div className="mt-6"></div>
      <div className="flex flex-wrap items-center gap-2">
        {selectedFiltersList}
        <button
          onClick={() => setFilterDropdown(!filterDropDown)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 
            bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Filter className="h-4 w-4" />
          {title}
        </button>
      </div>

      {filterDropDown && (
        <div className="absolute z-10 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="p-2 max-h-96 overflow-y-auto">
            {Object.entries(filteredOptions).map(([filterType, options]) => (
              <div key={filterType} className="mb-4 last:mb-0">
                <div className="sticky top-0 bg-white py-1 text-sm font-medium text-gray-700 border-b border-gray-200">
                  {filterType}
                </div>
                <div className="mt-1 max-h-32 overflow-y-auto pr-2">
                  <div className="space-y-1">
                    {options?.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleFilterSelect(filterType, option)}
                        className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-blue-50 
                          ${selectedFilters[filterType]?.id === option.id ? "bg-blue-100" : ""}`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(filteredOptions).length === 0 && (
              <div className="text-sm text-gray-500 text-center py-2">
                No matching filters found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FilterDropdown);