import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import CartButton from './CartButton';

const ProductList = ({ 
  category, 
  categories, 
  products, 
  onBack, 
  onAddToCart,
  onCartClick,
  cart = {} 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  // กรองสินค้าตามหมวดหมู่และคำค้นหา
  const filteredProducts = useMemo(() => {
    let productList = [];

    if (category.id === 'all') {
      // แสดงทั้งหมด
      productList = products;
    } else {
      // แสดงเฉพาะหมวดหมู่ที่เลือก
      const categoryData = categories[category.name];
      if (categoryData) {
        if (selectedSubCategory === 'all') {
          productList = categoryData.products;
        } else {
          productList = categoryData.subCategories[selectedSubCategory] || [];
        }
      }
    }

    // กรองตามคำค้นหา
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      productList = productList.filter(product => 
        product.รายการ?.toLowerCase().includes(term) ||
        product.ประเภทหลัก?.toLowerCase().includes(term) ||
        product.ประเภทย่อย?.toLowerCase().includes(term)
      );
    }

    return productList;
  }, [category, categories, products, selectedSubCategory, searchTerm]);

  // หา subcategories ของหมวดหมู่ที่เลือก
  const subCategories = useMemo(() => {
    if (category.id === 'all') return [];
    
    const categoryData = categories[category.name];
    if (categoryData) {
      return Object.keys(categoryData.subCategories);
    }
    return [];
  }, [category, categories]);

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {/* Back Button */}
        <button onClick={onBack} className="back-button" style={{ marginBottom: '12px' }}>
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>

        {/* Category Title */}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
          {category.name}
        </h1>
        
        {/* Product Count */}
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          {filteredProducts.length} รายการ
        </p>

        {/* Search Bar */}
        <div className="search-container" style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="ค้นหาสินค้าในหมวดนี้"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Sub Category Filters */}
        {subCategories.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedSubCategory('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid #d1d5db',
                backgroundColor: selectedSubCategory === 'all' ? '#10b981' : 'white',
                color: selectedSubCategory === 'all' ? 'white' : '#374151',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ทั้งหมด
            </button>
            {subCategories.map(subCat => (
              <button
                key={subCat}
                onClick={() => setSelectedSubCategory(subCat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #d1d5db',
                  backgroundColor: selectedSubCategory === subCat ? '#10b981' : 'white',
                  color: selectedSubCategory === subCat ? 'white' : '#374151',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {subCat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div style={{ padding: '16px', paddingBottom: '80px' }}> {/* เพิ่ม paddingBottom */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {searchTerm ? 'ไม่พบสินค้าที่ค้นหา' : 'ไม่มีสินค้าในหมวดนี้'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ล้างการค้นหา
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={`${product.รายการ}-${index}`}
                product={product}
                onAddToCart={onAddToCart}
                cartQuantity={cart[product.รายการ] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Button */}
      <CartButton cart={cart} onClick={onCartClick} />
    </div>
  );
};

export default ProductList;