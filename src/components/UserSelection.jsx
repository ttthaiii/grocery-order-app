import React, { useState } from 'react';

const UserSelection = ({ onUserSelect }) => {
  const [selectedShop, setSelectedShop] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock shop data - ในอนาคตจะดึงจาก database
  const shopTypes = [
    {
      id: 'regular',
      name: 'ร้านค้าปกติ',
      description: 'สินค้าทั่วไป คุณภาพมาตรฐาน',
      icon: '🏪',
      colors: {
        bg: '#eff6ff',
        border: '#bfdbfe', 
        text: '#1d4ed8'
      }
    },
    {
      id: 'premium', 
      name: 'ร้านซูชิ',
      description: 'สินค้าพรีเมียม คุณภาพสูง',
      icon: '🍣',
      colors: {
        bg: '#fefbeb',
        border: '#fde68a',
        text: '#d97706'
      }
    },
    {
      id: 'admin',
      name: 'ผู้ดูแลระบบ',
      description: 'จัดการระบบและการจัดซื้อ',
      icon: '⚙️',
      colors: {
        bg: '#f0fdf4',
        border: '#bbf7d0',
        text: '#059669'
      }
    }
  ];

  const handleLogin = async () => {
    if (!selectedShop) return;
    
    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userData = shopTypes.find(shop => shop.id === selectedShop);
    const userInfo = {
      shopType: userData.id,
      shopName: userData.name,
      description: userData.description,
      // Mock data - ในอนาคตจะมาจาก database
      storeName: userData.id === 'admin' ? 'Admin Panel' : `${userData.name} สาขาหลัก`,
      branchName: userData.id === 'admin' ? '' : 'สาขาหลัก',
      userEmail: `${userData.id}@example.com`
    };
    
    onUserSelect(userInfo);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #faf5ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            ระบบการสั่งซื้อสินค้า
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            เลือกประเภทผู้ใช้เพื่อเข้าสู่ระบบ
          </p>
        </div>

        {/* Shop Type Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '24px',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            เลือกประเภทร้านค้า
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {shopTypes.map((shop) => (
              <label
                key={shop.id}
                style={{
                  display: 'block',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: selectedShop === shop.id ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseOver={(e) => {
                  if (selectedShop !== shop.id) {
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = selectedShop === shop.id ? 'scale(1.02)' : 'scale(1)';
                }}
              >
                <input
                  type="radio"
                  name="shopType"
                  value={shop.id}
                  checked={selectedShop === shop.id}
                  onChange={(e) => setSelectedShop(e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  position: 'relative',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedShop === shop.id ? shop.colors.border : '#e5e7eb'}`,
                  backgroundColor: selectedShop === shop.id ? shop.colors.bg : '#f9fafb',
                  transition: 'all 0.3s',
                  boxShadow: selectedShop === shop.id ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      fontSize: '32px',
                      marginRight: '16px'
                    }}>
                      {shop.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontWeight: '600',
                        fontSize: '18px',
                        color: selectedShop === shop.id ? shop.colors.text : '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {shop.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: selectedShop === shop.id ? shop.colors.text : '#6b7280',
                        margin: 0
                      }}>
                        {shop.description}
                      </p>
                    </div>
                    
                    {/* Selection Indicator */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${selectedShop === shop.id ? '#059669' : '#d1d5db'}`,
                      backgroundColor: selectedShop === shop.id ? '#059669' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      {selectedShop === shop.id && (
                        <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={!selectedShop || isLoading}
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '18px',
              border: 'none',
              cursor: !selectedShop || isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: !selectedShop || isLoading 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              boxShadow: !selectedShop || isLoading 
                ? 'none' 
                : '0 4px 6px rgba(5, 150, 105, 0.25)'
            }}
            onMouseOver={(e) => {
              if (!(!selectedShop || isLoading)) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 12px rgba(5, 150, 105, 0.35)';
              }
            }}
            onMouseOut={(e) => {
              if (!(!selectedShop || isLoading)) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 6px rgba(5, 150, 105, 0.25)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 4px 0'
          }}>
            ระบบจัดการการสั่งซื้อสินค้า v2.0
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: 0
          }}>
            Powered by Firebase & Google Apps Script
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserSelection;