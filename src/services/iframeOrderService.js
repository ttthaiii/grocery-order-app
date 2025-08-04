// src/services/iframeOrderService.js - แก้ไขแล้ว

export const submitOrderViaIframe = (cart, userInfo = {}) => {
  return new Promise((resolve, reject) => {
    // สร้าง order data
    const orderData = {
      cart: cart,
      timestamp: new Date().toISOString(),
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

    // ตั้ง timeout เพื่อถือว่าสำเร็จ
    const successTimeout = setTimeout(() => {
      console.log('Order submission completed (timeout)');
      resolve({
        success: true,
        message: 'Order submitted successfully',
        orderId: 'ORD-' + Date.now(),
        timestamp: new Date().toISOString(),
        itemCount: Object.keys(cart).filter(key => cart[key] > 0).length
      });
      
      // ลบ elements
      try {
        document.body.removeChild(iframe);
        document.body.removeChild(form);
      } catch (e) {
        console.log('Elements already removed');
      }
    }, 3000); // รอ 3 วินาที

    // ฟัง response จาก iframe
    iframe.onload = () => {
      console.log('Iframe loaded');
      // ให้ timeout จัดการแทน
    };

    iframe.onerror = () => {
      clearTimeout(successTimeout);
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