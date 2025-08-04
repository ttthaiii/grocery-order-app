import React from 'react';

const CartButton = ({ cart, onClick }) => {
  // คำนวณจำนวนสินค้าทั้งหมดในตะกร้า
  const totalItems = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  if (totalItems === 0) {
    return null; // ไม่แสดงปุ่มถ้าไม่มีสินค้าในตะกร้า
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}
    >
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '8px 16px', // ลดขนาด padding
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          fontSize: '14px', // ลดขนาดฟอนต์
          fontWeight: '500',
          transition: 'all 0.3s',
          minWidth: '100px' // ลดขนาดความกว้าง
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#059669';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#10b981';
          e.target.style.transform = 'scale(1)';
        }}
      >
        {/* Cart Icon */}
        <svg 
          style={{ width: '16px', height: '16px', marginRight: '6px' }} // ลดขนาดไอคอน
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293a1 1 0 00.293 1.414L7 15h10a2 2 0 002-2V9a2 2 0 00-2-2H9m10 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m10 0H7" 
          />
        </svg>

        {/* Item Count - เอาเลขซ้ำออก */}
        <span>
          ตะกร้า • {totalItems} รายการ
        </span>
      </button>
    </div>
  );
};

export default CartButton;