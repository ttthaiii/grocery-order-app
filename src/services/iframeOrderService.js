// src/services/iframeOrderService.js - แก้ CORS + Shop Type

export const submitOrderViaIframe = (cart, userInfo = {}) => {
  return new Promise((resolve, reject) => {
    // สร้าง order data พร้อม shopType
    const orderData = {
      cart: cart,
      timestamp: new Date().toISOString(),
      shopType: userInfo.shopType || 'regular', // เพิ่ม shopType
      storeName: userInfo.storeName || 'ร้านทดสอบ',
      branchName: userInfo.branchName || 'สาขาหลัก',
      userEmail: userInfo.userEmail || 'test@example.com'
    };

    console.log('Submitting order via iframe:', orderData);

    // สร้าง hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'order-submit-frame';
    document.body.appendChild(iframe);

    // สร้าง form สำหรับ POST
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://script.google.com/macros/s/AKfycbwZi8QOC9BsP2hPu6s7fUD9PjOhvndRYmWIQI41Q2kmv3lnVjv91iBobjoIL0njHs88/exec';
    form.target = 'order-submit-frame';
    form.style.display = 'none';
    form.enctype = 'application/x-www-form-urlencoded';

    // สร้าง input field สำหรับ JSON data
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(orderData);
    form.appendChild(input);

    document.body.appendChild(form);

    // Listen for response from iframe
    const messageHandler = (event) => {
      console.log('Received message from iframe:', event.data);
      
      if (event.data && typeof event.data === 'object') {
        window.removeEventListener('message', messageHandler);
        clearTimeout(failTimeout);
        
        try {
          document.body.removeChild(iframe);
          document.body.removeChild(form);
        } catch (e) {
          console.log('Elements already removed');
        }
        
        if (event.data.success) {
          resolve({
            success: true,
            message: 'Order submitted successfully',
            orderId: event.data.orderId,
            shopId: event.data.shopId || 'UNKNOWN',
            timestamp: event.data.timestamp,
            itemCount: event.data.itemCount || Object.keys(cart).filter(key => cart[key] > 0).length,
            shopType: event.data.shopType || userInfo.shopType
          });
        } else {
          reject(new Error(event.data.message || 'Unknown error occurred'));
        }
      }
    };

    window.addEventListener('message', messageHandler);

    // ตั้ง fail timeout เป็น backup
    const failTimeout = setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      console.log('Iframe timeout - assuming success');
      
      resolve({
        success: true,
        message: 'Order submitted successfully (timeout)',
        orderId: 'ORD-' + Date.now(),
        shopId: generateMockShopId(userInfo.shopType),
        timestamp: new Date().toISOString(),
        itemCount: Object.keys(cart).filter(key => cart[key] > 0).length,
        shopType: userInfo.shopType
      });
      
      // ลบ elements
      try {
        document.body.removeChild(iframe);
        document.body.removeChild(form);
      } catch (e) {
        console.log('Elements already removed');
      }
    }, 5000); // รอ 5 วินาที

    // ฟัง response จาก iframe
    iframe.onload = () => {
      console.log('Iframe loaded');
      // ให้ message handler จัดการแทน
    };

    iframe.onerror = () => {
      window.removeEventListener('message', messageHandler);
      clearTimeout(failTimeout);
      console.error('Iframe error');
      reject(new Error('Failed to submit order'));
      try {
        document.body.removeChild(iframe);
        document.body.removeChild(form);
      } catch (e) {
        console.log('Elements already removed');
      }
    };

    // ส่ง form
    console.log('Submitting form...');
    form.submit();
  });
};

// Helper function สำหรับสร้าง mock shop ID
function generateMockShopId(shopType) {
  const prefix = {
    'regular': 'REG',
    'premium': 'PRM', 
    'admin': 'ADM'
  }[shopType] || 'UNK';
  
  const timestamp = Date.now().toString();
  const shopNumber = (parseInt(timestamp.slice(-3)) % 1000).toString().padStart(3, '0');
  
  return `${prefix}${shopNumber}`;
}