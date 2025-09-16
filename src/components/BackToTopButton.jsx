// src/components/BackToTopButton.jsx
import React, { useState, useEffect } from 'react';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // ตรวจสอบการ scroll
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // เลื่อนกลับขึ้นบน
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '80px', // อยู่เหนือปุ่มตะกร้า
        right: '20px',
        width: '25px',
        height: '25px',
        backgroundColor: '#374151',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999, // ต่ำกว่าปุ่มตะกร้า
        transition: 'all 0.3s ease',
        opacity: 0.8
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = '#1f2937';
        e.target.style.opacity = 1;
        e.target.style.transform = 'scale(1.1)';
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = '#374151';
        e.target.style.opacity = 0.8;
        e.target.style.transform = 'scale(1)';
      }}
      title="กลับขึ้นบน"
    >
      <svg 
        style={{ width: '15px', height: '15px' }} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  );
};

export default BackToTopButton;