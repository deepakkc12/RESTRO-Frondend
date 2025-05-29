import NumericKeyboard from "../../../Features/KeyBoards/NumberKeyboard";

import KotTypeSelector from "../../../Features/modals/KotTypeSelector";
import SplitBill from "../../../Features/modals/SplitBill";
import MenuDetailHeader from "../../../components/Headers/MenuDetailHeader";
import { useToast } from "../../../hooks/UseToast";
import { addItemToCart } from "../../../redux/cart/actions";
import { CloseCARTModal } from "../../../redux/cartMoodal/action";
import { openNewOrderModal } from "../../../redux/newOrder/action";
import { getRequest } from "../../../services/apis/requests";
import { Currency, IMAGE_BASE_URL, KOT_TYEPES } from "../../../utils/constants";
import ReleatedList from "./ReleatedList";
import KotNoteSelection from "./Sections/KotNoteSelection";
import PackingPreference from "./Sections/PackingPreferences";
import PreferencesSection from "./Sections/PrefferenceSelection";
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

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ">
      <MenuDetailHeader name={""} />

      <div className="container animate-pulse mt-14 mx-auto px-4 pb-32 lg:max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section - Loading Skeleton */}
          <div className="lg:w-1/2 space-y-6">
            <div className="flex flex-row md:flex-col gap-4 md:gap-1">
              <div className="w-1/2 md:w-full md:h-full h-1/2 aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Right Section - Loading Skeleton */}
          <div className="lg:w-1/2 space-y-6">
            {/* Main Loading Section */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-40"></div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
              </div>

              {/* Quantity and Add to Cart Loading */}
              <div className="flex sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-6 w-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-12 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>

            {/* Expandable Sections Loading */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>

            {/* Preferences Loading */}
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuDetailView = () => {
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

  // console.log(kotType)
  const { skuId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const item = location.state?.item || null;

  useEffect(() => {
    // console.log(item);
    if (item) {
      setCartItemCode(item?.Code);

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
        console.log(response.data);
      } else {
        navigate('/menu');
        setFood(null);

      }
    } catch (error) {
      navigate('/menu');
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
    // try {
    //   const response = await getRequest(`menu/${skuId}/related/`);
    //   if (response.success) {
    //     setRelatedItems(response.data || []);
    //   } else {
    //     setRelatedItems([]);
    //   }
    // } catch (error) {
    //   console.error("Error fetching related items:", error);
    //   setRelatedItems([]);
    // }
    setRelatedItems([]);
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

      console.log(cartItem);

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
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <MenuDetailHeader name={food.SubSkuName} />
      <div className="container mx-auto px-4 mt-5 pb-32 overflow-y-auto ">
        <div className="flex w-full flex-col md:flex-row   gap-8">
          {/* Left Section - Main Details */}

          <div className="w-1/2  space-y-6 max-h-[calc(100vh-90px)]">
            <div className="flex flex-row md:flex-col gap-4 md:gap-1">
              <div className="w-full h-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={`${IMAGE_BASE_URL}/SKU/${food.Code}.jpg`}
                  alt={food.SubSkuName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{food.SubSkuName}</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {food.Details}
                </p>
              </div>
            </div>

            {(food.Remark1 || food.Remark2) && (
              <div className="space-y-2">
                {food.Remark1 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {food.Remark1}
                  </p>
                )}
                {food.Remark2 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {food.Remark2}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Section - Preferences and Add-ons */}
          <div className="l  space-y-6 max-h-[calc(100vh-90px)] w-full overflow-y-auto ">
            {/* Main Add to Cart Section - Now on Top */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex flex-col">
                      <span className="text-green-600 text-sm dark:text-green-400">
                        {food?.SkuName || "None"}
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {food?.SubSkuName || "None"}
                      </span>
                    </div>
                  </h3>
                </div>
                {food.Rate > 0 ? (
                  <div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Currency} {parseFloat(food?.Rate * quantity).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      Enter price
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Currency}
                      </span>
                      <input
                        type="number"
                        onMouseDown={() => {
                          // On focus, if the value is `0`, clear the input (set it to an empty string).
                          if (editedRate === 0) {
                            setEditedRate("");
                          }
                        }}
                        onFocus={() => {
                          // On focus, if the value is `0`, clear the input (set it to an empty string).
                          if (editedRate === 0) {
                            setEditedRate("");
                          }
                        }}
                        onBlur={() => {
                          // On blur, if the input is empty, set the value to `0`.
                          if (editedRate === "" || editedRate === null) {
                            setEditedRate(0);
                          }
                        }}
                        value={editedRate}
                        onChange={(e) => {
                          // Update the value as the user types, ensuring it's always numeric or empty.
                          const inputValue = e.target.value;
                          setEditedRate(
                            inputValue === "" ? "" : parseFloat(inputValue) || 0
                          );
                        }}
                        className="border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex  sm:flex-row items-center justify-between gap-2  sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <button
                    className="w-10 h-10 flex justify-center items-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-8 h-8" />
                  </button>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 flex justify-center items-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => updateQuantity(1)}
                  >
                    <Plus className="w-8 h-8" />
                  </button>
                </div>

                <button
                  className={`w-full sm:w-auto flex items-center justify-center space-x-2 ${
                    food.Rate > 0
                      ? "bg-green-600 hover:bg-green-700"
                      : editedRate == 0
                      ? "bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }  text-white px-5 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500`}
                  onClick={handleAddToCart}
                  disabled={loading}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {loading ? <span>Adding...</span> : <span>Add</span>}
                </button>
              </div>
            </div>

            {/* Expandable Sections Navigation */}
            <div
              className={`grid ${
                food.PackingPreference == 1 ? "grid-cols-2" : "grid-cols-2"
              } gap-4 mb-4`}
            >
              {/* Preferences Button */}
              <button
                onClick={() => toggleSection("preferences")}
                className={`flex items-center justify-center py-3 rounded-lg transition-all duration-300 ${
                  expandedSection === "preferences"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <span className="mr-2">Preferences</span>
                {expandedSection === "preferences" ? (
                  <ChevronUp />
                ) : (
                  <ChevronDown />
                )}
              </button>
              <button
                onClick={() => toggleSection("addons")}
                className={`flex items-center justify-center py-3 rounded-lg transition-all duration-300 ${
                  expandedSection === "addons"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <span className="mr-2">Add-ons</span>
                {expandedSection === "addons" ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>

            {expandedSection === "preferences" && (

              <KotNoteSelection
                packingPreferences={
                  food.PackingPreference == 1 ? packingPreference : []
                }
                selectedList={selectepreferenceLsit}
                clearTrigger={clearPrefTrigger}
                onPreferenceChange={handlePreferenceChange}
                Prefferences={food.prefereces}
              />
            )}

            {expandedSection === "addons" &&
              (addOns && addOns.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto ">
                  {cartItemCode != 0 && (
                    <div className="p-3 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg">
                      Addon item will be add to the recently added item!
                    </div>
                  )}
                  {addOns.map((addon, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={`${IMAGE_BASE_URL}/SKU/${addon.Code}.jpg`}
                          alt={addon.SubSkuName}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <span>{addon.SubSkuName}</span>
                        <span className="text-green-600 dark:text-green-500">
                          {Currency + " "} {addon.Rate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {cartItemCode != 0 && (
                          <div className="flex items-center space-x-2 mr-4">
                            <button
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                              onClick={() =>
                                updateAddonQuantity(addon.Code, -1)
                              }
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <span className="w-8 text-center">
                              {addonQuantities[addon.Code] || 1}
                            </span>
                            <button
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                              onClick={() => updateAddonQuantity(addon.Code, 1)}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {cartItemCode !== 0 && (
                          <button
                            className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                              isAddonLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 text-white"
                            }`}
                            disabled={isAddonLoading}
                            onClick={async () => {
                              handleAddonCart(addon); // Perform the async operation
                            }}
                          >
                            {isAddonLoading ? (
                              <div className="flex items-center">
                                Adding...
                              </div>
                            ) : (
                              <>
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-red-500">No Addon items</p>
              ))}
          </div>
        </div>
        <div className="mt-3">
          <ReleatedList relatedProducts={relatedItems} />
        </div>
      </div>
      <KotTypeSelector />
      <NumericKeyboard variant="right" />
      <SplitBill />
    </div>
  );
};

export default MenuDetailView;
