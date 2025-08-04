import React, { useState } from 'react';

const ProductList = ({ 
  category, 
  categories, 
  products, 
  onBack, 
  onAddToCart, 
  onCartClick, 
  cart 
}) => {
  // แปลง category object เป็น string
  const categoryName = typeof category === 'object' ? category.name || category.id : category;
  
  console.log('Category received:', category);
  console.log('Category name:', categoryName);

  // ใช้โครงสร้างเดิมในการดึงข้อมูล
  let filteredProducts = [];
  
  if (categoryName === 'all') {
    // แสดงทั้งหมด
    filteredProducts = products;
  } else {
    // แสดงเฉพาะหมวดหมู่ที่เลือก - ใช้โครงสร้างเดิม
    const categoryData = categories[categoryName];
    if (categoryData && categoryData.products) {
      filteredProducts = categoryData.products;
    }
  }

  console.log(`Filtered products count: ${filteredProducts.length}`);

  // นับจำนวนรายการในตะกร้า
  const totalCartItems = Object.values(cart || {}).reduce((sum, qty) => {
    const numQty = Number(qty) || 0;
    return sum + numQty;
  }, 0);

  const handleQuantityChange = (product, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity) || 0);
    console.log('Updating quantity:', product.รายการ, qty);
    onAddToCart(product, qty);
  };

  const incrementQuantity = (product) => {
    const currentQty = cart[product.รายการ] || 0;
    handleQuantityChange(product, currentQty + 1);
  };

  const decrementQuantity = (product) => {
    const currentQty = cart[product.รายการ] || 0;
    if (currentQty > 0) {
      handleQuantityChange(product, currentQty - 1);
    }
  };

  const getCurrentQuantity = (product) => {
    const quantity = cart[product.รายการ] || 0;
    return Number(quantity) || 0;
  };

  const isProductSelected = (product) => {
    return getCurrentQuantity(product) > 0;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <span className="mr-1">←</span>
            กลับ
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{categoryName}</h1>
        </div>

        {/* ปุ่มตะกร้า - Header */}
        {totalCartItems > 0 && (
          <button
            onClick={onCartClick}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg shadow-md transition-colors text-sm"
          >
            <span className="mr-1">🛒</span>
            ตะกร้า {totalCartItems} รายการ
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredProducts.map((product, index) => {
          const quantity = getCurrentQuantity(product);
          const isSelected = isProductSelected(product);
          
          return (
            <div
              key={index}
              className={`rounded-lg shadow-md p-6 transition-all duration-200 ${
                isSelected 
                  ? 'bg-green-50 border-2 border-green-200 shadow-lg' 
                  : 'bg-white border border-gray-200 hover:shadow-lg'
              }`}
            >
              {/* Product Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <div className={`text-2xl ${isSelected ? 'text-green-600' : 'text-gray-600'}`}>
                    📦
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <h3 className={`text-lg font-semibold text-center mb-2 ${
                isSelected ? 'text-green-800' : 'text-gray-800'
              }`}>
                {String(product.รายการ || 'ไม่ระบุชื่อ')}
              </h3>

              {/* Unit */}
              <p className={`text-center mb-4 ${
                isSelected ? 'text-green-600' : 'text-gray-600'
              }`}>
                {String(product.หน่วย || '')}
              </p>

              {/* Category Badge */}
              <div className="text-center mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {String(product.หมวดหมู่ || categoryName)}
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-center space-x-3">
                {/* Decrease Button */}
                {quantity > 0 && (
                  <button
                    onClick={() => decrementQuantity(product)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                )}

                {/* Quantity Display/Input */}
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(product, e.target.value)}
                    className={`w-16 h-8 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      quantity > 0 
                        ? 'border-green-300 bg-white' 
                        : 'border-gray-300 bg-gray-50 text-gray-400'
                    }`}
                    placeholder="0"
                  />
                </div>

                {/* Increase Button */}
                <button
                  onClick={() => incrementQuantity(product)}
                  className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="mt-3 text-center">
                  <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    เลือกแล้ว {String(quantity)} {String(product.หน่วย || '')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            ไม่พบสินค้าในหมวดหมู่นี้
          </h3>
          <p className="text-gray-500">
            กรุณาเลือกหมวดหมู่อื่น หรือติดต่อผู้ดูแลระบบ
          </p>
        </div>
      )}

      {/* Fixed Bottom Cart Button */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 right-6 z-10">
          <button
            onClick={onCartClick}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center transition-all duration-200 hover:scale-105"
          >
            <span className="mr-2">🛒</span>
            <span className="font-semibold">{totalCartItems}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;