import React from 'react';
import { Map, Compass, Home, Blocks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {

  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Visual element */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl font-bold text-indigo-100">404</span>
          </div>
        <Map className="h-48 w-48 mx-auto text-indigo-600 relative" />
        </div>
        
        {/* Content */}
        <h1 className="text-4xl font-bold text-indigo-900 mb-4">
          Looks like you're lost
        </h1>
        <p className="text-lg text-indigo-700 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={()=>{navigate("/")}} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 shadow-sm">
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </button>
          {/* <button className="inline-flex items-center justify-center px-6 py-3 border border-indigo-300 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition-colors duration-300 shadow-sm">
            <Compass className="h-5 w-5 mr-2" />
            Explore Site
          </button> */}
        </div>
      </div>
    </div>
  );
}