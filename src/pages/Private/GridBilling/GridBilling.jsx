// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { AgGridReact } from 'ag-grid-react';

// // Importing AG Grid styles
// // import 'ag-grid-community/styles/ag-grid.css';
// // import 'ag-grid-community/styles/ag-theme-alpine.css';

// // Mock product data with variants
// const INITIAL_PRODUCTS = [
//   {
//     id: 1,
//     name: 'Margherita Pizza',
//     basePrice: 10.99,
//     category: 'Pizza',
//     variants: [
//       { name: 'Small', multiplier: 1 },
//       { name: 'Medium', multiplier: 1.2 },
//       { name: 'Large', multiplier: 1.5 }
//     ],
//     currentVariantIndex: 0
//   },
//   {
//     id: 2,
//     name: 'Pepperoni Pizza',
//     basePrice: 12.99,
//     category: 'Pizza',
//     variants: [
//       { name: 'Small', multiplier: 1 },
//       { name: 'Medium', multiplier: 1.2 },
//       { name: 'Large', multiplier: 1.5 }
//     ],
//     currentVariantIndex: 0
//   },
//   {
//     id: 3,
//     name: 'Coca Cola',
//     basePrice: 2.50,
//     category: 'Drinks',
//     variants: [
//       { name: '250ml', multiplier: 1 },
//       { name: '500ml', multiplier: 1.5 }
//     ],
//     currentVariantIndex: 0
//   }
// ];

// const GridBillingSystem = () => {
//   const [products, setProducts] = useState(INITIAL_PRODUCTS);
//   const [cartItems, setCartItems] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedProductIndex, setSelectedProductIndex] = useState(0);
//   const gridRef = useRef(null);
//   const searchInputRef = useRef(null);

//   // Filter products based on search term
//   const filteredProducts = products.filter(product => 
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Column definitions for product grid
//   const productColumns = [
//     { 
//       headerName: 'Product', 
//       field: 'name', 
//       flex: 2,
//       cellStyle: (params) => ({
//         backgroundColor: params.rowIndex === selectedProductIndex 
//           ? '#e0e0e0' 
//           : 'transparent'
//       })
//     },
//     { 
//       headerName: 'Variant', 
//       field: 'variants', 
//       valueFormatter: (params) => {
//         const product = params.data;
//         return product.variants[product.currentVariantIndex].name;
//       },
//       flex: 1
//     },
//     { 
//       headerName: 'Price', 
//       field: 'basePrice', 
//       valueFormatter: (params) => {
//         const product = params.data;
//         const variant = product.variants[product.currentVariantIndex];
//         return `$${(product.basePrice * variant.multiplier).toFixed(2)}`;
//       },
//       flex: 1
//     }
//   ];

//   // Column definitions for cart grid
//   const cartColumns = [
//     { headerName: 'Product', field: 'name', flex: 2 },
//     { headerName: 'Variant', field: 'variant', flex: 1 },
//     { 
//       headerName: 'Quantity', 
//       field: 'quantity', 
//       editable: true,
//       flex: 1
//     },
//     { 
//       headerName: 'Price', 
//       field: 'price',
//       valueFormatter: (params) => `$${params.value.toFixed(2)}`,
//       flex: 1
//     }
//   ];

//   // Handle keyboard navigation and actions
//   const handleKeyDown = useCallback((event) => {
//     if (!searchInputRef.current || document.activeElement !== searchInputRef.current) {
//       return;
//     }

//     switch(event.key) {
//       case 'ArrowDown':
//         event.preventDefault();
//         setSelectedProductIndex(prev => 
//           Math.min(prev + 1, filteredProducts.length - 1)
//         );
//         break;
//       case 'ArrowUp':
//         event.preventDefault();
//         setSelectedProductIndex(prev => Math.max(prev - 1, 0));
//         break;
//       case 'Control':
//         // Cycle through variants
//         setProducts(prev => prev.map((product, index) => {
//           if (index === selectedProductIndex) {
//             return {
//               ...product,
//               currentVariantIndex: (product.currentVariantIndex + 1) % product.variants.length
//             };
//           }
//           return product;
//         }));
//         break;
//       case 'Enter':
//         // Add selected product to cart
//         const selectedProduct = filteredProducts[selectedProductIndex];
//         const selectedVariant = selectedProduct.variants[selectedProduct.currentVariantIndex];
//         const price = selectedProduct.basePrice * selectedVariant.multiplier;
        
//         setCartItems(prev => {
//           // Check if product already exists in cart
//           const existingItemIndex = prev.findIndex(
//             item => item.id === selectedProduct.id && 
//                     item.variant === selectedVariant.name
//           );

//           if (existingItemIndex > -1) {
//             const updatedCart = [...prev];
//             updatedCart[existingItemIndex] = {
//               ...updatedCart[existingItemIndex],
//               quantity: updatedCart[existingItemIndex].quantity + 1
//             };
//             return updatedCart;
//           }

//           return [...prev, {
//             id: selectedProduct.id,
//             name: selectedProduct.name,
//             variant: selectedVariant.name,
//             quantity: 1,
//             price: price
//           }];
//         });
//         break;
//     }
//   }, [filteredProducts, selectedProductIndex]);

//   // Calculate total cart value
//   const cartTotal = cartItems.reduce(
//     (total, item) => total + (item.price * item.quantity), 
//     0
//   );

//   // Effect to add global key listener
//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyDown);
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [handleKeyDown]);

//   return (
//     <div className="flex space-x-4 p-4">
//       <div className="w-1/2 border rounded-lg shadow-md">
//         <div className="p-4 border-b bg-gray-100">
//           <h2 className="text-xl font-bold mb-2">Product List</h2>
//           <input 
//             ref={searchInputRef}
//             type="text"
//             placeholder="Search products..." 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full p-2 border rounded mb-2"
//           />
//         </div>
//         <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
//           <AgGridReact
//             ref={gridRef}
//             rowData={filteredProducts}
//             columnDefs={productColumns}
//             rowSelection="single"
//             onGridReady={(params) => {
//               params.api.sizeColumnsToFit();
//             }}
//           />
//         </div>
//       </div>

//       <div className="w-1/2 border rounded-lg shadow-md">
//         <div className="p-4 border-b bg-gray-100">
//           <h2 className="text-xl font-bold">Cart</h2>
//         </div>
//         <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
//           <AgGridReact
//             rowData={cartItems}
//             columnDefs={cartColumns}
//             onCellEditingStopped={(event) => {
//               // Update cart when quantity is edited
//               const updatedCart = cartItems.map(item => 
//                 item.id === event.data.id && item.variant === event.data.variant
//                   ? { ...item, quantity: event.data.quantity }
//                   : item
//               );
//               setCartItems(updatedCart);
//             }}
//           />
//         </div>
//         <div className="p-4 border-t">
//           <div className="text-right font-bold mb-2">
//             Total: ${cartTotal.toFixed(2)}
//           </div>
//           <button 
//             className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
//             onClick={() => {
//               // Implement checkout logic
//               alert('Checkout functionality to be implemented');
//             }}
//           >
//             Checkout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GridBillingSystem;