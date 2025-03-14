import React, { useState, useEffect, useCallback } from 'react';
import { Maximize, Minimize, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsButton = () => {
 
const navigate = useNavigate()

  return (
    <button
      onClick={()=>{navigate("/setings")}}
      className={`
        p-1 rounded-full
        transition-colors duration-200
       
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      `}
    //   aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      <Settings className='dark:text-gray-400' size={20} /> 
    
      </button>
  );
};

export default SettingsButton;