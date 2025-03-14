import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../hooks/UseToast';
import { openNewOrderModal } from '../../redux/newOrder/action';
import { Currency, IMAGE_BASE_URL } from '../../utils/constants';

const MenuItem = React.memo(({ item, onAddToCart }) => {
  // MenuItem component remains unchanged
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const {cartId} = useSelector(state=>state.cart);
  const handleImageError = (e) => {
    setImageError(true);
  };
  const dispatch = useDispatch();
  const toast = useToast();
  
  const handleNavigate = () => {
    if(!cartId){
      toast.warning("Take a new order");
      dispatch((openNewOrderModal()));
    } else {
      navigate(`/menu-detail/${item.SubSkuCode}`);
    }
  };

  return (
    <div 
      className="relative cursor-pointer w-full flex items-center bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-2 space-x-3"
      onClick={handleNavigate}
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
        {!imageError ? (
          <img
            loading="lazy"
            src={`${IMAGE_BASE_URL}/SKU/${item.SubSkuCode}.jpg`}
            alt={item.SubSkuName}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-300 text-center">
              {item.SubSkuName.substring(0, 3)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate text-wrap">
            {item.SubSkuName}
          </h3>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{Currency}</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {item.Rate || '-'}
            </span>
          </div>
        </div>
        {item.ListingPriority === '100' && (
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Fast
          </div>
        )}
      </div>
    </div>
  );
});

const SkuSearchModal = ({ skuList, onFilter, onClear ,fullList,right = "4"}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchState, setSearchState] = useState({
    nameCharacter: 0,
    selectedNameChars: [],
    selectedPriceRange: null
  });
  const [filteredSkus, setFilteredSkus] = useState(skuList);
  
  // Get unique price ranges
  const priceRanges = useMemo(() => {
    const rates = fullList?.map(sku => parseFloat(sku.Rate) || 0)
      .map(rate => Math.floor(rate))
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);
    
    return rates;
  }, [fullList]);

    // Add refs for modal and button
    const modalRef = useRef(null);
    const buttonRef = useRef(null);
  
    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isModalOpen && 
            modalRef.current && 
            !modalRef.current.contains(event.target) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target)) {
          setIsModalOpen(false);
        }
      };
  
      // Add event listener when modal is open
      if (isModalOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
  
      // Cleanup
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isModalOpen]);

  // Filter SKUs based on both name and price
  const filterSkus = (selectedChars, priceRange) => {
    let filtered = skuList;

       // Apply price filter
       if (priceRange !== null) {
        filtered = fullList?.filter(sku => {
          const rate = parseFloat(sku.Rate) || 0;
          if (priceRange === 0) {
            return rate >= 0 && rate < 1;
          }
          return Math.floor(rate) === priceRange;
        });
      }

    // Apply name filter
    if (selectedChars.length > 0) {
      filtered = filtered?.filter(sku => 
        selectedChars.every((char, index) => 
          sku?.SubSkuName?.charAt(index) === char
        )
      );
    }

 

    onFilter(filtered);
    return filtered;
  };

  const handleCharacterClick = (character) => {
    const newState = {
      ...searchState,
      selectedNameChars: [...searchState.selectedNameChars, character],
      nameCharacter: searchState.selectedNameChars.length + 1
    };
    setSearchState(newState);
    setFilteredSkus(filterSkus(newState.selectedNameChars, newState.selectedPriceRange));
  };

  const handlePriceClick = (price) => {
    const newState = {
      ...searchState,
      selectedPriceRange:  price
    };
    setSearchState(newState);
    setFilteredSkus(filterSkus(newState.selectedNameChars, newState.selectedPriceRange));
  };

  const clearSearch = () => {
    setSearchState({
      nameCharacter: 0,
      selectedNameChars: [],
      selectedPriceRange: null
    });
    setFilteredSkus(skuList);
    onFilter(skuList);
    onClear();
  };

  const getUniqueNameChars = (list, position) => {
    const chars = Array.from(new Set(
      list?.map(sku => sku?.SubSkuName?.charAt(position))
    )).filter(char => char);

    if (searchState.selectedNameChars.length > 0) {
      return chars.filter(char => 
        searchState.selectedNameChars.every((selectedChar, index) => 
          list?.some(sku => 
            sku?.SubSkuName?.charAt(index) === selectedChar &&
            sku?.SubSkuName?.charAt(position) === char
          )
        )
      );
    }
    return chars.sort();
  };

  const uniqueNameChars = useMemo(() => 
    getUniqueNameChars(skuList, searchState.nameCharacter),
    [skuList, searchState.nameCharacter, searchState.selectedNameChars]
  );

  return (
    <div className={`fixed  bottom-4 right-${right}`}>
      <button 
      ref={buttonRef}
        onClick={() => setIsModalOpen(!isModalOpen)}
        className="bg-indigo-500  dark:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:bg-indigo-600 dark:hover:bg-indigo-800 transition"
      >
        {isModalOpen ? <X /> : <Search />}
      </button>

      {isModalOpen && (
        <div ref={modalRef} className={`fixed bottom-[5rem] right-${right} w-[28rem] bg-white dark:bg-gray-800 shadow-2xl rounded-lg border border-gray-200 dark:border-gray-700 p-4`}>
          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {searchState.selectedNameChars.map((char, index) => (
              <span key={`char-${index}`} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm">
                {char}
              </span>
            ))}
            {searchState.selectedPriceRange !== null && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-md text-sm">
                {searchState.selectedPriceRange === 0 ? '< 1' : `≥ ${searchState.selectedPriceRange}`}
              </span>
            )}
          </div>

          {/* Clear Filters Button */}
          {(searchState.selectedNameChars.length > 0 || searchState.selectedPriceRange !== null) && (
            <div className="flex justify-center mb-4">
              <button 
                onClick={clearSearch}
                className="flex items-center justify-center bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-800 transition text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <RefreshCw className="mr-2" size={16} /> Clear Filters
              </button>
            </div>
          )}

          {/* Price Range Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 text-center">
              Price Range
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {priceRanges.map((price) => (
                <button
                  key={`price-${price}`}
                  onClick={() => handlePriceClick(price)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1
                    ${searchState.selectedPriceRange === price 
                      ? 'bg-green-700 text-white shadow-lg' 
                      : 'bg-green-100 dark:bg-green-800 text-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700'
                    }`}
                >
                  {price === 0 ? <><ArrowDown size={14} />{Currency} 1</> : <><ArrowUp size={14} />{Currency} {price}</>}
                </button>
              ))}
            </div>
          </div>

          {/* Character Filter Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 text-center">
              Select Characters
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-4 p-4 max-w-full">
              {skuList.length > 1 && uniqueNameChars.map((char, index) => (
                <button
                  key={`char-filter-${index}`}
                  onClick={() => handleCharacterClick(char)}
                  className="flex items-center justify-center py-3 bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {skuList.length === 1 && <MenuItem item={skuList[0]} />}
        </div>
      )}
    </div>
  );
};

export default SkuSearchModal;