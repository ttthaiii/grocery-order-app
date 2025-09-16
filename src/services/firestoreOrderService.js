// src/services/firestoreOrderService.js - Firestore Version
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
  writeBatch,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Submit order to Firestore
 * @param {Object} cart - Cart items { productName: quantity }
 * @param {Object} userInfo - User information { shopType, storeName, branchName, userEmail }
 * @returns {Promise<Object>} Order result
 */
export const submitOrderToFirestore = async (cart, userInfo = {}) => {
  try {
    console.log('🚀 Submitting order to Firestore:', { cart, userInfo });

    // Validate input
    if (!cart || Object.keys(cart).length === 0) {
      throw new Error('Cart is empty');
    }

    if (!userInfo.shopType) {
      throw new Error('Shop type is required');
    }

    // Generate unique IDs
    const orderId = generateOrderId();
    const shopId = await getOrCreateShopId(userInfo);

    // Prepare order data
    const orderData = await prepareOrderData(cart, userInfo, orderId, shopId);

    // Create batch write for atomic operations
    const batch = writeBatch(db);

    // 1. Create/update shop document
    const shopRef = doc(db, 'shops', shopId);
    const shopData = prepareShopData(userInfo, shopId);
    batch.set(shopRef, shopData, { merge: true });

    // 2. Create order document in subcollection
    const orderRef = doc(db, 'shops', shopId, 'orders', orderId);
    batch.set(orderRef, orderData);

    // 3. Update shop statistics
    const shopUpdateData = {
      'stats.totalOrders': increment(1),
      'stats.lastOrderDate': serverTimestamp(),
      'metadata.updatedAt': serverTimestamp()
    };
    batch.update(shopRef, shopUpdateData);

    // Execute batch write
    await batch.commit();

    const result = {
      success: true,
      message: 'Order submitted successfully',
      orderId: orderId,
      shopId: shopId,
      timestamp: new Date().toISOString(),
      itemCount: orderData.summary.totalItems,
      totalQuantity: orderData.summary.totalQuantity,
      shopType: userInfo.shopType
    };

    console.log('✅ Order submitted successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error submitting order to Firestore:', error);
    throw new Error(`Failed to submit order: ${error.message}`);
  }
};

/**
 * Get or create shop ID based on user info
 */
const getOrCreateShopId = async (userInfo) => {
  // For now, generate shop ID based on shop type and name
  // In production, this would come from authentication
  const shopType = userInfo.shopType || 'regular';
  const shopName = userInfo.storeName || 'Unknown Shop';
  
  // Generate consistent shop ID
  const hash = simpleHash(shopName + userInfo.userEmail);
  const prefix = {
    'regular': 'REG',
    'premium': 'PRM',
    'admin': 'ADM'
  }[shopType] || 'UNK';
  
  return `${prefix}${hash.toString().padStart(3, '0')}`;
};

/**
 * Simple hash function for generating consistent IDs
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 1000;
};

/**
 * Generate unique order ID
 */
const generateOrderId = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T.]/g, '').substring(0, 14);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

/**
 * Prepare shop data for Firestore
 */
const prepareShopData = (userInfo, shopId) => {
  return {
    shopId: shopId,
    shopType: userInfo.shopType || 'regular',
    shopName: userInfo.storeName || 'Unknown Shop',
    branchName: userInfo.branchName || 'Main Branch',
    contactInfo: {
      email: userInfo.userEmail || `${shopId}@example.com`,
      phone: '',
      address: ''
    },
    settings: {
      allowedCategories: ['all'],
      orderLimits: {
        maxItemsPerOrder: 100,
        maxOrdersPerDay: 10
      }
    },
    stats: {
      totalOrders: 0,
      lastOrderDate: null,
      averageOrderSize: 0
    },
    isActive: true,
    metadata: {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      source: 'order_submission'
    }
  };
};

/**
 * Prepare order data for Firestore
 */
const prepareOrderData = async (cart, userInfo, orderId, shopId) => {
  // Filter cart items with quantity > 0
  const cartItems = Object.entries(cart).filter(([productName, quantity]) => quantity > 0);

  if (cartItems.length === 0) {
    throw new Error('No valid items in cart');
  }

  // Prepare order items
  const items = cartItems.map(([productName, quantity]) => ({
    productName: productName,
    quantity: parseInt(quantity) || 0,
    // We'll enhance this later with product lookups
    productId: null, // TODO: Look up from products collection
    unit: '', // TODO: Get from products collection
    category: '' // TODO: Get from products collection
  }));

  // Calculate summary
  const summary = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
  };

  return {
    orderId: orderId,
    shopInfo: {
      shopId: shopId,
      shopName: userInfo.storeName || 'Unknown Shop',
      shopType: userInfo.shopType || 'regular',
      branchName: userInfo.branchName || 'Main Branch'
    },
    items: items,
    summary: summary,
    status: 'pending', // pending -> summarized -> completed
    sessionId: null, // Will be set when admin creates procurement session
    metadata: {
      createdAt: serverTimestamp(),
      submittedBy: shopId,
      submissionMethod: 'web_app',
      userAgent: navigator.userAgent
    }
  };
};

/**
 * Get orders for a specific shop
 */
export const getShopOrders = async (shopId, limitCount = 10) => {
  try {
    const ordersRef = collection(db, 'shops', shopId, 'orders');
    const q = query(
      ordersRef,
      orderBy('metadata.createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('Error fetching shop orders:', error);
    throw error;
  }
};

/**
 * Get pending orders across all shops (for admin)
 */
export const getPendingOrders = async () => {
  try {
    const shopsSnapshot = await getDocs(collection(db, 'shops'));
    const allOrders = [];

    for (const shopDoc of shopsSnapshot.docs) {
      const ordersRef = collection(db, 'shops', shopDoc.id, 'orders');
      const q = query(
        ordersRef,
        where('status', '==', 'pending'),
        orderBy('metadata.createdAt', 'desc')
      );

      const ordersSnapshot = await getDocs(q);
      ordersSnapshot.docs.forEach(orderDoc => {
        allOrders.push({
          id: orderDoc.id,
          shopId: shopDoc.id,
          ...orderDoc.data()
        });
      });
    }

    // Sort by creation time
    allOrders.sort((a, b) => {
      const timeA = a.metadata?.createdAt?.toDate() || new Date(0);
      const timeB = b.metadata?.createdAt?.toDate() || new Date(0);
      return timeB - timeA;
    });

    return allOrders;

  } catch (error) {
    console.error('Error fetching pending orders:', error);
    throw error;
  }
};

/**
 * Update order status (for admin operations)
 */
export const updateOrderStatus = async (shopId, orderId, newStatus, sessionId = null) => {
  try {
    const orderRef = doc(db, 'shops', shopId, 'orders', orderId);
    const updateData = {
      status: newStatus,
      'metadata.updatedAt': serverTimestamp()
    };

    if (sessionId) {
      updateData.sessionId = sessionId;
    }

    await updateDoc(orderRef, updateData);
    
    console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    return { success: true };

  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get order statistics for dashboard
 */
export const getOrderStatistics = async (dateRange = null) => {
  try {
    const stats = {
      totalPendingOrders: 0,
      totalShops: 0,
      shopsByType: {
        regular: 0,
        premium: 0,
        admin: 0
      },
      recentOrders: [],
      topProducts: {}
    };

    // Get all shops
    const shopsSnapshot = await getDocs(collection(db, 'shops'));
    stats.totalShops = shopsSnapshot.size;

    // Count shops by type and get orders
    for (const shopDoc of shopsSnapshot.docs) {
      const shopData = shopDoc.data();
      const shopType = shopData.shopType || 'regular';
      stats.shopsByType[shopType]++;

      // Get recent pending orders
      const ordersRef = collection(db, 'shops', shopDoc.id, 'orders');
      const q = query(
        ordersRef,
        where('status', '==', 'pending'),
        orderBy('metadata.createdAt', 'desc'),
        limit(5)
      );

      const ordersSnapshot = await getDocs(q);
      stats.totalPendingOrders += ordersSnapshot.size;

      // Add to recent orders
      ordersSnapshot.docs.forEach(orderDoc => {
        const orderData = orderDoc.data();
        stats.recentOrders.push({
          orderId: orderDoc.id,
          shopId: shopDoc.id,
          shopName: shopData.shopName,
          shopType: shopData.shopType,
          itemCount: orderData.summary?.totalItems || 0,
          createdAt: orderData.metadata?.createdAt
        });

        // Count product quantities
        orderData.items?.forEach(item => {
          const productName = item.productName;
          if (!stats.topProducts[productName]) {
            stats.topProducts[productName] = {
              name: productName,
              totalQuantity: 0,
              orderCount: 0,
              shops: new Set()
            };
          }
          stats.topProducts[productName].totalQuantity += item.quantity;
          stats.topProducts[productName].orderCount++;
          stats.topProducts[productName].shops.add(shopData.shopName);
        });
      });
    }

    // Convert top products to array and sort
    const topProductsArray = Object.values(stats.topProducts)
      .map(product => ({
        ...product,
        shops: product.shops.size // Convert Set to count
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    stats.topProducts = topProductsArray;

    // Sort recent orders
    stats.recentOrders.sort((a, b) => {
      const timeA = a.createdAt?.toDate() || new Date(0);
      const timeB = b.createdAt?.toDate() || new Date(0);
      return timeB - timeA;
    });

    return stats;

  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

/**
 * Connection test function
 */
export const testFirestoreConnection = async () => {
  try {
    // Simple test: try to read from products collection
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(1));
    await getDocs(q);
    
    console.log('✅ Firestore connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    return false;
  }
};