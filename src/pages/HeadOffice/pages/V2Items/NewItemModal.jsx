import React, { useState, useCallback, useEffect } from 'react';
import { X, Search, Loader, Edit2 } from 'lucide-react';
import { getRequest, postRequest } from '../../../../services/apis/requests';
import { useToast } from '../../../../hooks/UseToast';

const INITIAL_FORM_STATE = {
  brandName: '',
  groupCode: '',
  groupName: '',
  details: '',
  maxPrice: '',
  salesPrice: '',
  skuName:''
};

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

const GroupSelectionField = ({ 
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
        Group <span className="text-red-500">*</span>
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
            placeholder="Search for a group..."
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
                  {item.Name}
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

const BrandField = ({ value, onChange, onEdit, error }) => {
  const [isEditing, setIsEditing] = useState(!value);

  return (
    <div className='w-full'>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Brand Name <span className="text-red-500">*</span>
      </label>
      
      {!isEditing ? (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{value}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
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
        <div className="flex space-x-2">
          <input
            type="text"
            onBlur={() => {value && setIsEditing(false)}}
            value={value}
            onChange={onChange}
            className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
              ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter brand name"
          />
          {/* {value && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Set
            </button>
          )} */}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

const CreateItemModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const debouncedGroupSearch = useDebounce(groupSearchTerm, 300);
  const [isSearchingGroups, setIsSearchingGroups] = useState(false);
  const [groups, setGroups] = useState([]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.groupCode) newErrors.group = 'Group is required';
    if (!formData.brandName.trim()) newErrors.brandName = 'Brand name is required';
    if (!formData.maxPrice) newErrors.maxPrice = 'Max price is required';
    if (!formData.skuName) newErrors.skuName = 'SKU Name is required';

    if (!formData.salesPrice) newErrors.salesPrice = 'Sales price is required';
    if (parseFloat(formData.salesPrice) > parseFloat(formData.maxPrice)) {
      newErrors.salesPrice = 'Sales price cannot exceed max price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const searchGroups = useCallback(async (term) => {
    if (!term) {
      setGroups([]);
      return;
    }
    setIsSearchingGroups(true);
    setApiError('');
    try {
      const response = await getRequest(`v2/groups/?search=${term}`);
      setGroups(response.data || []);
    } catch (error) {
      setApiError('Failed to search groups. Please try again.');
      console.error('Error searching groups:', error);
    } finally {
      setIsSearchingGroups(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedGroupSearch) {
      searchGroups(debouncedGroupSearch);
    }
  }, [debouncedGroupSearch, searchGroups]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const toast = useToast()
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    const body =  {
        brandName: formData.brandName,
        groupCode: formData.groupCode,
        details: formData.details,
        skuName: formData.skuName,
        maxPrice: parseFloat(formData.maxPrice),
        salesPrice: parseFloat(formData.salesPrice),
      }

    try {
      const response = await postRequest('v2/items/', body)
      
      if (!response.success) {
        throw new Error('Failed to create item');
      }

      onSuccess?.();
    //   onClose();

    toast.success("Item Created")
      setFormData( { 
        brandName: formData.brandName,
        groupCode: formData.groupCode,
        groupName: formData.groupName,
        details: '',
        maxPrice: '',
        salesPrice: '',
        skuName:''});
    } catch (error) {
      setApiError('Failed to create item. Please try again.');
      console.error('Error creating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setApiError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Item</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {apiError && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {/* Group Selection */}
         <div className='flex justify-between items-center gap-2'>

          <GroupSelectionField
            value={formData.groupCode}
            isSearching={isSearchingGroups}
            searchResults={groups}
            onSearch={setGroupSearchTerm}
            onSelect={(group) => {
              setFormData(prev => ({
                ...prev,
                groupCode: group.Code,
                groupName: group.Name
              }));
              setGroupSearchTerm('');
            }}
            onEdit={() => {
              setFormData(prev => ({
                ...prev,
                groupCode: '',
                groupName: ''
              }));
            }}
            selectedName={formData.groupName}
            error={errors.group}
          />

          {/* Brand Input */}
         <BrandField
            value={formData.brandName}
            onChange={(e) => handleInputChange({
              target: { name: 'brandName', value: e.target.value }
            })}
            onEdit={() => {
              setFormData(prev => ({
                ...prev,
                brandName: ''
              }));
            }}
            error={errors.brandName}
          />


         </div>
         <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="skuName"
                value={formData.skuName}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                  ${errors.skuName ? 'border-red-500' : 'border-gray-300'}`}
                required

              />
              {errors.skuName && (
                <p className="mt-1 text-sm text-red-500">{errors.skuName}</p>
              )}
            </div>
          {/* Details */}
         

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxPrice"
                value={formData.maxPrice}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                  ${errors.maxPrice ? 'border-red-500' : 'border-gray-300'}`}
                required
                min="0"
                step="0.01"
              />
              {errors.maxPrice && (
                <p className="mt-1 text-sm text-red-500">{errors.maxPrice}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salesPrice"
                value={formData.salesPrice}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow
                  ${errors.salesPrice ? 'border-red-500' : 'border-gray-300'}`}
                required
                min="0"
                step="0.01"
              />
              {errors.salesPrice && (
                <p className="mt-1 text-sm text-red-500">{errors.salesPrice}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              name="details"
              maxLength={50}
              value={formData.details}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-white transition-colors
                ${isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </span>
              ) : (
                'Create Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItemModal;