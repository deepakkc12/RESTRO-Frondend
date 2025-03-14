import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../hooks/UseToast';
import { max } from 'lodash';
import { Delete } from 'lucide-react';
import { useSelector } from 'react-redux';

const NumericKeyboard = ({maxValue,variant = 'left',hide=false}) => {

  const {isOpen} = useSelector(state=>state.virtualKeyboard)


  const variants = {
    left : "mr-auto",right:"ml-auto",centre:"mx-auto"
  }
  const [isVisible, setIsVisible] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [activeElement, setActiveElement] = useState(null);
  const [inputName, setInputName] = useState('');
  const keyboardRef = useRef(null);
  const lastFocusedElementRef = useRef(null);
  const preventBlurRef = useRef(false);
  const blurTimeoutRef = useRef(null);
  const toast = useToast();



  const handleOutsideClick = useCallback((e) => {
    // Check if the click is outside the keyboard section
    if (
      keyboardRef.current && 
      !keyboardRef.current.contains(e.target) && 
      isVisible
    ) {
      // Close the keyboard
      setIsVisible(false);
      setActiveElement(null);
      setCurrentInput('');
      setInputName('');
    }
  }, [isVisible]);

  const handleNumberInput = useCallback((number) => {
    // Prevent blur when clicking keyboard buttons
    preventBlurRef.current = true;
  
    let newValue = currentInput;
  
    if (number === '.') {
      // Handle decimal point input
      if (!currentInput.includes('.')) {
        // If currentInput is empty, add '0' before the decimal
        newValue = currentInput === '' ? '0.' : currentInput + '.';
      }
    } else {
      // Handle numeric input
      if (currentInput === '0' && number !== '0') {
        // Replace leading zero with the new number
        newValue = number;
      } else if (currentInput === '' && number === '0') {
        // Keep single leading zero
        newValue = '0';
      } else {
        // Append the number
        newValue = currentInput + number;
      }
      
      // Limit to 2 decimal places if it's a decimal
      if (newValue.includes('.')) {
        const [whole, decimal] = newValue.split('.');
        if (decimal && decimal.length > 2) return;
      }
    }
    
    // Check if the new value exceeds maxValue
    if (maxValue !== undefined && maxValue !== null) {
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && numValue > maxValue) {
        toast.warning(`Value cannot be greater than ${maxValue}`);
        return;
      }
    }
  
    setCurrentInput(newValue);
    
    // Update the active input element
    if (activeElement) {
      // Create a new event that mimics the native input event
      const event = new Event('input', { bubbles: true });
      const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      
      // Set the value using the descriptor to trigger change detection
      const setValue = descriptor.set;
      setValue.call(activeElement, newValue);
      
      // Dispatch the input event
      activeElement.dispatchEvent(event);
      
      // If there's an onChange prop, call it
      if (activeElement.onchange) {
        activeElement.onchange(event);
      }
      
      // Ensure the input remains focused
      activeElement.focus();
    }
  }, [currentInput, activeElement, maxValue, toast]);

  const handleBackspace = useCallback(() => {
    // Prevent blur when clicking keyboard buttons
    preventBlurRef.current = true;

    const newValue = currentInput.slice(0, -1);
    
    // Check if the new value exceeds maxValue
    if (maxValue !== undefined || maxValue !==null) {
      const numValue = parseFloat(newValue);
      if (numValue > maxValue) {
        toast.warning(`Value cannot be greater than ${maxValue}`)

        return;
      }
    }
    
    setCurrentInput(newValue);
    
    if (activeElement) {
      // Create a new event that mimics the native input event
      const event = new Event('input', { bubbles: true });
      const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      
      // Set the value using the descriptor to trigger change detection
      const setValue = descriptor.set;
      setValue.call(activeElement, newValue);
      
      // Dispatch the input event
      activeElement.dispatchEvent(event);
      
      // If there's an onChange prop, call it
      if (activeElement.onchange) {
        activeElement.onchange(event);
      }
      
      activeElement.focus();
    }
  }, [currentInput, activeElement, maxValue, toast]);

  const handleSubmit = useCallback(() => {
    // Validate max value on submit
    if (maxValue !== undefined || maxValue !==null) {
      const numValue = parseFloat(currentInput);
      if (numValue > maxValue) {
        toast.warning(`Value cannot be greater than ${maxValue}`)

        return;
      }
    }

    // Close the keyboard
    setIsVisible(false);
    setCurrentInput('');
    setInputName('');
    
    // If there's an active element, blur it
    if (activeElement) {
      activeElement.blur();
    }
  }, [activeElement, currentInput, maxValue, toast]);

  const handleClear = useCallback(() => {
    // Prevent blur when clicking keyboard buttons
    preventBlurRef.current = true;

    setCurrentInput('');
    if (activeElement) {
      // Create a new event that mimics the native input event
      const event = new Event('input', { bubbles: true });
      const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      
      // Set the value using the descriptor to trigger change detection
      const setValue = descriptor.set;
      setValue.call(activeElement, '');
      
      // Dispatch the input event
      activeElement.dispatchEvent(event);
      
      // If there's an onChange prop, call it
      if (activeElement.onchange) {
        activeElement.onchange(event);
      }
      
      activeElement.focus();
    }
  }, [activeElement]);

    // Event handlers for focus and blur remain the same as in the original component
    const handleFocus = useCallback((e) => {
      // Check if the focused element is a number input or has data-numeric attribute
      if (e.target.type === 'number' || e.target.getAttribute('data-numeric') !== null) {
        // Clear any existing blur timeout
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
        }
  
        // Store the last focused element
        lastFocusedElementRef.current = e.target;
        
        // Set active element and current input
        setActiveElement(e.target);
        setCurrentInput(e.target.value || '');
        
        // Set input name (use name attribute or placeholder)
        setInputName(e.target.name || e.target.placeholder || 'Input');
        
        // Ensure keyboard is visible
        setIsVisible(true);
        
        // Scroll the input into view if it's not fully visible
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }, []);

    const handleBlur = useCallback((e) => {
      // Clear any existing blur timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
  
      // Prevent blur if we're preventing it
      if (preventBlurRef.current) {
        preventBlurRef.current = false;
        return;
      }
  
      // Check if the related target is within the keyboard
      if (keyboardRef.current && keyboardRef.current.contains(e.relatedTarget)) {
        return;
      }
      
      // Delayed check to handle focus shifts
      blurTimeoutRef.current = setTimeout(() => {
        // Check if focus is still within a numeric input
        const isNumericInputFocused = 
          document.activeElement &&
          (document.activeElement.type === 'number' || document.activeElement.type === 'text'||
           document.activeElement.getAttribute('data-numeric') !== null);
        
        if (!isNumericInputFocused) {
          setIsVisible(false);
          setActiveElement(null);
          setCurrentInput('');
          setInputName('');
        }
      }, 300); // Slightly increased timeout for more reliable behavior
    }, []);
  

  const handleGlobalKeyDown = useCallback((e) => {
    // Check if keyboard is visible and an active element exists
    if (!isVisible || !activeElement) return;

    // Handle number and decimal key inputs
    if (/^[0-9.]$/.test(e.key)) {
      e.preventDefault();
      handleNumberInput(e.key);
    }
    
    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    }
    
    // Handle Clear (Delete key)
    if (e.key === 'Delete') {
      e.preventDefault();
      handleClear();
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if we're in a modal context
      const activeModal = document.querySelector('.modal-active');
      
      if (activeModal) {
        // Find the primary action button in the modal (first with 'Enter' functionality)
        const enterButton = activeModal.querySelector('[data-enter-action]');
        
        if (enterButton) {
          // Trigger the Enter action button
          enterButton.click();
        }
      }
      
      // Close the keyboard
      handleSubmit();
    }
  }, [isVisible, activeElement, handleNumberInput, handleBackspace, handleClear, handleSubmit]);

  // Remaining event listeners and effects stay the same as in the original component
  useEffect(() => {
    // Add global keyboard event listener
    document.addEventListener('keydown', handleGlobalKeyDown);
    
    // Add listeners to document to catch all number inputs
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    // Add click listener to handle closing the keyboard
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      // Clean up event listeners
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      
      // Clear any pending timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [handleFocus, handleBlur, handleGlobalKeyDown, handleOutsideClick]);




  // Keyboard is not visible or no active input
  if (!isVisible || !isOpen) return null;

  // Render keyboard (same as original component)
  return createPortal(
    <div 
    className="fixed inset-0 z-[9999] bg-black/20 flex items-end justify-center"
    onMouseDown={handleOutsideClick}
    onTouchStart={handleOutsideClick}
  >
    <div 
      ref={keyboardRef}
      className={`max-w-md w-full md:w-1/2 ${hide ? "hidden" : ""} ${variants[variant]} dark:bg-gray-900/0 shadow-2xl select-none`}
      onMouseDown={(e) => {
        // Stop propagation to prevent closing when clicking inside the keyboard
        e.stopPropagation();
        // Prevent blur on mouse down
        preventBlurRef.current = true;
        e.preventDefault();
      }}
    >
      <div className="max-w-md bg-white dark:bg-gray-900/80 mx-auto p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {inputName}
          </span>
          <button 
            onClick={handleSubmit}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Done
          </button>
        </div>
        <input 
          type="text" 
          value={currentInput} 
          readOnly 
          className="w-full p-3 mb-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-xl font-semibold tracking-wider border border-gray-200 dark:border-gray-700"
          placeholder="Enter"
        />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
              key={num} 
              onClick={() => handleNumberInput(num.toString())}
              onMouseDown={(e) => {
                // Prevent blur on mouse down
                preventBlurRef.current = true;
                e.preventDefault();
              }}
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-2xl font-bold p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {num}
            </button>
          ))}
          
          <button 
            onClick={() => handleNumberInput('00')}
            onMouseDown={(e) => {
              // Prevent blur on mouse down
              preventBlurRef.current = true;
              e.preventDefault();
            }}
            className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-2xl font-bold p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            00
          </button>
          
          <button 
            onClick={() => handleNumberInput('0')}
            onMouseDown={(e) => {
              // Prevent blur on mouse down
              preventBlurRef.current = true;
              e.preventDefault();
            }}
            className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-2xl font-bold p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            0
          </button>
          
          <button 
            onClick={() => handleNumberInput('.')}
            onMouseDown={(e) => {
              // Prevent blur on mouse down
              preventBlurRef.current = true;
              e.preventDefault();
            }}
            className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-2xl font-bold p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            .
          </button>
          
          <button 
            onClick={handleClear}
            onMouseDown={(e) => {
              // Prevent blur on mouse down
              preventBlurRef.current = true;
              e.preventDefault();
            }}
            className="bg-yellow-500 dark:bg-yellow-700 text-white text-xl font-bold p-4 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-800 active:bg-yellow-700 dark:active:bg-yellow-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Clear
          </button>
          
          <button 
            onClick={handleBackspace}
            onMouseDown={(e) => {
              // Prevent blur on mouse down
              preventBlurRef.current = true;
              e.preventDefault();
            }}
            className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-2xl font-bold p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <Delete className='mx-auto'/>
          </button>
          
          <button 
            onClick={handleSubmit}
            onMouseDown={(e) => {
              // Prevent blur on mouse down
              preventBlurRef.current = true;
              e.preventDefault();
            }}
            className="bg-green-500 dark:bg-green-700 text-white text-xl font-bold p-4 rounded-lg hover:bg-green-600 dark:hover:bg-green-800 active:bg-green-700 dark:active:bg-green-900 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Enter
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
};

export default NumericKeyboard;