import React from 'react';
import { Printer, ChevronDown, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { CloseRePrintKotModal } from '../../redux/RePrintKotModal/action';
import { postRequest } from '../../services/apis/requests';
import { useToast } from '../../hooks/UseToast';

const ReprintKOTModal = ({   kotItems,masterId  }) => {
  const [selectedKOTs, setSelectedKOTs] = React.useState({});
  const [expandedKOTs, setExpandedKOTs] = React.useState({});

  const {isOpen} = useSelector(state=>state.rePrintKotModal)

  const dispatch = useDispatch()

  const toast = useToast()
  if (!isOpen) return null;



const onReprint=async(items,kotNums)=>{

    console.log(items)
    // return

    const nonPrinterItems = items.filter(item=>item.KotPrinter=="")
    if(nonPrinterItems.length>0){
        toast.error(`kotNumber - ${nonPrinterItems[0].KOTNo} items has no Printer to reprint`)
        return
    }
    // return
    const body = {kotNums:kotNums}
    const response =await postRequest(`kot/${masterId}/reprint-kot/`,body)
    if(response.success){
        toast.success("Reprint send to kitchen")
    }else{
        toast.error("failed to reprint")
    }
    console.log(selectedKOTs)
}

  const onClose = ()=>{
    dispatch(CloseRePrintKotModal())
  }
  // Group items by KOT number
  const groupedItems = kotItems.reduce((acc, item) => {
    const kotNo = item.KOTNo || 'Unassigned';
    if (!acc[kotNo]) {
      acc[kotNo] = [];
    }
    acc[kotNo].push(item);
    return acc;
  }, {});

  const handleSelectKOT = (kotNo) => {
    setSelectedKOTs(prev => ({
      ...prev,
      [kotNo]: !prev[kotNo]
    }));
  };

  const handleToggleExpand = (kotNo) => {
    setExpandedKOTs(prev => ({
      ...prev,
      [kotNo]: !prev[kotNo]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.keys(groupedItems).length === Object.keys(selectedKOTs).length && 
      Object.values(selectedKOTs).every(value => value);

    const newSelection = {};
    Object.keys(groupedItems).forEach(kotNo => {
      newSelection[kotNo] = !allSelected;
    });
    setSelectedKOTs(newSelection);
  };

  const handleReprint = () => {
    const itemsToReprint = Object.entries(selectedKOTs)
      .filter(([_, isSelected]) => isSelected)
      .flatMap(([kotNo]) => groupedItems[kotNo]);
      
      const kotNums =  Object.keys(selectedKOTs).map(key => parseInt(key))
      console.log(itemsToReprint)
      onReprint(itemsToReprint,kotNums);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg dark:text-white font-semibold">Reprint KOT Items</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600"
                checked={
                  Object.keys(groupedItems).length === Object.keys(selectedKOTs).length && 
                  Object.values(selectedKOTs).every(value => value)
                }
                onChange={handleSelectAll}
              />
              <span className="text-sm  dark:text-white font-medium">Select All KOTs</span>
            </label>
          </div>
          
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([kotNo, items]) => (
              <div key={kotNo} className="border dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600"
                    checked={selectedKOTs[kotNo] || false}
                    onChange={() => handleSelectKOT(kotNo)}
                  />
                  <button
                    onClick={() => handleToggleExpand(kotNo)}
                    className="flex items-center flex-1  dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                  >
                    {expandedKOTs[kotNo] ? (
                      <ChevronDown size={16} className="mr-2" />
                    ) : (
                      <ChevronRight size={16} className="mr-2" />
                    )}
                    <span className="text-sm font-medium">
                      KOT #{kotNo} ({items.length} items)
                    </span>
                  </button>
                </div>
                
                {expandedKOTs[kotNo] && (
                  <div className="mt-2 pl-8 space-y-2">
                    {items.map((item) => (
                      <div key={item.Code} className="text-sm text-gray-600 dark:text-gray-400">
                        {item.SkuName} (Qty: {item.Qty})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleReprint}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <Printer size={16} className="mr-2" />
            Reprint Selected
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReprintKOTModal