import React, { useState, useEffect } from 'react';

const ProductCard = ({ product, onAddToCart, cartQuantity = 0 }) => {
  const [quantity, setQuantity] = useState(cartQuantity);
  const [inputValue, setInputValue] = useState(cartQuantity.toString());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when cartQuantity changes
  useEffect(() => {
    setQuantity(cartQuantity);
    setInputValue(cartQuantity.toString());
  }, [cartQuantity]);

  const handleAddToCart = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setInputValue(newQuantity.toString());
    onAddToCart && onAddToCart(product, newQuantity);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 0) return;
    setQuantity(newQuantity);
    setInputValue(newQuantity.toString());
    onAddToCart && onAddToCart(product, newQuantity);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // อนุญาตให้กรอกเฉพาะตัวเลข
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    const newQuantity = parseInt(inputValue) || 0;
    handleQuantityChange(newQuantity);
    setIsEditing(false);
  };

  const handleInputFocus = () => {
    setIsEditing(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  // กำหนดสีตาม quantity
  const isSelected = quantity > 0;
  const cardStyle = {
    backgroundColor: isSelected ? '#f0fdf4' : 'white', // เปลี่ยนสีเมื่อถูกเลือก
    borderRadius: '8px',
    boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
    border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
    overflow: 'hidden',
    transition: 'all 0.2s',
    cursor: 'pointer'
  };

  return (
    <div style={cardStyle}>
      {/* Product Image */}
      <div style={{
        position: 'relative',
        height: '120px',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!imageError ? (
          <img
            src={product.รูป}
            alt={product.รายการ}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s',
              opacity: imageLoaded ? 1 : 0
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          <div style={{ fontSize: '32px', color: '#9ca3af' }}>📦</div>
        )}
        
        {!imageLoaded && !imageError && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}

        {/* Selected Indicator */}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: '12px' }}>
        {/* Product Name */}
        <h3 style={{
          fontWeight: '500',
          color: isSelected ? '#166534' : '#1f2937',
          fontSize: '14px',
          lineHeight: '1.3',
          marginBottom: '4px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.รายการ}
        </h3>
        
        {/* Unit */}
        <p style={{
          fontSize: '12px',
          color: isSelected ? '#059669' : '#6b7280',
          marginBottom: '8px'
        }}>
          {product.หน่วย}
        </p>
        
        {/* Category Badge */}
        {product.ประเภทหลัก && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: isSelected ? '#dcfce7' : '#eff6ff',
              color: isSelected ? '#166534' : '#1e40af',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '12px'
            }}>
              {product.ประเภทหลัก}
            </span>
          </div>
        )}

        {/* Add to Cart Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px'
        }}>
          {quantity === 0 ? (
            // Add Button
            <button
              onClick={handleAddToCart}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          ) : (
            // Quantity Controls with Input
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f0fdf4',
              borderRadius: '20px',
              padding: '2px',
              width: '100%'
            }}>
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              
              {/* Quantity Input/Display */}
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                onKeyPress={handleKeyPress}
                style={{
                  margin: '0 4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#166534',
                  minWidth: '30px',
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  flex: 1
                }}
                placeholder="0"
              />
              
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;