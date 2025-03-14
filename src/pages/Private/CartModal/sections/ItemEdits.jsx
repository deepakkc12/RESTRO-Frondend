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
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
          rounded-full border-2 transition-colors ease-in-out duration-200
          ${
            isPending
              ? "bg-yellow-500 border-yellow-500"
              : "bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white 
            shadow ring-0 transition duration-200 ease-in-out
            ${isPending ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
};

const TakeAwayToggle = ({ isTakeAway, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
          rounded-full border-2 transition-colors ease-in-out duration-200
          ${
            isTakeAway
              ? "bg-blue-500 border-blue-500"
              : "bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white 
            shadow ring-0 transition duration-200 ease-in-out
            ${isTakeAway ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
};

const ItemHeader = ({ item, isAddonItem, toggleItemDetails }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigate = () => {
    navigate(`/menu-detail/${item.SubSkuCode}`, {
      state: { item: item.KOTNo == 0 ? item : null },
    });
    dispatch(CloseCARTModal());
  };

  return (
    <div className="flex items-center">
      <h4
        onClick={handleNavigate}
        className="font-medium cursor-pointer mr-2 flex items-center"
      >
        {isAddonItem(item) && (
          <span className=" text-xs bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200 px-2 rounded-full flex items-center">
            Add-on
          </span>
        )}
        {item?.SkuName}
        
        <span>
          {item.IsComplementary === 1 && (
            <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-200 px-2 rounded-full flex items-center">
              {item.ComplementaryDetails}
            </span>
          )}
        </span>

      </h4>

      {!isAddonItem(item)&&<button
        onClick={() => toggleItemDetails(item.Code)}
        className="text-gray-500 hover:text-blue-500 transition-colors ml-2"
      >
        <Info size={16} />
      </button>}
    </div>
  );
};

const ItemPrice = ({ item }) => (
  <p className="text-sm text-gray-600 dark:text-gray-300">
    Rate: {Currency} {parseFloat(item.Rate || "0").toFixed(2)} | Total:{" "}
    {Currency}{" "}
    {(parseFloat(item.Rate || "0") * (parseInt(item.Qty) || 1)).toFixed(2)}
  </p>
);

const QuantityControls = ({ itemCode, quantity, onUpdateQuantity }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onUpdateQuantity(itemCode, -1, parseInt(quantity))}
      className="p-1 font-bold rounded-full hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300"
    >
      -
    </button>
    <span className="min-w-[2rem] text-center">{parseInt(quantity) || 1}</span>
    <button
      onClick={() => onUpdateQuantity(itemCode, 1, parseInt(quantity))}
      className="p-1 font-bold rounded-full hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300"
    >
      +
    </button>
  </div>
);

const EditableItemControls = ({ item, onUpdateQuantity, onRemoveItem,isAddon=false }) => {
  const dispatch = useDispatch();
  const { isBillPrintFirst, isTokenBased,isKotBased, loading } = useSelector(
    (state) => state.settings
  );
  return (
    <div className="flex items-center gap-2 mt-2 justify-end">
      <QuantityControls
        itemCode={item.Code}
        quantity={item.Qty}
        onUpdateQuantity={onUpdateQuantity}
      />
      {item.KOTNo !== "-1" && !isAddon && (
        <>
          {isKotBased&&<div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Pending
            </span>
            <PendingToggle
              isPending={item.isPending || false}
              onToggle={() =>{

                dispatch(updateItemPendingStatus(item.Code, !item.isPending))
                // dispatch(fetchCart())

              }
              }
            />
          </div>}
          {isKotBased&&<div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Take Away
            </span>
            <TakeAwayToggle
              isTakeAway={item.TakeAway || false}
              onToggle={() =>{
                dispatch(updateItemTakeAwayStatus(item.Code, !item.TakeAway))
              }
              }
            />
          </div>}
        </>
      )}
      <button
        onClick={() => onRemoveItem(item.Code)}
        className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
      >
        <Trash size={16} />
      </button>
    </div>
  );
};

const ReadOnlyItemControls = ({ item, onRemoveItem }) => {
  const user = useSelector((state) => state.auth.user);

  const hasDeletePrivilege = hasPrivilege(
    user.privileges,
    userPrivileges.delete_kot
  );

  return (
    <div className="flex items-center gap-3 mt-2 justify-end">
      <span className="min-w-[2rem] text-center">
        Qty: {parseInt(item.Qty) || 1}
      </span>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {item.TakeAway ? "-Take Away-" : ""}
        </span>
      </div>
      {hasDeletePrivilege && (
        <button
          onClick={() => onRemoveItem(item.Code)}
          className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
        >
          <Trash size={16} />
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
}) => {
  const addonItems =
    items?.filter((i) => i.AddOnCode == item.Code && i.Code != item.Code) || [];

  return (
    <div
      className={`rounded-lg p-3 mb-3 shadow-sm
      ${
        item.isPending
          ? "bg-yellow-50 dark:bg-yellow-900/20"
          : "bg-white dark:bg-gray-700"
      }
    `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <ItemHeader
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
     {addonItems.length>0&& <div className="pl-5 mt-1">
        {/* <p className="">Addon Items</p> */}
        {addonItems.map((addon) => (
          <div className="flex items-center justify-between">
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
        ))}
      </div>}
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
