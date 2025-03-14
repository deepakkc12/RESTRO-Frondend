import React from 'react'
import { IMAGE_BASE_URL } from '../../../utils/constants'
import { useNavigate } from 'react-router-dom'

function ReleatedList({relatedProducts}) {
    const navigate = useNavigate()
  return (
    <div>
      <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Preferable Combos</h2>
              <div  className="flex space-x-4 overflow-x-auto hide-scrollbar">
                {relatedProducts.map((product, index) => (
                  <div onClick={()=>{navigate( `/menu-detail/${product.Code}`)}} key={index} className="cursor-pointer flex-none w-48">
                    <div className="bg-gray-200 dark:bg-gray-800 w-full h-32 rounded-lg mb-2">
                      <img 
                        src={`${IMAGE_BASE_URL}SKU/${product.Code}.jpg`}
                        alt={product.SkuName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="font-medium">{product.SkuName}</h3>
                    {/* <p className="text-green-600 dark:text-green-500">${product.price}</p> */}
                  </div>
                ))}
              </div>
            </div>
    </div>
  )
}

export default ReleatedList
