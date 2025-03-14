import React, { useState } from 'react';
import { getRequest, postRequest } from '../../../services/apis/requests';

const ExcelExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = [
    'Category',
    'Item Name',
    'Item Code',
    'Price 1',
    'Price 2',
    'Price 3',
    'KOT Printer'
  ];

  const escapeCSV = (str) => {
    if (str == null) return '';
    str = str.toString();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const generateCSV = (data) => {
    return [
      headers.join(','),
      ...data.map(item => [
          escapeCSV(item.SkuName),
          escapeCSV(item.SubSkuName),
          escapeCSV(item.ItemCode),
          escapeCSV(item.Price1),
          escapeCSV(item.Price2),
          escapeCSV(item.Price3),
          escapeCSV(item.KotPrinter),
      ].join(','))
    ].join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await postRequest('menu/9999/item-list/');
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      const data = await fetchData();
      const csvContent = generateCSV(data);
      downloadCSV(csvContent, 'items_report.csv');
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <button
          onClick={exportToExcel}
          disabled={loading}
          className={`
            px-4 py-2 rounded-lg
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
            }
            text-white font-medium transition-colors duration-200
          `}
        >
          {loading ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExcelExport;