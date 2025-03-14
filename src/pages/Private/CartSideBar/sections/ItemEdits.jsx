import {
  fetchCart,
  updateItemPendingStatus,
  updateItemTakeAwayStatus,
} from "../../../../redux/cart/actions";
import { CloseCARTModal } from "../../../../redux/cartMoodal/action";
import { Currency, userPrivileges } from "../../../../utils/constants";
import { hasPrivilege } from "../../../../utils/helper";
import { Info, Trash } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const PendingToggle = ({ isPending, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer 
          rounded-full border transition-colors ease-in-out duration-200
          ${
            isPending
              ? "bg-yellow-500 border-yellow-500"
              : "bg-gray-200 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
          }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white 
            shadow ring-0 transition duration-200 ease-in-out
            ${isPending ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
};

const TakeAwayToggle = ({ isTakeAway, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer 
          rounded-full border transition-colors ease-in-out duration-200
          ${
            isTakeAway
              ? "bg-blue-500 border-blue-500"
              : "bg-gray-200 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
          }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white 
            shadow ring-0 transition duration-200 ease-in-out
            ${isTakeAway ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
};

const ItemHeader = ({ item, isAddonItem, toggleItemDetails,setSelectedCartItem,setSelectedItem,openMenuModal   }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigate = () => {
    setSelectedItem(item)
    setSelectedCartItem(item.KOTNo == 0 ? item : null)
    openMenuModal()
    // navigate(`/menu-detail/${item.SubSkuCode}`, {
    //   state: { item: item.KOTNo == 0 ? item : null },
    // });
    // dispatch(CloseCARTModal());
  };

  return (
    <div className="flex items-center flex-wrap gap-1.5">
      <h4
        onClick={handleNavigate}
        className="font-medium cursor-pointer flex items-center flex-wrap gap-1.5 text-sm"
      >
        {isAddonItem(item) && (
          <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200 px-1.5 py-0.5 rounded-full inline-flex items-center">
            Add-on
          </span>
        )}
        <span className="flex-1 min-w-0 truncate">{item?.SkuName}</span>
        
        {item.IsComplementary === 1 && (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-200 px-1.5 py-0.5 rounded-full inline-flex items-center">
            {item.ComplementaryDetails}
          </span>
        )}
      </h4>

      {!isAddonItem(item) && (
        <button
          onClick={() => toggleItemDetails(item.Code)}
          className="text-gray-500 hover:text-blue-500 transition-colors"
        >
          <Info size={14} />
        </button>
      )}
    </div>
  );
};

const ItemPrice = ({ item }) => (
  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
    Rate: {Currency} {parseFloat(item.Rate || "0").toFixed(2)} | Total:{" "}
    {Currency} {(parseFloat(item.Rate || "0") * (parseInt(item.Qty) || 1)).toFixed(2)}
  </p>
);

const QuantityControls = ({ itemCode, quantity, onUpdateQuantity }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onUpdateQuantity(itemCode, -1, parseInt(quantity))}
      className="p-1 w-6 h-6 text-lg font-semibold rounded-full 
                 bg-gray-100 dark:bg-gray-700  flex items-center justify-center
                 hover:bg-gray-200 dark:hover:bg-gray-600 
                 text-gray-700 dark:text-gray-200 
                 transition-all"
    >
      −
    </button>
    <span className="min-w-[2rem] text-center text-base font-medium">
      {parseInt(quantity) || 1}
    </span>
    <button
      onClick={() => onUpdateQuantity(itemCode, 1, parseInt(quantity))}
      className="p-1 w-6 h-6 text-lg font-semibold rounded-full 
                 bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                 hover:bg-gray-200 dark:hover:bg-gray-600 
                 text-gray-700 dark:text-gray-200 
                 transition-all"
    >
      +
    </button>
  </div>
);


const EditableItemControls = ({ item, onUpdateQuantity, onRemoveItem, isAddon = false }) => {
  const dispatch = useDispatch();
  const { isKotBased } = useSelector((state) => state.settings);
  
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 justify-between">
      
      {item.KOTNo !== "-1" && !isAddon && isKotBased && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Pending
            </span>
            <PendingToggle
              isPending={item.isPending || false}
              onToggle={() => {
                dispatch(updateItemPendingStatus(item.Code, !item.isPending));
              }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Take Away
            </span>
            <TakeAwayToggle
              isTakeAway={item.TakeAway || false}
              onToggle={() => {
                dispatch(updateItemTakeAwayStatus(item.Code, !item.TakeAway));
              }}
            />
          </div>
        </div>
      )}
      <QuantityControls
        itemCode={item.Code}
        quantity={item.Qty}
        onUpdateQuantity={onUpdateQuantity}
      />
      <button
        onClick={() => onRemoveItem(item.Code)}
        className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
      >
        <Trash size={14} />
      </button>
    </div>
  );
};

const ReadOnlyItemControls = ({ item, onRemoveItem }) => {
  const user = useSelector((state) => state.auth.user);
  const hasDeletePrivilege = hasPrivilege(user.privileges, userPrivileges.delete_kot);

  return (
    <div className="flex items-center gap-2 mt-2 justify-end flex-wrap">
      <span className="min-w-[1.5rem] text-center text-sm">
        Qty: {parseInt(item.Qty) || 1}
      </span>
      {item.TakeAway && (
        <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">
          Take Away
        </span>
      )}
      {hasDeletePrivilege && (
        <button
          onClick={() => onRemoveItem(item.Code)}
          className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
        >
          <Trash size={14} />
        </button>
      )}
    </div>
  );
};

const CartItem = ({
  item,
  items,
  isEditable,
  isAddonItem,
  expandedItems,
  toggleItemDetails,
  renderItemDetails,
  onUpdateQuantity,
  onRemoveItem,
  setSelectedCartItem,setSelectedItem,openMenuModal
}) => {
  const addonItems = items?.filter((i) => i.AddOnCode == item.Code && i.Code != item.Code) || [];

  return (
    <div
      className={`rounded-lg p-2.5 mb-2 shadow-sm
      ${
        item.isPending
          ? "bg-yellow-50 dark:bg-yellow-900/20"
          : "bg-white dark:bg-gray-700"
      }
    `}
    >
      <div className="flex flex-col">
        <div className="flex-1 flex justify-between">
          <ItemHeader
          openMenuModal={openMenuModal}
          setSelectedCartItem={setSelectedCartItem}
          setSelectedItem={setSelectedItem}
            item={item}
            isAddonItem={isAddonItem}
            toggleItemDetails={toggleItemDetails}
          />
          <ItemPrice item={item} />
        </div>
        {isEditable ? (
          <EditableItemControls
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        ) : (
          <ReadOnlyItemControls onRemoveItem={onRemoveItem} item={item} />
        )}
      </div>
      
      {expandedItems[item.Code] && renderItemDetails(item)}
      
      {addonItems.length > 0 && (
        <div className="pl-4 mt-2 border-l-2 border-gray-100 dark:border-gray-600">
          {addonItems.map((addon) => (
            <div key={addon.Code} className="mb-2 last:mb-0">
              <div className="flex flex-col">
                <div className="flex-1">
                  <ItemHeader
                    item={addon}
                    isAddonItem={isAddonItem}
                    toggleItemDetails={toggleItemDetails}
                  />
                  <ItemPrice item={addon} />
                </div>
                {isEditable ? (
                  <EditableItemControls
                    isAddon={isAddonItem(addon)}
                    item={addon}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                  />
                ) : (
                  <ReadOnlyItemControls onRemoveItem={onRemoveItem} item={addon} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export {
  CartItem,
  ItemHeader,
  ItemPrice,
  QuantityControls,
  EditableItemControls,
  ReadOnlyItemControls,
  PendingToggle,
  TakeAwayToggle,
};