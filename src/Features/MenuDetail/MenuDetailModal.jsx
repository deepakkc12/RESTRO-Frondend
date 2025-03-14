import NumericKeyboard from "../../Features/KeyBoards/NumberKeyboard";

import KotTypeSelector from "../../Features/modals/KotTypeSelector";
import SplitBill from "../../Features/modals/SplitBill";
import MenuDetailHeader from "../../components/Headers/MenuDetailHeader";
import Modal from "../../components/ModalLayout/Modal";
import { useToast } from "../../hooks/UseToast";
import { addItemToCart } from "../../redux/cart/actions";
import { CloseCARTModal } from "../../redux/cartMoodal/action";
import { openNewOrderModal } from "../../redux/newOrder/action";
import { getRequest } from "../../services/apis/requests";
import { Currency, IMAGE_BASE_URL, KOT_TYEPES } from "../../utils/constants";
import ReleatedList from "./ReleatedList";
import KotNoteSelection from "./Sections/KotNoteSelection";
// import PackingPreference from "./Sections/PackingPreferences";
// import PreferencesSection from "./Sections/PrefferenceSelection";
import {
  Plus,
  Minus,
  ShoppingCart,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const LoadingSkeleton = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="min-h-screen  bg-white  text-gray-900  "
    >
      <div className="container animate-pulse mt-14 mx-auto px-4 pb-32 lg:max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section - Loading Skeleton */}
          <div className="lg:w-1/2 space-y-6">
            <div className="flex flex-row md:flex-col gap-4 md:gap-1">
              <div className="w-1/2 md:w-full md:h-full h-1/2 aspect-video bg-gray-300  rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-300  rounded w-3/4"></div>
                <div className="h-4 bg-gray-300  rounded w-full"></div>
                <div className="h-4 bg-gray-300  rounded w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Right Section - Loading Skeleton */}
          <div className="lg:w-1/2 space-y-6">
            {/* Main Loading Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300  rounded w-32"></div>
                  <div className="h-4 bg-gray-300  rounded w-40"></div>
                </div>
                <div className="h-6 bg-gray-300  rounded w-16"></div>
              </div>

              {/* Quantity and Add to Cart Loading */}
              <div className="flex sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300  rounded-full"></div>
                  <div className="h-6 w-10 bg-gray-300  rounded"></div>
                  <div className="w-10 h-10 bg-gray-300  rounded-full"></div>
                </div>
                <div className="h-12 w-32 bg-gray-300  rounded-lg"></div>
              </div>
            </div>

            {/* Expandable Sections Loading */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-12 bg-gray-300  rounded-lg"></div>
              <div className="h-12 bg-gray-300  rounded-lg"></div>
            </div>

            {/* Preferences Loading */}
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-10 bg-gray-300  rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const MenuDetailModal = ({ skuId, isOpen, onClose, item = null }) => {
  const [food, setFood] = useState(null);
  const [addonQuantities, setAddonQuantities] = useState({});
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [preferenceQuantities, setPreferenceQuantities] = useState({});
  const [customPreference, setCustomPreference] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addOns, setAddons] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);

  const [expandedSection, setExpandedSection] = useState("preferences");
  const [editedRate, setEditedRate] = useState(0);

  const { kotType } = useSelector((state) => state.cart);

  const [kotTypeRef, setKotTypeRef] = useState(kotType);

  const [loading, setLoading] = useState(false);

  const [cartItemCode, setCartItemCode] = useState(0);

  const [selectedPackingPreference, setSelectedPackingpreference] =
    useState("");

  const [packingPreference, setPackingPreference] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // toast.success()
    // console.log(item);
    if (item) {
      setCartItemCode(item?.Code);
      setQuantity(parseInt(item.Qty));
      setSelectedPreferences(item.Details);

      setExpandedSection("addons");
      const item_kot_type = item.TakeAway == 1 ? KOT_TYEPES.takeAway : kotType;
      setKotTypeRef(item_kot_type);
    } else {
      setKotTypeRef(kotType);
    }
    dispatch(CloseCARTModal());
  }, [skuId, item]);

  const getProduct = async () => {
    try {
      setFood(null);
      const response = await getRequest(
        `menu/${skuId}/detail/?kot_type=${kotType}`
      );
      if (response.success) {
        setFood(response.data);
        // console.log(response.data);
      } else {
        // navigate('/menu');
        setFood(null);
      }
    } catch (error) {
      navigate("/menu");
      console.error("Error fetching product:", error);
      setFood(null);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getAddons = async () => {
    try {
      setAddons([]);
      const response = await getRequest(
        `menu/${food?.SkuCode}/addons/?kot_type=${kotTypeRef}`
      );
      // toast.success(food?.SkuCode)
      if (response.success) {
        setAddons(response.data || []);
      } else {
        setAddons([]);
      }
    } catch (error) {
      console.error("Error fetching addons:", error);
      setAddons([]);
    }
  };

  const getRelatedItems = async () => {
    try {
      const response = await getRequest(`menu/${skuId}/related/`);
      if (response.success) {
        setRelatedItems(response.data || []);
      } else {
        setRelatedItems([]);
      }
    } catch (error) {
      console.error("Error fetching related items:", error);
      setRelatedItems([]);
    }
  };

  const getPackingPreference = async () => {
    const response = await getRequest(`menu/packing-preferences/`);
    // toast.success("rv")
    if (response.success) {
      console.log(response);
      setPackingPreference(response.data);
    } else {
      setPackingPreference([]);
    }
  };

  useEffect(() => {
    getPackingPreference();
    return () => {
      setShowAddon(false);
    };
  }, [item]);

  useEffect(() => {
    // toast.success()
    if (kotTypeRef) {
      getProduct();
    }
    getRelatedItems();
  }, [skuId, kotTypeRef, item]);

  useEffect(() => {
    if (food) {
      getAddons();
    }
  }, [food, item]);

  const updateAddonQuantity = (addonName, increment) => {
    setAddonQuantities((prev) => ({
      ...prev,
      [addonName]: Math.max(0, (prev[addonName] || 0) + increment),
    }));
  };

  const updateQuantity = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const togglePreference = (pref) => {
    setSelectedPreferences((prev) => {
      if (prev.some((p) => p.Code === pref.Code)) {
        // Remove preference
        const newPrefs = prev.filter((p) => p.Code !== pref.Code);
        setPreferenceQuantities((prevQuant) => {
          const newQuant = { ...prevQuant };
          delete newQuant[pref.Code];
          return newQuant;
        });
        return newPrefs;
      } else {
        // Add preference with default quantity of 1
        setPreferenceQuantities((prevQuant) => ({
          ...prevQuant,
          [pref.Code]: 1,
        }));
        return [...prev, pref];
      }
    });
  };

  const removePreference = (pref) => {
    setSelectedPreferences((prev) => prev.filter((p) => p.Code !== pref.Code));
    setPreferenceQuantities((prev) => {
      const newQuant = { ...prev };
      delete newQuant[pref.Code];
      return newQuant;
    });
  };

  const updatePreferenceQuantity = (pref, increment) => {
    setPreferenceQuantities((prev) => {
      const currentQuantity = prev[pref.Code] || 1;

      if (increment === 1 && currentQuantity < quantity) {
        return {
          ...prev,
          [pref.Code]: currentQuantity + 1,
        };
      } else if (increment === -1 && currentQuantity > 1) {
        return {
          ...prev,
          [pref.Code]: currentQuantity - 1,
        };
      } else if (increment === -1 && currentQuantity === 1) {
        removePreference(pref);
      }
      return prev;
    });
  };

  const dispatch = useDispatch();

  const addCustomPreference = (e) => {
    e.preventDefault();

    if (customPreference.trim()) {
      const newPref = {
        Code: `custom_${Date.now()}`,
        Details: customPreference.trim(),
      };

      // Add the new preference to food.prefereces array
      setFood((prevFood) => ({
        ...prevFood,
        prefereces: [...(prevFood.prefereces || []), newPref],
      }));

      // Add the new preference to selectedPreferences with initial quantity of 1
      setSelectedPreferences((prev) => [...prev, newPref]);

      // Set the initial quantity for the new preference
      setPreferenceQuantities((prev) => ({
        ...prev,
        [newPref.Code]: 1,
      }));

      // Clear the custom preference input field
      setCustomPreference("");
    }
  };

  const calculateTotal = () => {
    if (!food) return "0.00";

    // Use the base rate from the food item
    let total = parseFloat(food.Rate);

    // Add addon prices
    Object.entries(addonQuantities).forEach(([addonName, addonQuantity]) => {
      const addon = addOns.find((a) => a.Code === addonName);
      if (addon && addonQuantity > 0) {
        total += parseFloat(addon[`Price${food.priceCode}`]) * addonQuantity;
      }
    });

    // Multiply by main quantity
    return (total * quantity).toFixed(2);
  };

  const [clearPrefTrigger, setClearPrefTrigger] = useState(false);

  const clearPreferences = () => {
    setSelectedPreferences("");
    setselectepreferenceLsit([]);
    setClearPrefTrigger(!clearPrefTrigger);
  };

  const onchangePackingPreferenc = (pre) => {
    // toast.success(pre)
    setSelectedPackingpreference(pre);
  };

  // const formatPreferences = () => {
  //   return selectedPreferences
  //     .map((pref) => {
  //       const quantity = preferenceQuantities[pref.Code] || 1;
  //       return quantity > 1 ? `${pref.Details} × ${quantity}` : pref.Details;
  //     })
  //     .join(", ");
  // };

  const [showAddon, setShowAddon] = useState(false);

  const { cartId } = useSelector((state) => state.cart);

  const toast = useToast("top-center");

  const handleAddToCart = () => {
    if (food.Rate <= 0 && editedRate == 0) {
      toast.warning("Enter price before add to cart");
      return;
    }

    const rate = food.Rate <= 0 ? editedRate : food.Rate;

    const formatPreferences = (
      selectedPreferences,
      selectedPackingPreference
    ) => {
      if (!selectedPackingPreference) return ""; // If no packing preference, return an empty string
      return selectedPreferences.length > 0
        ? `${selectedPreferences}/ ${selectedPackingPreference}`
        : `${selectedPackingPreference}`;
    };

    if (!cartId) {
      toast.error("Create new order");
      dispatch(openNewOrderModal());
      return;
    } else {
      setLoading(true);
      const cartItem = {
        Code: food.Code,
        sub_sku_code: food.Code,
        is_addon: false,
        quantity: quantity,
        preferences: selectedPreferences.length > 0 ? selectedPreferences : "",
        rate: rate,
      };

      // toast.success(
      //   cartItem.preferences
      // );

      //   console.log(cartItem);

      dispatch(
        addItemToCart(cartItem, toast, null, (code) => {
          setLoading(false);
          clearPreferences();
          setQuantity(1);
          setCartItemCode(code);
          setExpandedSection("addons");
          // toast.success(code)
        })
      );
    }
  };

  const [isAddonLoading, setIsAddonLoading] = useState(false);
  const handleAddonCart = (addon) => {
    const cartItem = {
      Code: addon.Code,
      sub_sku_code: addon.Code,
      is_addon: true,
      addonCode: cartItemCode,
      quantity: addonQuantities[addon.Code] || 1,
      rate: addon.Rate,
      preferences: ``,
    };

    setIsAddonLoading(true);

    dispatch(
      addItemToCart(
        cartItem,
        toast,
        null,
        (code) => {
          setIsAddonLoading(false);
          // clearPreferences();
          setQuantity(1);
          updateAddonQuantity(addon.Code, -(cartItem.quantity - 1));
          // setCartItemCode(code)
          // setExpandedSection("addons")
          // toast.success(code)
        },
        null,
        (error) => {
          setIsAddonLoading(false);
          setCartItemCode(0);
          // toast.error(error)
        }
      )
    );
  };

  const [selectepreferenceLsit, setselectepreferenceLsit] = useState([]);

  const handlePreferenceChange = (newPreferences) => {
    setselectepreferenceLsit([...newPreferences]);
    // Format preferences as a comma-separated string
    const preferencesString = newPreferences.join(" ");
    setSelectedPreferences(preferencesString);
  };

  if (!food) {
    // toast.success("sv")
    return <LoadingSkeleton isOpen={isOpen} onClose={onClose} />;
  }

  return (
    <Modal title="Item Details" isOpen={isOpen} onClose={onClose}>
      <div className="flex min-h-[calc(100vh-150px)]  flex-col space-y-4">
        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6 bg-gray-50  p-6 rounded-lg">
          {/* Image */}
          <div className="col-span-2">
            <div className="aspect-square rounded-lg overflow-hidden shadow-md">
              <img
                src={`${IMAGE_BASE_URL}/SKU/${food.Code}.jpg`}
                alt={food.SubSkuName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="col-span-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-xl font-bold">{food.SubSkuName}</h2>
              <p className="text-sm text-gray-600  line-clamp-2">
                {food.Details}
              </p>
              {(food.Remark1 || food.Remark2) && (
                <div className="text-sm text-gray-500">
                  {food.Remark1 && (
                    <p className="line-clamp-1">{food.Remark1}</p>
                  )}
                  {food.Remark2 && (
                    <p className="line-clamp-1">{food.Remark2}</p>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Tabs */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => toggleSection("preferences")}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg flex items-center space-x-2 transition-colors ${
                  expandedSection === "preferences"
                    ? "bg-green-600 text-white shadow-md hover:bg-green-700"
                    : "bg-gray-200  hover:bg-gray-300 "
                }`}
              >
                <span>Preferences</span>
                {expandedSection === "preferences" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => toggleSection("addons")}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg flex items-center space-x-2 transition-colors ${
                  expandedSection === "addons"
                    ? "bg-green-600 text-white shadow-md hover:bg-green-700"
                    : "bg-gray-200  hover:bg-gray-300 "
                }`}
              >
                <span>Add-ons</span>
                {expandedSection === "addons" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Price and Cart Controls */}
          <div className="col-span-4 flex flex-col justify-between">
            {food.Rate > 0 ? (
              <div className="text-2xl font-bold text-green-600 ">
                {Currency} {parseFloat(food?.Rate * quantity).toFixed(2)}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-lg">{Currency}</span>
                <input
                  type="number"
                  value={editedRate}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setEditedRate(
                      inputValue === "" ? "" : parseFloat(inputValue) || 0
                    );
                  }}
                  onFocus={() => {
                    if (editedRate === 0) setEditedRate("");
                  }}
                  onBlur={() => {
                    if (editedRate === "" || editedRate === null)
                      setEditedRate(0);
                  }}
                  className="w-24 h-10 border rounded-lg px-3 text-lg  focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full bg-gray-200  disabled:opacity-50 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(1)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300  flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={loading || (food.Rate === 0 && editedRate === 0)}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 text-lg font-medium shadow-md transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{loading ? "Adding..." : "Add to Cart"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Sections */}
        {expandedSection && (
          <div className="bg-white rounded-lg p-3">
            {expandedSection === "preferences" ? (
              <div className="max-h-48 overflow-y-auto">
                <KotNoteSelection
                  packingPreferences={
                    food.PackingPreference == 1 ? packingPreference : []
                  }
                  selectedList={selectepreferenceLsit}
                  clearTrigger={clearPrefTrigger}
                  onPreferenceChange={handlePreferenceChange}
                  Prefferences={food.prefereces}
                />
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {addOns && addOns.length > 0 ? (
                  <div className="space-y-2">
                    {cartItemCode != 0 && (
                      <div className="text-xs bg-blue-100  text-blue-800  p-2 rounded">
                        Add-on item will be added to the recently added item!
                      </div>
                    )}

                    {addOns.map((addon) => (
                      <div
                        key={addon.Code}
                        className="flex items-center justify-between p-2 bg-gray-50  rounded"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={`${IMAGE_BASE_URL}/SKU/${addon.Code}.jpg`}
                            alt={addon.SubSkuName}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {addon.SubSkuName}
                            </p>
                            <p className="text-green-600 dark:text-green-400 text-xs">
                              {Currency} {addon.Rate}
                            </p>
                          </div>
                        </div>

                        {cartItemCode != 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  updateAddonQuantity(addon.Code, -1)
                                }
                                className="p-1 hover:bg-gray-200  rounded-full"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-sm">
                                {addonQuantities[addon.Code] || 1}
                              </span>
                              <button
                                onClick={() =>
                                  updateAddonQuantity(addon.Code, 1)
                                }
                                className="p-1 hover:bg-gray-200  rounded-full"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleAddonCart(addon)}
                              disabled={isAddonLoading}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded flex items-center gap-1 text-xs"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>
                                {isAddonLoading ? "Adding..." : "Add"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-red-500 text-sm">
                    No add-on items available
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Related Items */}
        <div className="mt-2">
          <ReleatedList relatedProducts={relatedItems} />
        </div>
      </div>
    </Modal>
  );
};

export default MenuDetailModal;
