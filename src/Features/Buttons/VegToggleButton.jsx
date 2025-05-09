import { useState } from "react";
import { postRequest } from "../../services/apis/requests";
import { useDispatch } from "react-redux";
import { updateIsVegStatus } from "../../redux/cart/actions";

const VegToggle = ({isVeg, items = [] ,orderCode}) => {

    
//   const [isVeg, setIsVeg] = useState(0);

  const dispatch = useDispatch()

  
  
  const onToggle =async () => {
    const body = {status:(!isVeg)}
    const response = await postRequest(`kot/${orderCode}/update-vegstatus/`,body)
    if(response.success){
        dispatch(updateIsVegStatus(!isVeg));
        // disp
    }
  };

  console.log(isVeg)

  const isDisabled = items.length > 0;

  if( !orderCode) return null
  
  return (
    <div className="flex items-center gap-2">
      <span className={`font-medium text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
        {isVeg ? 'Vegetarian' : 'Vegetarian'}
      </span>

      <button
        onClick={onToggle}
        disabled={isDisabled}
        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer
          rounded-full border-2 transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          ${isDisabled 
            ? 'cursor-not-allowed opacity-50' 
            : ''
          }
          ${isVeg
            ? 'bg-green-500 border-green-500'
            : 'bg-gray-200 border-gray-200 dark:bg-gray-600 dark:border-gray-600'
          }`}
        aria-label={`Toggle vegetarian mode ${isVeg ? 'off' : 'on'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full
            bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${isVeg ? 'translate-x-5' : 'translate-x-0'}
            ${isDisabled ? 'bg-gray-100' : ''}`}
        />
      </button>
    </div>
  );
};

export default VegToggle;