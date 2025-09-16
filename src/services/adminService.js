// src/services/adminService.js - CORS-free version

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZi8QOC9BsP2hPu6s7fUD9PjOhvndRYmWIQI41Q2kmv3lnVjv91iBobjoIL0njHs88/exec';

// ดึงข้อมูลผ่าน iframe (แก้ CORS)
const fetchViaIframe = (action, params = {}) => {
  return new Promise((resolve, reject) => {
    // สร้าง unique callback name
    const callbackName = `adminCallback_${Date.now()}`;
    
    // สร้าง iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `${APPS_SCRIPT_URL}?action=${action}&callback=${callbackName}&${new URLSearchParams(params).toString()}`;
    
    // Timeout
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Request timeout'));
    }, 10000);
    
    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeout);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      if (window[callbackName]) {
        delete window[callbackName];
      }
    };
    
    // Global callback
    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };
    
    document.body.appendChild(iframe);
  });
};

// ดึงข้อมูลสำหรับ Admin Dashboard (ลองทั้งสองวิธี)
export const getAdminDashboardData = async () => {
  try {
    console.log('Fetching admin dashboard data...');
    
    // ลอง fetch ปกติก่อน
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getDashboardData`, {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Dashboard data received via fetch:', result);
        
        if (result.success) {
          return result.data;
        }
      }
    } catch (fetchError) {
      console.log('Fetch failed, trying iframe method...');
    }
    
    // ถ้า fetch ไม่ได้ ลอง iframe
    try {
      const result = await fetchViaIframe('getDashboardData');
      console.log('Dashboard data received via iframe:', result);
      
      if (result.success) {
        return result.data;
      }
    } catch (iframeError) {
      console.log('Iframe method also failed:', iframeError);
    }
    
    // ถ้าทั้งสองวิธีไม่ได้ ใช้ mock data
    throw new Error('Both fetch and iframe methods failed');

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return mock data as fallback with real-looking data
    return {
      pendingOrders: 15, // จำนวนที่ดูสมจริง
      regularShops: 8,
      premiumShops: 2,
      dateRange: { 
        start: new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString('th-TH'),
        end: new Date().toLocaleDateString('th-TH')
      },
      topProducts: [
        { name: 'แครอท', totalQuantity: 25, unit: 'กิโล', shops: 5 },
        { name: 'หอมแดง', totalQuantity: 18, unit: 'กิโล', shops: 4 },
        { name: 'ผักกาดขาว', totalQuantity: 15, unit: 'กิโล', shops: 3 },
        { name: 'ไข่ไก่', totalQuantity: 12, unit: 'ฟอง', shops: 3 },
        { name: 'เต้าหู้', totalQuantity: 10, unit: 'Pack', shops: 2 }
      ],
      recentOrders: [
        { shopType: 'regular', shopName: 'ร้านค้าปกติ สาขา 1', items: 3, time: new Date(Date.now() - 30*60*1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) },
        { shopType: 'premium', shopName: 'ร้านซูชิพรีเมียม', items: 5, time: new Date(Date.now() - 60*60*1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) },
        { shopType: 'regular', shopName: 'ร้านค้าปกติ สาขา 2', items: 2, time: new Date(Date.now() - 90*60*1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) },
        { shopType: 'regular', shopName: 'ร้านค้าปกติ สาขา 3', items: 4, time: new Date(Date.now() - 120*60*1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) }
      ],
      procurementSessions: [
        { id: 'PROC-20250825-001', date: '25/08/2025', orders: 32, status: 'completed' },
        { id: 'PROC-20250818-001', date: '18/08/2025', orders: 28, status: 'completed' },
        { id: 'PROC-20250811-001', date: '11/08/2025', orders: 35, status: 'completed' }
      ],
      error: 'ใช้ข้อมูลจำลอง - ไม่สามารถเชื่อมต่อ Google Apps Script'
    };
  }
};

// ดึงข้อมูล orders แยกตาม shop type
export const getOrdersByShopType = async (startDate = null, endDate = null) => {
  try {
    console.log('Fetching orders by shop type...');
    
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    // ลอง fetch ก่อน
    try {
      let url = `${APPS_SCRIPT_URL}?action=getOrdersByShopType`;
      if (Object.keys(params).length > 0) {
        url += '&' + new URLSearchParams(params).toString();
      }
      
      const response = await fetch(url, { method: 'GET' });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
    } catch (fetchError) {
      console.log('Fetch failed, trying iframe...');
    }
    
    // ลอง iframe
    const result = await fetchViaIframe('getOrdersByShopType', params);
    if (result.success) {
      return result.data;
    }
    
    throw new Error('Failed to get orders data');

  } catch (error) {
    console.error('Error fetching orders data:', error);
    throw error;
  }
};

// สร้าง Procurement Session ใหม่
export const createProcurementSession = async () => {
  try {
    console.log('Creating new procurement session...');
    
    // ลอง fetch ก่อน
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=createProcurementSession`, {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
    } catch (fetchError) {
      console.log('Fetch failed, trying iframe...');
    }
    
    // ลอง iframe
    const result = await fetchViaIframe('createProcurementSession');
    if (result.success) {
      return result.data;
    }
    
    throw new Error('Failed to create procurement session');

  } catch (error) {
    console.error('Error creating procurement session:', error);
    throw error;
  }
};

// ตรวจสอบการเชื่อมต่อ (ใช้วิธีง่ายๆ)
export const checkAdminConnection = async () => {
  try {
    // ลองเรียก getDashboardData แทนการ ping
    const result = await fetch(`${APPS_SCRIPT_URL}?action=getDashboardData`);
    return result.ok;
  } catch (error) {
    return false;
  }
};

// Helper functions
export const formatThaiDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Bangkok'
    });
  } catch (error) {
    return dateString;
  }
};

export const formatThaiTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    });
  } catch (error) {
    return dateString;
  }
};