import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Loader, Edit2, Save } from 'lucide-react';
import { getRequest, postRequest } from '../../../../../services/apis/requests';
import { useToast } from '../../../../../hooks/UseToast';

const INITIAL_FORM_STATE = {
  product: '',  // Changed from 'name' to match API
  category: '', // Changed from 'categoryCode' to match API
  categoryName: '',
  image: null,
  price1: '',
  price2: '',
  price3: '',
  fastMoving: false,
  packingPreference: false, // Changed from 'needsPacking' to match API
  shortName: '' // Added to match API
};

// Custom hook for debouncing input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Category Selection Field Component
const CategorySelectionField = ({ 
  value, 
  isSearching, 
  searchResults, 
  onSearch, 
  onSelect, 
  onEdit, 
  selectedName,
  error 
}) => {
  const [isSelecting, setIsSelecting] = useState(false);

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Category <span className="text-red-500">*</span>
      </label>
      
      {value ? (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedName}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSelecting(true);
                onEdit();
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Edit2 className="h-4 w-4" />
              <span>Change</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            onChange={(e) => {
              onSearch(e.target.value);
              setIsSelecting(true);
            }}
            onClick={() => setIsSelecting(true)}
            className={`w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
              ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Search for a category..."
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      {/* Floating Dropdown */}
      {isSelecting && !value && (
        <div className="absolute z-20 w-full mt-1">
          <div className="bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="h-5 w-5 animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.Code}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    onSelect(item);
                    setIsSelecting(false);
                  }}
                >
                  {item.SkuName}
                </button>
              ))
            ) : (
              <p className="p-4 text-gray-500">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductCreationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const [filteredCategories, setFilteredCategories] = useState([]);
  
  // Debounced search terms
  const debouncedCategorySearch = useDebounce(categorySearchTerm, 300);
  
  // API data states
  const [isSearchingCategories, setIsSearchingCategories] = useState(false);
  const [categories, setCategories] = useState([]);

  const toast = useToast();

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.product.trim()) newErrors.product = 'Product name is required';
    if (!formData.price1) newErrors.price1 = 'Price 1 is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const getCategories = async() => {
        const response = await getRequest(`menu/master-list/`);
        setCategories(response.data || []);
        setFilteredCategories(response.data || [])
    }
    getCategories()
  }, []);

  // API calls
  const searchCategories = useCallback(async (term) => {
    if (!term) {
      setCategories([]);
      return;
    }
    setIsSearchingCategories(true);
    setApiError('');
    try {
      const filterd = categories.filter(cat => 
        cat.SkuName.toLowerCase().includes(term.toLowerCase()) || 
        cat.Code.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCategories(filterd);
      setIsSearchingCategories(false);
    } catch (error) {
      setApiError('Failed to search categories. Please try again.');
      console.error('Error searching categories:', error);
      setIsSearchingCategories(false);
    }
  }, [categories]);

  // Effect hooks for search
  useEffect(() => {
    if (debouncedCategorySearch) {
      searchCategories(debouncedCategorySearch);
    }
  }, [debouncedCategorySearch, searchCategories]);

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      formDataToSend.append('category', formData.category);
      formDataToSend.append('product', formData.product);
      formDataToSend.append('price1', formData.price1);
      
      if (formData.price2) formDataToSend.append('price2', formData.price2);
      if (formData.price3) formDataToSend.append('price3', formData.price3);
      
      formDataToSend.append('packingPreference', formData.packingPreference?1:0);
      formDataToSend.append('fastMoving', formData.fastMoving?1:0);
      
      if (formData.shortName) formDataToSend.append('shortName', formData.shortName);
      
      // Add image if available
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Make API request
      const response = await postRequest('menu/create-item/', formDataToSend);

      if (response.success){
          
          toast.success("Product Created Successfully");
          onSuccess?.();
          setFormData(INITIAL_FORM_STATE);
          setPreviewImage(null);
          setIsSubmitting(false);
      }else{
        toast.error("Failed to create product")
        setIsSubmitting(false);

      }
      // Reset form
    } catch (error) {
      setApiError('Failed to create product. Please try again.');
      console.error('Error creating product:', error);
      setIsSubmitting(false);
      setIsSubmitting(false);

    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setApiError('');
    setPreviewImage(null);
    setIsSubmitting(false);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-screen overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Product</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {/* First Row: Category and Product Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategorySelectionField
              value={formData.category}
              isSearching={isSearchingCategories}
              searchResults={filteredCategories}
              onSearch={setCategorySearchTerm}
              onSelect={(category) => {
                setFormData(prev => ({
                  ...prev,
                  category: category.Code,
                  categoryName: category.SkuName
                }));
                setCategorySearchTerm('');
              }}
              onEdit={() => {
                setFormData(prev => ({
                  ...prev,
                  category: '',
                  categoryName: ''
                }));
              }}
              selectedName={formData.categoryName}
              error={errors.category}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                  ${errors.product ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter product name"
                required
              />
              {errors.product && (
                <p className="mt-1 text-sm text-red-500">{errors.product}</p>
              )}
            </div>
          </div>
          
          {/* Short Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Name
            </label>
            <input
              type="text"
              name="shortName"
              value={formData.shortName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              placeholder="Enter short name (optional)"
            />
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1 p-2 border border-gray-300 rounded-lg"
              />
              {previewImage && (
                <div className="flex-shrink-0">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="h-20 w-20 object-cover rounded-md border border-gray-300" 
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Price Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price1"
                value={formData.price1}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                  ${errors.price1 ? 'border-red-500' : 'border-gray-300'}`}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errors.price1 && (
                <p className="mt-1 text-sm text-red-500">{errors.price1}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price 2
              </label>
              <input
                type="number"
                name="price2"
                value={formData.price2}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price 3
              </label>
              <input
                type="number"
                name="price3"
                value={formData.price3}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="fastMoving"
                name="fastMoving"
                checked={formData.fastMoving}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <label htmlFor="fastMoving" className="ml-2 text-gray-700">
                Fast Moving Item
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="packingPreference"
                name="packingPreference"
                checked={formData.packingPreference}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <label htmlFor="packingPreference" className="ml-2 text-gray-700">
                Needs Packing
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center
                ${isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreationModal;