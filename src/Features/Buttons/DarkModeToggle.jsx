import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const DarkModeToggle = () => {

    const { isDarkMode, toggleDarkMode } = useDarkMode();
    
    return (
      <button
        onClick={toggleDarkMode}
        className="
          p-1 rounded-full
          transition-all duration-200 ease-in-out
          dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-yellow-400
          bg-gray-200 hover:bg-gray-300 text-gray-800
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        "
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun className=''  /> : <Moon  />}
      </button>
    );
  };
  
  export default DarkModeToggle;
