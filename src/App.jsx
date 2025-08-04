import React, { useState } from 'react'
import CategoryGrid from './components/CategoryGrid'
import ProductList from './components/ProductList'
import CartSummary from './components/CartSummary'
import { useProducts } from './hooks/useProducts'
import { submitOrderViaIframe } from './services/iframeOrderService'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('categories'); // 'categories', 'products', 'cart'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState({});
  const { products, categories, loading, error, refreshProducts } = useProducts();

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
      const userInfo = {
        storeName: 'ร้านทดสอบ',
        branchName: 'สาขาหลัก', 
        userEmail: 'test@example.com'
      };
      
      // เปลี่ยนจาก submitOrderWithRetry เป็น submitOrderViaIframe
      const result = await submitOrderViaIframe(orderCart, userInfo);
      
      console.log('Order submitted successfully:', result);
      
      // Clear cart after successful submission
      setCart({});
      
      // Show success message with order details
      alert(`ส่งรายการสั่งซื้อเรียบร้อยแล้ว!\nรหัสคำสั่งซื้อ: ${result.orderId}\nจำนวนรายการ: ${result.itemCount} รายการ`);
      
      // Navigate back to categories
      setCurrentView('categories');
      setSelectedCategory(null);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
      throw error; // Re-throw เพื่อให้ CartSummary จัดการ loading state
    }
  };

  return (
    <div className="App">
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
    </div>
  )
}

export default App