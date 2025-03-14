import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRequest, postRequest } from "../../../services/apis/requests";
import { useToast } from "../../../hooks/UseToast";
import { openNewOrderModal } from "../../../redux/newOrder/action";
import MenuHeader from "../../../components/Headers/MenuHeader";
import CartSideBar from "../CartSideBar/CartModal";
import MenuDetailModal from "../../../Features/MenuDetail/MenuDetailModal";
import SkuSearchModal from "../../../Features/modals/SkuSearchModal";
import KotTypeSelector from "../../../Features/modals/KotTypeSelector";
import SplitBill from "../../../Features/modals/SplitBill";
import NumericKeyboard from "../../../Features/KeyBoards/NumberKeyboard";
import { Currency, IMAGE_BASE_URL } from "../../../utils/constants";
import { addItemToCart } from "../../../redux/cart/actions";
import VerticalCategorySelector from "./CategorySelector"

const MenuItem = React.memo(({ item, onSelect, onDoubleClick }) => {
  const [imageError, setImageError] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);
  const { cartId } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const toast = useToast();

  const handleImageError = () => setImageError(true);

  const handleAddtoCart = () => {
    const cartItem = {
      Code: item.SubSkuCode,
      sub_sku_code: item.SubSkuCode,
      is_addon: false,
      quantity: 1,
      preferences: "",
      rate: item.Rate,
    };
    dispatch(addItemToCart(cartItem, toast));
  };

  const handleNavigate = () => {
    if (!cartId) {
      toast.warning("Take a new order");
      dispatch(openNewOrderModal());
    } else {
      onSelect();
      if (item.Rate === 0) {
        onDoubleClick();
      } else {
        handleAddtoCart();
      }
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (clickTimeout === null) {
      const timeoutId = setTimeout(() => {
        handleNavigate();
        setClickTimeout(null);
      }, 250);
      setClickTimeout(timeoutId);
    } else {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      onDoubleClick && onDoubleClick();
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimeout) clearTimeout(clickTimeout);
    };
  }, [clickTimeout]);

  return (
    <div
      className="relative cursor-pointer w-full flex flex-col sm:flex-row items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 space-y-3 sm:space-y-0 sm:space-x-3"
      onClick={handleClick}
    >
      <div className="flex-shrink-0 w-24 h-24 sm:w-12 sm:h-12 rounded-md overflow-hidden">
        {!imageError ? (
          <img
            loading="lazy"
            src={`${IMAGE_BASE_URL}/SKU/${item.SubSkuCode}.jpg`}
            alt={item.SubSkuName}
            onError={handleImageError}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-300 text-center">
              {item.SubSkuName.substring(0, 3)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center w-full overflow-hidden">
        <div className="flex flex-col w-full sm:w-auto min-w-0">
          <h3 className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
            {item.SubSkuName}
          </h3>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
              {Currency}
            </span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {item.Rate || "-"}
            </span>
          </div>
        </div>
        {item.ListingPriority === "100" && (
          <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full mt-2 sm:mt-0">
            Fast
          </div>
        )}
      </div>
    </div>
  );
});

const MenuItemSkeleton = () => (
  <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 space-x-3 animate-pulse">
    <div className="flex items-center">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md mr-3"></div>
      <div className="flex-grow">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const MenuWithTwoSideBar = () => {
  const [selectedCategory, setSelectedCategory] = useState();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilterItems] = useState([]);
  const [activeFilters, setActiveFilter] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemModal, setItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartVisible, setIsCartVisible] = useState(true);

  const navigate = useNavigate();
  const { cartId, kotType } = useSelector(state => state.cart);
  const [searchParams] = useSearchParams();

  const getCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await getRequest("menu/master-list/");
      if (response.success) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const getItems = async (menuId) => {
    setIsLoadingItems(true);
    const body = { filter_ids: activeFilters };
    try {
      const response = await postRequest(`menu/${menuId}/item-list/?kotType=${kotType}`, body);
      if (response.success) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      getItems(selectedCategory);
    }
  }, [selectedCategory, activeFilters]);

  useEffect(() => {
    setFilterItems(items);
  }, [items]);

  useEffect(() => {
    if (!searchParams.has("category")) {
      navigate("?category=0", { replace: true });
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    setIsCartVisible(!!cartId);
  }, [cartId]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Menu Header */}
      <MenuHeader
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilter}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 ">
        {/* Left Sidebar - Categories */}
        <VerticalCategorySelector
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Center Content - Menu Items */}
        <div className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${isCartVisible ? 'mr-96' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {isLoadingItems ? (
              Array(9).fill(0).map((_, index) => (
                <MenuItemSkeleton key={index} />
              ))
            ) : (
              filteredItems?.map((item) => (
                <MenuItem
                  key={item.SubSkuCode}
                  item={item}
                  onDoubleClick={() => {
                    setSelectedItem(item);
                    setItemModal(true);
                  }}
                  onSelect={() => setSelectedItem(item)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Cart */}
        {isCartVisible && (
          <div className="w-96 fixed right-0 top-16 bottom-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
            <CartSideBar />
          </div>
        )}
      </div>

      {/* Modals */}
      <SkuSearchModal
        right={isCartVisible ? "96" : "4"}
        fullList={items}
        onClear={() => setFilterItems(items)}
        skuList={filteredItems}
        onFilter={setFilterItems}
      />
      <KotTypeSelector />
      <SplitBill />
      <NumericKeyboard variant="right" />
      {itemModal && (
        <MenuDetailModal
          isOpen={itemModal}
          onClose={() => setItemModal(false)}
          skuId={selectedItem?.SubSkuCode}
        />
      )}
    </div>
  );
};

export default MenuWithTwoSideBar;