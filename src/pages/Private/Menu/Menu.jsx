import MenuHeader from "../../../components/Headers/MenuHeader";
import { getRequest, postRequest } from "../../../services/apis/requests";
import {
  Menu as MenuIcon, // Hamburger menu icon
  X, // Close/Cancel icon
  ChartLine,
  Loader2, // Add Loader2 for spinning loader
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";

import { Currency, IMAGE_BASE_URL } from "../../../utils/constants";
import { useNavigate, useSearchParams } from "react-router-dom";
import KotTypeSelector from "../../../Features/modals/KotTypeSelector";
import PaymentModal from "../../../Features/modals/BillModal";
import CompanyLogo from "../../../assets/images/xenologo.jpg";
import { useDispatch, useSelector } from "react-redux";
import { openKotPrintModal } from "../../../redux/KotPrintModal/action";
import { openNewOrderModal } from "../../../redux/newOrder/action";
import { useToast } from "../../../hooks/UseToast";

import SkuSearchModal from "../../../Features/modals/SkuSearchModal";
import Logout from "../../../Features/Buttons/Logout";
import SplitBill from "../../../Features/modals/SplitBill";
import NumericKeyboard from "../../../Features/KeyBoards/NumberKeyboard";
import CategorySelector from "./CategorySelector";
import MenuDetailModal from "../../../Features/MenuDetail/MenuDetailModal";
import CartModal from "../CartModal/CartModal";
import TableSelectionModal from "../../../Features/modals/TableChangeModal";

const MenuItem = React.memo(({ item, onAddToCart, onSelect }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const { cartId } = useSelector((state) => state.cart);

  const handleImageError = (e) => {
    setImageError(true);
  };

  const dispatch = useDispatch();

  const toast = useToast();

  const handleNavigate = () => {
    if (!cartId) {
      toast.warning("Take a new order");
      dispatch(openNewOrderModal());
    } else {
      onSelect();
      navigate(`/menu-detail/${item.SubSkuCode}`);
    }
  };

  return (
    <div
      className="relative cursor-pointer w-full flex flex-col sm:flex-row items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 space-y-3 sm:space-y-0 sm:space-x-3"
      onClick={handleNavigate}
    >
      
      {/* Image or Placeholder */}
      <div className="flex-shrink-0 w-24 h-24 sm:w-12 sm:h-12 rounded-md overflow-hidden">
        {!imageError ? (
          <img
            loading="lazy"
            src={`${IMAGE_BASE_URL}/SKU/${item.SubSkuCode}.jpg`}
            alt={item.SubSkuName}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full  h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-sm  text-gray-500 dark:text-gray-300 text-center">
              {item.SubSkuName.substring(0, 3)}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-grow flex flex-col overflow-ellipsis sm:flex-row justify-between items-start sm:items-center w-full">
        <div className="flex flex-col w-full sm:w-auto">
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

        {/* Priority or Action Indicator */}
        {item.ListingPriority === "100" && (
          <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full mt-2 sm:mt-0">
            Fast
          </div>
        )}
      </div>
    </div>
  );
});

// Skeleton Loader for Menu Items
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

// Skeleton Loader for Categories
const CategorySkeleton = ({ isExpanded }) => (
  <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2">
    <div className="h-full flex items-center p-3">
      {isExpanded ? (
        <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      ) : (
        <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      )}
    </div>
  </div>
);

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeFilters, setActiveFilter] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // New state for category pagination
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0);

  // Loading states
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  const navigate = useNavigate();

  const [filteredItems, setFilterItems] = useState([]);

  const onCLearFilter = () => {
    setFilterItems(items);
  };

  const removeFilter = (filterId) => {
    setActiveFilter((prev) => prev.filter((id) => id !== filterId));
  };

  const getCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await getRequest("menu/master-list/");
      if (response.success) {
        setCategories(response.data);
        // setSelectedCategory(response.data[0].Code)
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
      const response = await postRequest(`menu/${menuId}/item-list/`, body);
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

  const [itemModal, setItemModal] = useState(false);
  // const filteredItems = useMemo(
  //   () =>
  //     items.filter(
  //       (item) =>
  //         item.category === selectedCategory &&
  //         item.name.toLowerCase().includes(searchTerm.toLowerCase())
  //     ),
  //   [selectedCategory, searchTerm]
  // );

  // Pagination logic for categories
  const categoriesPerPage = 9;
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const displayedCategories = useMemo(() => {
    const start = currentCategoryPage * categoriesPerPage;
    return categories.slice(start, start + categoriesPerPage);
  }, [categories, currentCategoryPage]);

  const handleNextCategories = () => {
    setCurrentCategoryPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const handlePrevCategories = () => {
    setCurrentCategoryPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleAddToCart = (item) => {
    console.log("Added to cart:", item);
    setIsCartOpen(true);
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if 'category' is not in the URL params
    if (!searchParams.has("category")) {
      // Set 'category=1' in the URL
      navigate("?category=0", { replace: true });
    }
  }, [navigate, searchParams]);

  // Callback function to update filtered products
  const handleFilteredProducts = (products) => {
    setFilterItems(products);
  };

  const [selectedItem, setSelectedItem] = useState(null);
  // Calculate if we need navigation buttons
  const hasMoreCategoriesToShow = categories.length > categoriesPerPage;
  const isFirstPage = currentCategoryPage === 0;
  const isLastPage = currentCategoryPage === totalPages - 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MenuHeader
        activeFilters={activeFilters}
        setActiveFilters={(filters) => {
          setActiveFilter(filters);
        }}
      />

      {/* Horizontal Category Navigation */}
      <div className="relative flex items-center justify-center py-4 bg-white dark:bg-gray-800 shadow-sm">
        <CategorySelector
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {/* Main content area */}
      <main className="p-6 grid grid-cols-12 gap-4 bg-gray-50 dark:bg-gray-900">
        {isLoadingItems ? (
          <div
            className={`grid col-span-12 grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-6 gap-2`}
          >
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <MenuItemSkeleton key={index} />
              ))}
          </div>
        ) : (
          <div className="col-span-12 ">
            <div
              className={`grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-6 gap-4`}
            >
              {filteredItems?.map((item) => (
                <MenuItem
                  key={item.name}
                  item={item}
                  onAddToCart={handleAddToCart}
                  onSelect={() => {
                    setSelectedItem(item);
                    setItemModal(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <CartModal/>
        {/* <CartSideBar/> */}
      </main>
      <SkuSearchModal
        fullList={items}
        onClear={onCLearFilter}
        skuList={filteredItems}
        onFilter={handleFilteredProducts}
      />
      {/* <Logout/> */}
      <KotTypeSelector />
      <SplitBill />
      <NumericKeyboard variant="right" />

      <TableSelectionModal/>

      {/* {itemModal&&<MenuDetailModal isOpen={itemModal} onClose={()=>{setItemModal(false)}} skuId={selectedItem?.SubSkuCode}/>} */}
    </div>
  );
};

export default Menu;
