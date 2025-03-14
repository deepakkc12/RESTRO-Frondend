import React from 'react';

const CounterClosekeys = ({ onChange }) => {
  const handleKeyPress = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  const buttonClass = "w-14 h-12 m-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg shadow active:bg-gray-300 transition-colors";
  const actionButtonClass = "w-14 h-12 m-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-lg shadow active:bg-blue-300 transition-colors";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      <div className="max-w-md mx-auto">
        {/* First Row: 1-5 and action buttons */}
        <div className="flex justify-center mb-2">
          <button type="button" onClick={() => handleKeyPress('1')} className={buttonClass}>1</button>
          <button type="button" onClick={() => handleKeyPress('2')} className={buttonClass}>2</button>
          <button type="button" onClick={() => handleKeyPress('3')} className={buttonClass}>3</button>
          <button type="button" onClick={() => handleKeyPress('4')} className={buttonClass}>4</button>
          <button type="button" onClick={() => handleKeyPress('5')} className={buttonClass}>5</button>
          <button type="button" onClick={() => handleKeyPress('backspace')} className={actionButtonClass}>Back</button>
          <button type="button" onClick={() => handleKeyPress('clear')} className={actionButtonClass}>Clear</button>
        </div>
        
        {/* Second Row: 6-9, 0, decimal, and enter */}
        <div className="flex justify-center">
          <button type="button" onClick={() => handleKeyPress('6')} className={buttonClass}>6</button>
          <button type="button" onClick={() => handleKeyPress('7')} className={buttonClass}>7</button>
          <button type="button" onClick={() => handleKeyPress('8')} className={buttonClass}>8</button>
          <button type="button" onClick={() => handleKeyPress('9')} className={buttonClass}>9</button>
          <button type="button" onClick={() => handleKeyPress('0')} className={buttonClass}>0</button>
          <button type="button" onClick={() => handleKeyPress('.')} className={actionButtonClass}>.</button>
          <button type="button" onClick={() => handleKeyPress('enter')} className={actionButtonClass}>Enter</button>
        </div>
      </div>
    </div>
  );
};

export default CounterClosekeys;