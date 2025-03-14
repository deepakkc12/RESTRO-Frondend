import React, { useState } from 'react';
import { getRequest } from '../../services/apis/requests';

const APITestUI = () => {
  const [iterations, setIterations] = useState(1);
  const [delay, setDelay] = useState(1000);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const apiCall = async () => {
    try {
      const response = await getRequest('test/create-order/');
      if (response.success) {
        return response.data;  // {code: number, items: number}
      } else {
        console.log(response)
        throw new Error(response.errors?.[0]);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setLoading(true);
    setResults([]);
    setErrors([]);

    for (let i = 0; i < iterations; i++) {
      try {
        setLoading(true);
        const startTime = performance.now();
        
        // Wait for the configured delay
        // await new Promise(resolve => setTimeout(resolve, delay));
        
        // Make the API call
        const result = await apiCall();
        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);
        
        setResults(prev => [...prev, {
          code: result.code,
          items: result.items,
          timeTaken,
          iteration: i + 1
        }]);
      } catch (error) {
        setErrors(prev => [...prev, `Error in iteration ${i + 1}: ${error.message}`]);
      } finally {
        setLoading(false);
      }
    }
    setIsRunning(false);
  };

  return (
    <div className="grid grid-cols-2 mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">API Test Interface</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Number of API Calls
            </label>
            <input
              type="number"
              min="1"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-1">
              Delay between calls (ms)
            </label>
            <input
              type="number"
              min="0"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div> */}

          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running Tests...' : 'Start API Tests'}
          </button>
        </div>
      </div>

     <div>
     {loading && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-600">Loading... Making API call {results.length + 1} of {iterations}</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="font-bold text-red-800 mb-2">Errors:</h2>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <p key={index} className="text-red-600">{error}</p>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="font-bold text-green-800 mb-2">API Test Results:</h2>
          <div className="space-y-2">
            {results.map((result) => (
              <div key={result.iteration} className="bg-white p-4 rounded border border-green-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Order #{result.iteration}</span>
                    <p className="text-gray-600">Code: {result.code}</p>
                    <p className="text-gray-600">Items Added: {result.items}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">Time Taken:</span>
                    <p className="text-gray-600">{result.timeTaken} ms</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
     </div>
    </div>
  );
};

export default APITestUI;