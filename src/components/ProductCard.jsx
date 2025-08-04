import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, cartQuantity = 0 }) => {
  const [quantity, setQuantity] = useState(cartQuantity);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onAddToCart && onAddToCart(product, newQuantity);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 0) return;
    setQuantity(newQuantity);
    onAddToCart && onAddToCart(product, newQuantity);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}>
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
      </div>

      {/* Product Info */}
      <div style={{ padding: '12px' }}>
        {/* Product Name */}
        <h3 style={{
          fontWeight: '500',
          color: '#1f2937',
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
          color: '#6b7280',
          marginBottom: '8px'
        }}>
          {product.หน่วย}
        </p>
        
        {/* Category Badge */}
        {product.ประเภทหลัก && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
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
            // Quantity Controls
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f0fdf4',
              borderRadius: '20px',
              padding: '2px'
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
                  transition: 'all 0.2s'
                }}
              >
                <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              
              <span style={{
                margin: '0 8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#166534',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {quantity}
              </span>
              
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
                  transition: 'all 0.2s'
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