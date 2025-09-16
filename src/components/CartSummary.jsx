import React, { useState } from 'react';

const CartSummary = ({ cart, products, onBack, onUpdateCart, onSubmitOrder }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // กรองเฉพาะสินค้าที่มีในตะกร้า
  const cartItems = products.filter(product => cart[product.รายการ] > 0);

  const handleQuantityChange = (productName, newQuantity) => {
    onUpdateCart(productName, newQuantity);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitOrder(cart);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // นับจำนวนรายการ (ไม่ใช่จำนวนสินค้า)
  const totalItems = Object.entries(cart).filter(([product, quantity]) => quantity > 0).length;

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '16px' }}>
        <button onClick={onBack} className="back-button" style={{ marginBottom: '12px' }}>
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>

        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
          <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#1f2937' }}>ตะกร้าว่าง</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>ยังไม่มีสินค้าในตะกร้า</p>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            เลือกสินค้า
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <button onClick={onBack} className="back-button" style={{ marginBottom: '12px' }}>
          <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>

        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
          สรุปรายการสั่งซื้อ
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          {totalItems} รายการ
        </p>
      </div>

      {/* Cart Items */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cartItems.map((product, index) => (
            <div
              key={`${product.รายการ}-${index}`}
              style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {/* Product Image */}
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                {product.รูป ? (
                  <img
                    src={product.รูป}
                    alt={product.รายการ}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="fallback-icon"
                  style={{ 
                    fontSize: '24px', 
                    color: '#9ca3af',
                    display: product.รูป ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  📦
                </div>
              </div>

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1f2937',
                  marginBottom: '4px',
                  lineHeight: '1.3'
                }}>
                  {product.รายการ}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  {product.หน่วย}
                </p>
              </div>

              {/* Quantity Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f0fdf4',
                borderRadius: '20px',
                padding: '4px'
              }}>
                <button
                  onClick={() => handleQuantityChange(product.รายการ, cart[product.รายการ] - 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'white',
                    color: '#10b981',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
                
                <span style={{
                  margin: '0 12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#166534',
                  minWidth: '24px',
                  textAlign: 'center'
                }}>
                  {cart[product.รายการ]}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(product.รายการ, cart[product.รายการ] + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: '16px',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: '100%',
            backgroundColor: isSubmitting ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = '#059669';
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = '#10b981';
            }
          }}
        >
          {isSubmitting ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ffffff33',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              กำลังส่งรายการ...
            </>
          ) : (
            <>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              ส่งรายการสั่งซื้อ ({totalItems} รายการ)
            </>
          )}
        </button>
      </div>

      {/* Bottom spacing */}
      <div style={{ height: '80px' }}></div>
    </div>
  );
};

export default CartSummary;