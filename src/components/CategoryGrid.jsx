import React from 'react';

const CategoryGrid = ({ categories, loading, error, onCategorySelect, onRefresh }) => {
  // ไอคอนสำหรับแต่ละหมวดหมู่
  const categoryIcons = {
    'อาหารแช่แข็ง และอาหารแปรรูป': '🧊',
    'ของใช้': '🧽',
    'อาหารทะเล และเนื้อสัตว์': '🐟',
    'ของแห้งและเครื่องปรุง': '🌶️',
    'ผักและผลไม้': '🥬'
  };

  // สีสำหรับแต่ละหมวดหมู่
  const categoryColors = {
    'อาหารแช่แข็ง และอาหารแปรรูป': { bg: 'bg-blue', text: 'text-blue' },
    'ของใช้': { bg: 'bg-purple', text: 'text-purple' },
    'อาหารทะเล และเนื้อสัตว์': { bg: 'bg-pink', text: 'text-pink' },
    'ของแห้งและเครื่องปรุง': { bg: 'bg-orange', text: 'text-orange' },
    'ผักและผลไม้': { bg: 'bg-green', text: 'text-green' }
  };

  // แปลงข้อมูล categories เป็น array
  const categoryArray = Object.keys(categories).map(key => {
    const category = categories[key];
    const colors = categoryColors[key] || { bg: 'bg-gray', text: 'text-gray' };
    
    return {
      id: key,
      name: key,
      icon: categoryIcons[key] || '📦',
      bgColor: colors.bg,
      textColor: colors.text,
      count: category.products.length,
      subCategories: Object.keys(category.subCategories)
    };
  });

  const totalProducts = Object.values(categories).reduce((sum, cat) => sum + cat.products.length, 0);

  if (loading) {
    return (
      <div className="category-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>เกิดข้อผิดพลาด</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={onRefresh}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-container">
      {/* Header */}
      <div className="category-header">
        <div className="category-title-row">
          <h1 className="category-title">หมวดหมู่สินค้า</h1>
          <div className="category-count">
            รวม {totalProducts} รายการ
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="ค้นหาสินค้า"
            className="search-input"
          />
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {categoryArray.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect && onCategorySelect(category)}
            className={`category-button ${category.bgColor}`}
          >
            <span className="category-icon">{category.icon}</span>
            <div className={`category-name ${category.textColor}`}>
              {category.name}
            </div>
            <div className="category-item-count">
              {category.count} รายการ
            </div>
            {category.subCategories.length > 0 && (
              <div className="category-subcategories">
                {category.subCategories.join(', ')}
              </div>
            )}
          </button>
        ))}
        
        {/* View All Button */}
        <button
          onClick={() => onCategorySelect && onCategorySelect({ 
            id: 'all', 
            name: 'ดูทั้งหมด',
            count: totalProducts 
          })}
          className="category-button bg-gray"
        >
          <span className="category-icon">📱</span>
          <div className="category-name text-gray">
            ดูทั้งหมด
          </div>
          <div className="category-item-count">
            รายการทั้งหมด
          </div>
        </button>
      </div>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={onRefresh}
          style={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#374151'
          }}
        >
          🔄 รีเฟรชข้อมูล
        </button>
      </div>
    </div>
  );
};

export default CategoryGrid;