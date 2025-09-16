import React, { useState, useEffect } from 'react';
import { convertGoogleDriveUrl, getProxiedImageUrl } from '../services/googleDriveImageService';

const ProductCard = ({ product, onAddToCart, cartQuantity = 0 }) => {
  const [quantity, setQuantity] = useState(cartQuantity);
  const [inputValue, setInputValue] = useState(cartQuantity.toString());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [imageAttempt, setImageAttempt] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state when cartQuantity changes
  useEffect(() => {
    setQuantity(cartQuantity);
    setInputValue(cartQuantity.toString());
  }, [cartQuantity]);

  // รีเซ็ตและเตรียม URLs เมื่อมีสินค้าใหม่
  useEffect(() => {
    if (product.รูป) {
      setImageLoaded(false);
      setImageError(false);
      setImageAttempt(0);
      
      // เตรียม URLs หลายตัว
      const urls = [
        convertGoogleDriveUrl(product.รูป),
        getProxiedImageUrl(product.รูป),
        product.รูป // URL เดิม
      ].filter(Boolean);

      if (urls.length > 0) {
        setCurrentImageUrl(urls[0]);
      } else {
        setCurrentImageUrl(null);
        setImageError(true);
      }
    } else {
      setCurrentImageUrl(null);
      setImageError(true);
    }
  }, [product.รูป]);

  const handleImageError = () => {
    console.log(`Image attempt ${imageAttempt + 1} failed:`, currentImageUrl);
    
    // ลอง URL ถัดไป
    const urls = [
      convertGoogleDriveUrl(product.รูป),
      getProxiedImageUrl(product.รูป),
      product.รูป
    ].filter(Boolean);

    const nextAttempt = imageAttempt + 1;
    
    if (nextAttempt < urls.length) {
      setImageAttempt(nextAttempt);
      setCurrentImageUrl(urls[nextAttempt]);
      setImageLoaded(false);
    } else {
      setImageError(true);
      setImageLoaded(true);
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', currentImageUrl);
    setImageLoaded(true);
    setImageError(false);
  };

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

  const isSelected = quantity > 0;
  const cardStyle = {
    backgroundColor: isSelected ? '#f0fdf4' : 'white',
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
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {currentImageUrl && !imageError ? (
          <>
            <img
              src={currentImageUrl}
              alt={product.รายการ}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.3s',
                opacity: imageLoaded ? 1 : 0
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            
            {!imageLoaded && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #10b981',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            )}
          </>
        ) : (
          <div style={{ 
            fontSize: '32px', 
            color: '#9ca3af',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            📦
            <span style={{ 
              fontSize: '8px', 
              color: '#ef4444',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              รูปโหลดไม่ได้
            </span>
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
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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