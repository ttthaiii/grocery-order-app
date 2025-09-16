import React, { useState } from 'react'
import CategoryGrid from './components/CategoryGrid'
import ProductList from './components/ProductList'
import CartSummary from './components/CartSummary'
import UserSelection from './components/UserSelection'
import AdminDashboard from './components/AdminDashboard'
import { useProducts } from './hooks/useProducts'
import { submitOrderToFirestore } from './services/firestoreOrderService'

import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null); // User state
  const [currentView, setCurrentView] = useState('categories'); // 'categories', 'products', 'cart', 'admin', 'procurement-planning', 'stock-management'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState({});
  const { products, categories, loading, error, refreshProducts } = useProducts();

  // User Selection Handler
  const handleUserSelect = (userInfo) => {
    console.log('User selected:', userInfo);
    setCurrentUser(userInfo);
    
    // Navigate based on user type
    if (userInfo.shopType === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('categories');
    }
  };

  // Navigation Handler for Admin
  const handleAdminNavigate = (page) => {
    setCurrentView(page);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('categories');
    setSelectedCategory(null);
    setCart({});
  };

  const handleCategorySelect = (category) => {
    console.log('Selected category:', category);
    setSelectedCategory(category);
    setCurrentView('products');
  };

  const handleAddToCart = (product, quantity) => {
    setCart(prev => ({
      ...prev,
      [product.รายการ]: quantity
    }));
    console.log('Added to cart:', product.รายการ, 'quantity:', quantity);
  };

  const handleCartClick = () => {
    setCurrentView('cart');
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
  };

  const handleBackToProducts = () => {
    setCurrentView('products');
  };

  const handleUpdateCart = (productName, quantity) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[productName];
      setCart(newCart);
    } else {
      setCart(prev => ({
        ...prev,
        [productName]: quantity
      }));
    }
  };

  const handleSubmitOrder = async (orderCart) => {
    try {
      // ใช้ข้อมูล user ที่ login แล้ว พร้อม shopType
      const userInfo = {
        shopType: currentUser.shopType,
        storeName: currentUser.storeName,
        branchName: currentUser.branchName,
        userEmail: currentUser.userEmail
      };

      console.log('Submitting order with user info:', userInfo);
      console.log('Order cart:', orderCart);
      
      // ส่งรายการไป Firestore
      const result = await submitOrderToFirestore(orderCart, userInfo);
      
      console.log('Order submitted successfully:', result);
      
      // Clear cart after successful submission
      setCart({});
      
      // Show success message with order details
      alert(`ส่งรายการสั่งซื้อเรียบร้อยแล้ว!\nประเภทร้าน: ${currentUser.shopName}\nรหัสคำสั่งซื้อ: ${result.orderId}\nจำนวนรายการ: ${result.itemCount} รายการ`);
      
      // Navigate back to categories
      setCurrentView('categories');
      setSelectedCategory(null);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
      throw error; // Re-throw เพื่อให้ CartSummary จัดการ loading state
    }
  };

  // ถ้ายังไม่ได้ login ให้แสดงหน้า UserSelection
  if (!currentUser) {
    return <UserSelection onUserSelect={handleUserSelect} />;
  }

  return (
    <div className="App">
      {/* User Info Bar */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>
            {currentUser.shopType === 'admin' ? '⚙️' : currentUser.shopType === 'premium' ? '🍣' : '🏪'}
          </span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              {currentUser.shopName}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {currentUser.description}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
          }}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ออกจากระบบ
        </button>
      </div>

      {/* Main Content */}
      {currentUser.shopType === 'admin' ? (
        // Admin Views
        <>
          {currentView === 'admin' && (
            <AdminDashboard 
              currentUser={currentUser}
              onLogout={handleLogout}
              onNavigate={handleAdminNavigate}
            />
          )}
          
          {currentView === 'procurement-planning' && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 'calc(100vh - 64px)',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '48px' }}>🛒</div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                Procurement Planning
              </h2>
              <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>
                หน้าการวางแผนการจัดซื้อและเลือก Supplier<br/>
                กำลังพัฒนา...
              </p>
              <button
                onClick={() => setCurrentView('admin')}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                กลับ Dashboard
              </button>
            </div>
          )}
          
          {currentView === 'stock-management' && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 'calc(100vh - 64px)',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '48px' }}>📦</div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                Stock Management
              </h2>
              <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>
                หน้าจัดการสต็อกสินค้า<br/>
                กำลังพัฒนา...
              </p>
              <button
                onClick={() => setCurrentView('admin')}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                กลับ Dashboard
              </button>
            </div>
          )}
        </>
      ) : (
        // Customer Views (ร้านค้าปกติ และ ร้านซูชิ)
        <>
          {currentView === 'categories' && (
            <CategoryGrid 
              categories={categories}
              loading={loading}
              error={error}
              onCategorySelect={handleCategorySelect}
              onRefresh={refreshProducts}
            />
          )}

          {currentView === 'products' && selectedCategory && (
            <ProductList
              category={selectedCategory}
              categories={categories}
              products={products}
              onBack={handleBackToCategories}
              onAddToCart={handleAddToCart}
              onCartClick={handleCartClick}
              cart={cart}
            />
          )}

          {currentView === 'cart' && (
            <CartSummary
              cart={cart}
              products={products}
              onBack={handleBackToProducts}
              onUpdateCart={handleUpdateCart}
              onSubmitOrder={handleSubmitOrder}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App