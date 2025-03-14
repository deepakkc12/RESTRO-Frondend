import React from 'react';
import { ShoppingCart, ListOrdered, Info, Plus, Gift, ShoppingBasket, Delete, Trash } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart, updateItemPendingStatus, updateItemTakeAwayStatus } from '../../../redux/cart/actions';
import { Currency, Seperate_packing_code, userPrivileges } from '../../../utils/constants';
import { openSplitBillModal } from '../../../redux/spliBillModal/action';
import { openRePrintKotModal } from '../../../redux/RePrintKotModal/action';
import { useLocation } from 'react-router-dom';
import { hasPrivilege } from '../../../utils/helper';
import { CartItem } from './sections/ItemEdits';



const CartItemList = ({
  withKOT = [],
  withoutKOT = [],
  expandedItems = {},
  toggleItemDetails,
  renderItemDetails,
  onUpdateQuantity,
  onRemoveItem,
  SeperatePack,
  isAddonItem,
  openComplementaryModal,
  user
}) => {

  const dispatch = useDispatch();

  const SectionHeader = ({ title, icon, isKOT }) => {
    const hasReprintPrivilege = hasPrivilege(user.privileges, userPrivileges.reprint_kot);

    
    return (
      <div className='flex mb-3 justify-between'>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          {icon && React.createElement(icon, { 
            size: 18, 
            className: `mr-2 ${isKOT ? 'text-blue-500' : 'text-green-500'}` 
          })}
          {title}
        </h3>
        {isKOT && hasReprintPrivilege && (
          <button 
            onClick={() => dispatch(openRePrintKotModal())} 
            className='text-sm bg-green-100 rounded-md py-1 px-2 border-green-600 text-green-600'
          >
            Reprint Kot
          </button>
        )}
      </div>
    );
  };
  const renderItems = (items, title, icon, isKOT = false,isKotBased,totalItems) => {
    if (items.length === 0) return null;
    



    return (
      <div className={isKOT ? "mb-4" : ""}>
        {(title || icon) && <SectionHeader title={title} icon={icon} isKOT={isKOT} />}
        {items.map((item) => 
          item.SubSkuCode === Seperate_packing_code ? (
            <SeperatePack key="separate-pack" />
          ) : (
           !isAddonItem(item)&& <CartItem
              key={item.Code}
              items = {[...withKOT,...withoutKOT]}
              item={item}
              isEditable={!isKotBased || item.KOTNo === '-1' || !isKOT}
              isAddonItem={isAddonItem}
              expandedItems={expandedItems}
              toggleItemDetails={toggleItemDetails}
              renderItemDetails={renderItemDetails}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
            />
          )
        )}
      </div>
    );
  };
  const handleImportKot = () => {
    dispatch(openSplitBillModal())
  }

  const EmptyCartState = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className='flex items-center mb-4 gap-4'>
        <ShoppingBasket size={64} className="text-gray-400 dark:text-gray-600" />
        {/* <button
          onClick={handleImportKot}
          className="flex items-center justify-center p-2 rounded-md bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition duration-300 shadow-lg"
        >
          Import Kot
        </button> */}
      </div>
      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
        Your cart is empty
      </h3>
      <div className='flex items-center mb-4 justify-between'>
        <p className="text-gray-500 dark:text-gray-500 text-center">
          Add items to your cart to get started
        </p>
      </div>
    </div>
  );

  if (withKOT.length === 0 && withoutKOT.length === 0) {
    return <EmptyCartState />;
  }

  const handelSeperatePacking = () => {
    dispatch(addItemToCart({sub_sku_code:Seperate_packing_code, is_addon:false, quantity:0, preferences:""}));
  }

  const filteredWithKOT = withKOT.filter(item => !item.isPending);
  const filteredWithoutKOT = withoutKOT.filter(item => !item.isPending);
  const pendingItems = [...withKOT, ...withoutKOT].filter(item => item.isPending);
  const { isBillPrintFirst, isTokenBased,isKotBased, loading } = useSelector(
    (state) => state.settings
  );
  return (
    <>
      {renderItems(filteredWithKOT, "KOT Items", ListOrdered, true,isKotBased)}
      {renderItems(filteredWithoutKOT, "Non-KOT Items", ShoppingCart,false,isKotBased)}
      
      {pendingItems.length > 0 && (
        <div className="mt-4 dark:bg-yellow-900/20 rounded-lg">
          {renderItems(pendingItems, "", null,false,isKotBased)}
        </div>
      )}
      
      {withoutKOT.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handelSeperatePacking}
            className="bg-yellow-100 dark:bg-yellow-700 text-yellow-600 dark:text-yellow-200 px-2 py-1 rounded-full text-sm flex items-center hover:bg-yellow-200 dark:hover:bg-yellow-600 transition-colors"
          >
            <Plus size={12} className="mr-1" /> Add Separate Packing
          </button>
        </div>
      )}
    </>
  );
};

export default CartItemList;