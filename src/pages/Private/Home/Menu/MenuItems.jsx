import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, postRequest } from '../../../../services/apis/requests';
import { IMAGE_BASE_URL } from '../../../../utils/constants';

const MenuItemList = () => {
  const { categoryCode } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryCode);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getRequest("menu/master-list/");
      if (response.success) {
        setCategories(response.data);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (selectedCategory) {
        const response = await postRequest(`menu/${selectedCategory}/item-list/`, {});
        if (response.success) {
          setItems(response.data);
        }
      }
    };
    fetchItems();
  }, [selectedCategory]);

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    navigate(`/category/${newCategory}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Category Section */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-2">
              {categories.map((category) => (
                <button
                  key={category.Code}
                  onClick={() => handleCategoryChange(category.Code)}
                  className={`
                    px-6 py-3 rounded-xl transition-all duration-300 text-lg font-semibold
                    ${selectedCategory === category.Code 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100'}
                  `}
                >
                  {category.Name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="container mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No items in this category
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((item) => (
              <div
                key={item.BaseSkuCode}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <img
                  src={`${IMAGE_BASE_URL}/SKU/${item.BaseSkuCode}.jpg`}
                  alt={item.BaseSkuName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-center font-semibold text-lg text-gray-800 dark:text-gray-100">
                    {item.BaseSkuName}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemList;