import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyLogo from '../../../../assets/images/xenologo.jpg';
import { getRequest } from '../../../../services/apis/requests';

const MainMenu = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getRequest("menu/master-list/");
      
      if (response.success) {
        setCategories(response.data);
        setError(null);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('An error occurred while fetching categories');
      console.error('Category fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategorySelect = (categoryCode) => {
    navigate(`/category/${categoryCode}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Select a Category
          </h1>
          <img
            src={CompanyLogo}
            alt="Company Logo"
            className="h-12 opacity-70 hover:opacity-100 transition-all"
          />
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            No categories available
          </div>
        ) : (
         <></>
        )}
      </div>
    </div>
  );
};

export default MainMenu;