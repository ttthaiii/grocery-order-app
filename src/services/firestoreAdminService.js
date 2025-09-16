// src/services/firestoreAdminService.js - Firestore Version
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Get comprehensive dashboard data for admin
 */
export const getAdminDashboardData = async () => {
  try {
    console.log('🔍 Fetching admin dashboard data from Firestore...');
    
    const dashboardData = {
      pendingOrders: 0,
      regularShops: 0,
      premiumShops: 0,
      dateRange: {
        start: new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString('th-TH'),
        end: new Date().toLocaleDateString('th-TH')
      },
      topProducts: [],
      recentOrders: [],
      procurementSessions: [],
      pendingOrderDetails: [], // For drill-down
      isConnected: true
    };

    // 1. Get all shops with stats
    const shopsSnapshot = await getDocs(collection(db, 'shops'));
    
    if (shopsSnapshot.empty) {
      console.log('📂 No shops found in database');
      return {
        ...dashboardData,
        error: 'ไม่พบข้อมูลร้านค้าในระบบ'
      };
    }

    const allShops = [];
    const productCounts = {}; // For top products calculation
    
    // 2. Process each shop and get their orders
    for (const shopDoc of shopsSnapshot.docs) {
      const shopData = shopDoc.data();
      allShops.push({ id: shopDoc.id, ...shopData });
      
      // Count shops by type
      const shopType = shopData.shopType || 'regular';
      if (shopType === 'regular') {
        dashboardData.regularShops++;
      } else if (shopType === 'premium') {
        dashboardData.premiumShops++;
      }
      
      // Get pending orders for this shop (simplified query to avoid index requirement)
      const ordersRef = collection(db, 'shops', shopDoc.id, 'orders');
      const pendingOrdersQuery = query(
        ordersRef,
        where('status', '==', 'pending')
        // Remove orderBy to avoid composite index requirement
      );
      
      try {
        const ordersSnapshot = await getDocs(pendingOrdersQuery);
        dashboardData.pendingOrders += ordersSnapshot.size;
        
        // Process each order for detailed analytics
        ordersSnapshot.docs.forEach(orderDoc => {
          const orderData = orderDoc.data();
          const orderWithShop = {
            orderId: orderDoc.id,
            shopId: shopDoc.id,
            shopName: shopData.shopName,
            shopType: shopData.shopType,
            items: orderData.items || [],
            totalItems: orderData.summary?.totalItems || 0,
            totalQuantity: orderData.summary?.totalQuantity || 0,
            createdAt: orderData.metadata?.createdAt,
            ...orderData
          };
          
          dashboardData.pendingOrderDetails.push(orderWithShop);
          
          // Add to recent orders (limit 10 most recent)
          if (dashboardData.recentOrders.length < 10) {
            dashboardData.recentOrders.push({
              shopType: shopData.shopType,
              shopName: shopData.shopName,
              shopId: shopDoc.id,
              items: orderData.summary?.totalItems || 0,
              time: formatFirestoreTime(orderData.metadata?.createdAt),
              orderId: orderDoc.id
            });
          }
          
          // Count products for top products
          if (orderData.items) {
            orderData.items.forEach(item => {
              const productName = item.productName;
              if (!productCounts[productName]) {
                productCounts[productName] = {
                  name: productName,
                  totalQuantity: 0,
                  shops: new Set(),
                  unit: item.unit || ''
                };
              }
              productCounts[productName].totalQuantity += item.quantity || 0;
              productCounts[productName].shops.add(shopData.shopName);
            });
          }
        });
        
      } catch (orderError) {
        console.warn(`⚠️ Could not fetch orders for shop ${shopDoc.id}:`, orderError.message);
      }
    }
    
    // 3. Calculate top products
    dashboardData.topProducts = Object.values(productCounts)
      .map(product => ({
        ...product,
        shops: product.shops.size // Convert Set to count
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
    
    // 4. Sort recent orders by time (client-side since we can't use orderBy in query)
    dashboardData.recentOrders.sort((a, b) => {
      // Sort by creation time if available
      const timeA = a.createdAt || '';
      const timeB = b.createdAt || '';
      return String(timeB).localeCompare(String(timeA));
    });
    
    // 5. Mock procurement sessions (can be enhanced later)
    dashboardData.procurementSessions = await getRealProcurementSessions();
    
    console.log('✅ Dashboard data loaded successfully:', {
      pendingOrders: dashboardData.pendingOrders,
      totalShops: allShops.length,
      topProductsCount: dashboardData.topProducts.length
    });
    
    return dashboardData;
    
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    
    // Return mock data on error to prevent UI crash
    return {
      pendingOrders: 0,
      regularShops: 0,
      premiumShops: 0,
      dateRange: { 
        start: new Date(Date.now() - 7*24*60*60*1000).toLocaleDateString('th-TH'),
        end: new Date().toLocaleDateString('th-TH')
      },
      topProducts: [],
      recentOrders: [],
      procurementSessions: [],
      pendingOrderDetails: [],
      isConnected: false,
      error: `Connection error: ${error.message}`
    };
  }
};

/**
 * Get orders filtered by shop type and date range
 */
export const getOrdersByShopType = async (startDate = null, endDate = null) => {
  try {
    console.log('🔍 Fetching orders by shop type...', { startDate, endDate });
    
    const result = {
      regular: [],
      premium: [],
      totalOrders: 0,
      dateRange: { startDate, endDate }
    };
    
    // Get all shops
    const shopsSnapshot = await getDocs(collection(db, 'shops'));
    
    for (const shopDoc of shopsSnapshot.docs) {
      const shopData = shopDoc.data();
      const shopType = shopData.shopType || 'regular';
      
      // Build orders query
      const ordersRef = collection(db, 'shops', shopDoc.id, 'orders');
      let ordersQuery = query(ordersRef, orderBy('metadata.createdAt', 'desc'));
      
      // Add date filtering if provided
      if (startDate || endDate) {
        // Note: Date filtering with Firestore Timestamps requires proper conversion
        // For now, we'll fetch all and filter client-side
      }
      
      const ordersSnapshot = await getDocs(ordersQuery);
      
      ordersSnapshot.docs.forEach(orderDoc => {
        const orderData = orderDoc.data();
        const orderWithShop = {
          orderId: orderDoc.id,
          shopId: shopDoc.id,
          shopName: shopData.shopName,
          shopType: shopData.shopType,
          createdAt: orderData.metadata?.createdAt,
          summary: orderData.summary,
          status: orderData.status,
          ...orderData
        };
        
        // Filter by date if provided (client-side for now)
        if (startDate || endDate) {
          const orderDate = orderData.metadata?.createdAt?.toDate();
          if (orderDate) {
            if (startDate && orderDate < new Date(startDate)) return;
            if (endDate && orderDate > new Date(endDate)) return;
          }
        }
        
        if (shopType === 'regular') {
          result.regular.push(orderWithShop);
        } else if (shopType === 'premium') {
          result.premium.push(orderWithShop);
        }
        
        result.totalOrders++;
      });
    }
    
    console.log('✅ Orders by shop type loaded:', {
      regular: result.regular.length,
      premium: result.premium.length,
      total: result.totalOrders
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Error fetching orders by shop type:', error);
    throw error;
  }
};

/**
 * Test Firestore connection
 */
export const checkAdminConnection = async () => {
  try {
    // Simple connectivity test
    const testQuery = query(collection(db, 'shops'), limit(1));
    await getDocs(testQuery);
    
    console.log('✅ Firestore admin connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore admin connection failed:', error);
    return false;
  }
};

/**
 * Helper function to format Firestore timestamp for display
 */
export const formatFirestoreTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    });
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'N/A';
  }
};

/**
 * Helper function to format Thai date
 */
export const formatThaiDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Bangkok'
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Generate mock procurement sessions for demo
 */
const generateMockProcurementSessions = () => {
  const sessions = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7)); // Weekly sessions
    
    sessions.push({
      id: `PROC-${date.toISOString().substring(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      date: formatThaiDate(date),
      orders: 25 + Math.floor(Math.random() * 15), // 25-40 orders
      status: 'completed'
    });
  }
  
  return sessions;
};

/**
 * Get detailed order information for admin review
 */
export const getOrderDetails = async (shopId, orderId) => {
  try {
    const orderRef = doc(db, 'shops', shopId, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const shopRef = doc(db, 'shops', shopId);
    const shopSnap = await getDoc(shopRef);
    
    return {
      order: { id: orderSnap.id, ...orderSnap.data() },
      shop: shopSnap.exists() ? { id: shopSnap.id, ...shopSnap.data() } : null
    };
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

/**
 * Save procurement session to Firestore
 */
const saveProcurementSession = async (sessionData) => {
  try {
    const sessionRef = doc(db, 'procurement-sessions', sessionData.sessionId);
    await setDoc(sessionRef, {
      ...sessionData,
      createdAt: serverTimestamp(),
      createdBy: 'admin' // TODO: Get from auth
    });
    
    console.log('✅ Procurement session saved to Firestore');
  } catch (error) {
    console.error('❌ Error saving procurement session:', error);
  }
};

/**
 * Get real procurement sessions from Firestore
 */
const getRealProcurementSessions = async () => {
  try {
    const sessionsRef = collection(db, 'procurement-sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'), limit(10));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.sessionId,
        date: formatThaiDate(data.createdAt),
        orders: data.ordersProcessed,
        status: data.status || 'completed'
      };
    });
    
  } catch (error) {
    console.warn('Could not fetch procurement sessions, using mock data:', error.message);
    return generateMockProcurementSessions();
  }
};

// อัปเดต createProcurementSession function:
export const createProcurementSession = async () => {
  try {
    console.log('🚀 Creating new procurement session...');
    
    // Generate session ID
    const sessionId = `PROC-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // Get all pending orders
    const pendingOrders = [];
    const shopsSnapshot = await getDocs(collection(db, 'shops'));
    
    for (const shopDoc of shopsSnapshot.docs) {
      const ordersRef = collection(db, 'shops', shopDoc.id, 'orders');
      const pendingQuery = query(
        ordersRef,
        where('status', '==', 'pending')
      );
      
      const ordersSnapshot = await getDocs(pendingQuery);
      ordersSnapshot.docs.forEach(orderDoc => {
        pendingOrders.push({
          shopId: shopDoc.id,
          orderId: orderDoc.id,
          orderData: orderDoc.data()
        });
      });
    }
    
    if (pendingOrders.length === 0) {
      throw new Error('No pending orders found to process');
    }
    
    // Update all pending orders to "summarized" status
    const batch = writeBatch(db);
    
    pendingOrders.forEach(({ shopId, orderId }) => {
      const orderRef = doc(db, 'shops', shopId, 'orders', orderId);
      batch.update(orderRef, {
        status: 'summarized',
        sessionId: sessionId,
        'metadata.summarizedAt': serverTimestamp()
      });
    });
    
    await batch.commit();
    
    const sessionData = {
      sessionId: sessionId,
      ordersProcessed: pendingOrders.length,
      status: 'completed',
      processedAt: new Date().toISOString(),
      orderIds: pendingOrders.map(o => ({ shopId: o.shopId, orderId: o.orderId }))
    };
    
    // 🔥 Save session to Firestore
    await saveProcurementSession(sessionData);
    
    console.log('✅ Procurement session created and saved:', sessionData);
    return sessionData;
    
  } catch (error) {
    console.error('❌ Error creating procurement session:', error);
    throw error;
  }
};