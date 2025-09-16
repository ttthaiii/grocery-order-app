// src/services/orderService.js - แบบง่าย + Shop Type Support

// URL ของ Google Apps Script Web App (แทนที่ด้วย URL ใหม่จากการ deploy)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZi8QOC9BsP2hPu6s7fUD9PjOhvndRYmWIQI41Q2kmv3lnVjv91iBobjoIL0njHs88/exec';

// ส่งรายการสั่งซื้อไป Google Apps Script
export const submitOrder = async (cart, userInfo = {}) => {
  try {
    // เตรียมข้อมูลที่จะส่ง พร้อม shopType
    const orderData = {
      cart: cart,
      timestamp: new Date().toISOString(),
      // เพิ่ม shopType สำหรับแยกประเภทร้าน
      shopType: userInfo.shopType || 'regular', // 'regular', 'premium', 'admin'
      storeName: userInfo.storeName || 'ร้านทดสอบ',
      branchName: userInfo.branchName || 'สาขาหลัก',
      userEmail: userInfo.userEmail || 'test@example.com',
      
      // Log สำหรับ debugging
      debug: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
        cartItemCount: Object.keys(cart).filter(key => cart[key] > 0).length
      }
    };

    console.log('Submitting order:', orderData);

    // ส่งข้อมูลไป Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
      redirect: 'follow'
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Response result:', result);

    if (!result.success) {
      throw new Error(result.message || 'Unknown error occurred');
    }

    console.log('Order submitted successfully:', result);
    return result;

  } catch (error) {
    console.error('Error submitting order:', error);
    throw new Error(`ไม่สามารถส่งรายการสั่งซื้อได้: ${error.message}`);
  }
};

// ตรวจสอบสถานะการเชื่อมต่อกับ Apps Script
export const checkConnection = async () => {
  try {
    console.log('Checking connection to:', APPS_SCRIPT_URL);
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'GET',
    });

    console.log('Connection check response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Connection check result:', result);
    return true;

  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

// Retry logic
const MAX_RETRIES = 3;

export const submitOrderWithRetry = async (cart, userInfo = {}) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await submitOrder(cart, userInfo);
      return result;
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`ไม่สามารถส่งรายการสั่งซื้อได้หลังจากพยายาม ${MAX_RETRIES} ครั้ง: ${error.message}`);
      }
      
      // รอก่อนลองใหม่
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Helper function สำหรับ format order data for display
export const formatOrderForDisplay = (cart, userInfo) => {
  const items = Object.entries(cart)
    .filter(([productName, quantity]) => quantity > 0)
    .map(([productName, quantity]) => ({
      productName,
      quantity,
      shopType: userInfo.shopType
    }));

  return {
    shopInfo: {
      type: userInfo.shopType,
      name: userInfo.storeName,
      branch: userInfo.branchName,
      email: userInfo.userEmail
    },
    items: items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    timestamp: new Date().toISOString()
  };
};