import React, { useState } from 'react';
import { X, Delete, Space } from 'lucide-react';

const VirtualKeyboard = ({ value = '', onChange, onClose }) => {
  const [isShift, setIsShift] = useState(false);
  const [isCapsLock, setCapsLock] = useState(false);

  const baseKeys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  const symbolKeys = {
    normal: ['-', '=', '[', ']', '\\', ';', "'", ',', '.', '/'],
    shift: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')']
  };

  const handleKeyPress = (key) => {
    let newValue = value;
    
    if (key === 'BACKSPACE') {
      newValue = value.slice(0, -1);
    } else if (key === 'SPACE') {
      newValue = value + ' ';
    } else if (key === 'SHIFT') {
      setIsShift(!isShift);
      return;
    } else if (key === 'CAPS') {
      setCapsLock(!isCapsLock);
      return;
    } else if (key === 'ENTER') {
      newValue = value + '\n';
    } else {
      let charToAdd = key;
      
      // Handle letter case
      if (baseKeys.some(row => row.includes(key.toLowerCase()))) {
        if (isCapsLock || isShift) {
          charToAdd = key.toUpperCase();
        } else {
          charToAdd = key.toLowerCase();
        }
      }
      
      newValue = value + charToAdd;
    }
    
    onChange(newValue);
    
    // Reset shift after key press (except for caps lock)
    if (isShift && key !== 'SHIFT') {
      setIsShift(false);
    }
  };

  const getKeyDisplayText = (key) => {
    if (baseKeys.some(row => row.includes(key))) {
      return (isCapsLock || isShift) ? key.toUpperCase() : key;
    }
    return key;
  };

  const KeyButton = ({ keyValue, displayText, className = "", width = "w-10" }) => (
    <button
      onClick={() => handleKeyPress(keyValue)}
      className={`
        ${width} h-10 m-1 rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
        text-gray-900 dark:text-white font-medium text-sm
        active:bg-gray-200 dark:active:bg-gray-500
        transition-all duration-150
        ${className}
      `}
    >
      {displayText || keyValue}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-end justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-t-2xl shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Virtual Keyboard
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Text Display Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text Preview:
          </label>
          <div className="
            w-full min-h-[120px] p-4 
            border-2 border-gray-300 dark:border-gray-600 
            rounded-lg bg-gray-50 dark:bg-gray-700 
            text-gray-900 dark:text-white
            overflow-y-auto max-h-32
            whitespace-pre-wrap break-words
            font-mono text-sm
          ">
            {value || (
              <span className="text-gray-500 dark:text-gray-400 italic">
                Start typing with the virtual keyboard...
              </span>
            )}
          </div>
        </div>

        {/* Keyboard Layout */}
        <div className="flex flex-col items-center space-y-2">
          {/* Number Row */}
          <div className="flex justify-center">
            {numberKeys.map((key) => (
              <KeyButton 
                key={key} 
                keyValue={isShift ? symbolKeys.shift[numberKeys.indexOf(key)] : key}
                displayText={isShift ? symbolKeys.shift[numberKeys.indexOf(key)] : key}
              />
            ))}
            <KeyButton keyValue="BACKSPACE" displayText="⌫" width="w-16" />
          </div>

          {/* Letter Rows */}
          {baseKeys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center">
              {rowIndex === 1 && <div className="w-5"></div>} {/* Offset for middle row */}
              {row.map((key) => (
                <KeyButton 
                  key={key} 
                  keyValue={key}
                  displayText={getKeyDisplayText(key)}
                />
              ))}
              {rowIndex === 0 && (
                <>
                  {symbolKeys.normal.slice(0, 3).map((symbol, index) => (
                    <KeyButton 
                      key={symbol} 
                      keyValue={isShift ? symbolKeys.shift[index + 7] : symbol}
                      displayText={isShift ? symbolKeys.shift[index + 7] : symbol}
                    />
                  ))}
                </>
              )}
            </div>
          ))}

          {/* Bottom Row */}
          <div className="flex justify-center">
            <KeyButton 
              keyValue="CAPS" 
              displayText="Caps"
              width="w-16"
              className={isCapsLock ? "bg-blue-500 text-white" : ""}
            />
            <KeyButton 
              keyValue="SHIFT" 
              displayText="Shift"
              width="w-16"
              className={isShift ? "bg-blue-500 text-white" : ""}
            />
            <KeyButton keyValue="SPACE" displayText="Space" width="w-32" />
            <KeyButton keyValue="ENTER" displayText="Enter" width="w-16" />
            {/* Common punctuation */}
            {[',', '.', '?', '!'].map((punct) => (
              <KeyButton key={punct} keyValue={punct} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={() => onChange('')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                const words = value.trim().split(' ');
                const newValue = words.slice(0, -1).join(' ');
                onChange(newValue + (newValue ? ' ' : ''));
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              disabled={!value.trim()}
            >
              Delete Word
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;