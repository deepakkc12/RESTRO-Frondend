import React, { useState, useEffect } from 'react';
import { getRequest, postRequest } from '../../../services/apis/requests';
import { useToast } from '../../../hooks/UseToast';

const PriceUpdateModal = ({ isOpen, onClose, ean }) => {
  const [prices, setPrices] = useState({
    code:null,
    price1: '',
    price2: '',
    price3: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleClose= ()=>{
    setPrices(
        {
            code:null,
            price1: '',
            price2: '',
            price3: ''
          }
    )
    onClose()
  }

  useEffect(() => {
    // Close modal on escape key
    const handleEsc = (event) => {
      if (event.keyCode === 27) handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);


  const getCurrentPrice =async ()=>{
    const response = await getRequest(`ean-price/${ean?.Code}/`)
    if(response.success){
        setPrices({
            code:response.data.Code,
            price1 :response.data.Price1,
            price2 :response.data.Price2,
            price3 :response.data.Price3
        })
    }else{
setPrices({
    code:null,
    price1: '',
    price2: '',
    price3: ''
  })
    }
  }


  useEffect(()=>{
    getCurrentPrice()
  },[ean,isOpen])



  const saveNew =async ()=>{
    const body = {
        eanCode: ean?.Code,
        price1:prices.price1 || 0,
        price2:prices.price2 || 0,
        price3:prices.price3 || 0,

      }
    const response =await postRequest("ean-price/add/",body)
    if(response.success){
        toast.success('Prices updated successfully');
        handleClose();
    }else {
        toast.error('Failed to update prices');
      }
  }

  const handlePriceChange = (field, value) => {
    setPrices(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdatePrices = async () => {
    try {
      setLoading(true);
      const response = await postRequest('ean-price/update/', {
        eanPriceCode:prices.code,
        ...prices
      });
      
      if (response.success) {
        toast.success('Prices updated successfully');
        handleClose();
      } else {
        toast.error('Failed to update prices');
      }
    } catch (error) {
      toast.error('An error occurred while updating prices');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate =()=>{
    if(prices.code){
        handleUpdatePrices()
    }else{
        saveNew()
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Modal Header */}
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-medium">Update Prices for {ean?.Name}</h3>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Price 1</label>
            <input
              type="number"
              placeholder="Enter Price 1"
              value={prices.price1}
              onChange={(e) => handlePriceChange('price1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Price 2</label>
            <input
              type="number"
              placeholder="Enter Price 2"
              value={prices.price2}
              onChange={(e) => handlePriceChange('price2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Price 3</label>
            <input
              type="number"
              placeholder="Enter Price 3"
              value={prices.price3}
              onChange={(e) => handlePriceChange('price3', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Updating...' : 'Update Prices'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceUpdateModal;