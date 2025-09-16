// ===================================================================
// Firebase Migration Scripts - จาก Google Sheets ไป Firestore
// ===================================================================

// 1. Firebase Configuration & Services
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  writeBatch,
  getDocs,
  query,
  orderBy 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCYcAtxtUQ0glGSoKYLzzNhHy4cDjH_ncE",
  authDomain: "customer-portal-f1bef.firebaseapp.com",
  projectId: "customer-portal-f1bef",
  storageBucket: "customer-portal-f1bef.firebasestorage.app",
  messagingSenderId: "908596091082",
  appId: "1:908596091082:web:2d5f558dda221c31adbc33"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ===================================================================
// 2. Google Sheets Data Fetching Service
// ===================================================================

const GOOGLE_SHEETS_CONFIG = {
  SPREADSHEET_ID: '1Dmlk4uP4828FN3guLYXVi2zzENMZ-GcwOiM7sJX0ipc',
  PRODUCTS_SHEET_GID: '1313232357', // รายการสินค้า
  ORDERS_SHEET_GID: '0' // Orders sheet
};

class GoogleSheetsService {
  static async fetchSheetData(sheetGid) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/export?format=csv&gid=${sheetGid}`;
    
    console.log(`Fetching data from: ${csvUrl}`);
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.status}`);
    }
    
    const csvText = await response.text();
    return this.parseCSV(csvText);
  }
  
  static parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = this.parseCSVLine(lines[i]);
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].replace(/"/g, '').trim() : '';
      });
      
      // Skip empty rows
      if (row[headers[0]] && row[headers[0]] !== '') {
        data.push(row);
      }
    }
    
    return data;
  }
  
  static parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    return values;
  }
}

// ===================================================================
// 3. Products Migration
// ===================================================================

class ProductsMigration {
  static async migrateProducts() {
    console.log('🚀 Starting Products Migration...');
    
    try {
      // 1. Fetch products from Google Sheets
      const productsData = await GoogleSheetsService.fetchSheetData(
        GOOGLE_SHEETS_CONFIG.PRODUCTS_SHEET_GID
      );
      
      console.log(`📊 Found ${productsData.length} products to migrate`);
      
      // 2. Transform data structure
      const transformedProducts = this.transformProductsData(productsData);
      
      // 3. Batch upload to Firestore
      await this.batchUploadProducts(transformedProducts);
      
      console.log('✅ Products migration completed successfully!');
      return {
        success: true,
        migrated: transformedProducts.length,
        products: transformedProducts
      };
      
    } catch (error) {
      console.error('❌ Products migration failed:', error);
      throw error;
    }
  }
  
  static transformProductsData(rawProducts) {
    return rawProducts.map((product, index) => {
      // Map Google Sheets columns to Firestore structure
      return {
        // Use index-based ID for consistency (can be changed later)
        productId: `prod_${(index + 1).toString().padStart(4, '0')}`,
        name: product['รายการ'] || product['Product'] || '',
        unit: product['หน่วย'] || product['Unit'] || '',
        mainCategory: product['ประเภทหลัก'] || product['Main Category'] || 'อื่นๆ',
        subCategory: product['ประเภทย่อย'] || product['Sub Category'] || '',
        imageUrl: product['รูป'] || product['Image'] || '',
        description: product['รายละเอียด'] || product['Description'] || '',
        isActive: true,
        sortOrder: index + 1,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'migration_script',
          source: 'google_sheets'
        }
      };
    }).filter(product => product.name && product.name.trim() !== '');
  }
  
  static async batchUploadProducts(products) {
    const batch = writeBatch(db);
    const BATCH_SIZE = 500; // Firestore batch limit
    
    console.log(`📝 Uploading ${products.length} products in batches...`);
    
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batchProducts = products.slice(i, i + BATCH_SIZE);
      const currentBatch = writeBatch(db);
      
      batchProducts.forEach(product => {
        const docRef = doc(db, 'products', product.productId);
        currentBatch.set(docRef, product);
      });
      
      await currentBatch.commit();
      console.log(`   ✓ Batch ${Math.floor(i/BATCH_SIZE) + 1} uploaded (${batchProducts.length} items)`);
    }
  }
}

// ===================================================================
// 4. Orders Migration  
// ===================================================================

class OrdersMigration {
  static async migrateOrders() {
    console.log('🚀 Starting Orders Migration...');
    
    try {
      // 1. Fetch orders from Google Sheets
      const ordersData = await GoogleSheetsService.fetchSheetData(
        GOOGLE_SHEETS_CONFIG.ORDERS_SHEET_GID
      );
      
      console.log(`📊 Found ${ordersData.length} order entries to process`);
      
      // 2. Group and transform orders
      const { shops, orders } = this.transformOrdersData(ordersData);
      
      // 3. Upload shops and orders
      await this.batchUploadShops(shops);
      await this.batchUploadOrders(orders);
      
      console.log('✅ Orders migration completed successfully!');
      return {
        success: true,
        shops: Object.keys(shops).length,
        orders: Object.keys(orders).length
      };
      
    } catch (error) {
      console.error('❌ Orders migration failed:', error);
      throw error;
    }
  }
  
  static transformOrdersData(rawOrders) {
    const shops = {};
    const orders = {};
    
    // Group orders by shop and order date
    const orderGroups = {};
    
    rawOrders.forEach(row => {
      if (!row['รหัสร้าน'] && !row['ชื่อร้าน']) return;
      
      const shopId = row['รหัสร้าน'] || this.generateShopId(
        row['ประเภทร้าน'] || 'regular',
        row['ชื่อร้าน'] || 'ร้านไม่ระบุ'
      );
      
      const orderDate = row['วันเวลาสั่ง'] || new Date().toISOString();
      const orderKey = `${shopId}_${orderDate.substring(0, 16)}`; // Group by shop + date+hour
      
      // Create shop record
      if (!shops[shopId]) {
        shops[shopId] = {
          shopId: shopId,
          shopType: row['ประเภทร้าน'] || 'regular',
          shopName: row['ชื่อร้าน'] || 'ร้านไม่ระบุ',
          branchName: row['สาขา'] || 'สาขาหลัก',
          contactInfo: {
            email: row['อีเมล'] || `${shopId}@example.com`,
            phone: '',
            address: ''
          },
          settings: {
            allowedCategories: ['all'],
            orderLimits: {
              maxItemsPerOrder: 100,
              maxOrdersPerDay: 5
            }
          },
          stats: {
            totalOrders: 0,
            lastOrderDate: orderDate,
            averageOrderSize: 0
          },
          isActive: true,
          metadata: {
            createdAt: orderDate,
            updatedAt: new Date().toISOString(),
            lastLoginAt: orderDate,
            source: 'google_sheets_migration'
          }
        };
      }
      
      // Group order items
      if (!orderGroups[orderKey]) {
        orderGroups[orderKey] = {
          orderId: this.generateOrderId(orderDate),
          shopId: shopId,
          shopInfo: {
            shopId: shopId,
            shopName: shops[shopId].shopName,
            shopType: shops[shopId].shopType
          },
          items: [],
          metadata: {
            createdAt: orderDate,
            submittedBy: shopId
          }
        };
      }
      
      // Add item to order
      if (row['รายการสินค้า'] && parseInt(row['จำนวน']) > 0) {
        orderGroups[orderKey].items.push({
          productId: `prod_${this.findProductIndex(row['รายการสินค้า'])}`,
          productName: row['รายการสินค้า'],
          quantity: parseInt(row['จำนวน']) || 0,
          unit: row['หน่วย'] || '',
          category: this.guessCategory(row['รายการสินค้า'])
        });
      }
    });
    
    // Finalize orders
    Object.values(orderGroups).forEach(order => {
      if (order.items.length > 0) {
        order.summary = {
          totalItems: order.items.length,
          totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0)
        };
        order.status = 'pending';
        order.sessionId = null;
        
        orders[order.orderId] = order;
        
        // Update shop stats
        shops[order.shopId].stats.totalOrders++;
        shops[order.shopId].stats.averageOrderSize = 
          (shops[order.shopId].stats.averageOrderSize + order.summary.totalItems) / 2;
      }
    });
    
    return { shops, orders };
  }
  
  static generateShopId(shopType, shopName) {
    const prefix = {
      'regular': 'REG',
      'premium': 'PRM',
      'admin': 'ADM'
    }[shopType] || 'UNK';
    
    // Simple hash of shop name
    let hash = 0;
    for (let i = 0; i < shopName.length; i++) {
      const char = shopName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const shopNumber = (Math.abs(hash) % 1000).toString().padStart(3, '0');
    return `${prefix}${shopNumber}`;
  }
  
  static generateOrderId(dateString) {
    const date = new Date(dateString);
    const timestamp = date.toISOString().replace(/[-:T.]/g, '').substring(0, 14);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
  
  static findProductIndex(productName) {
    // This would normally query the products collection
    // For now, return a placeholder
    return Math.floor(Math.random() * 1000).toString().padStart(4, '0');
  }
  
  static guessCategory(productName) {
    const categoryKeywords = {
      'ผักและผลไม้': ['ผัก', 'แครอท', 'หอม', 'กะหล่ำ', 'มะเขือ', 'องุ่น', 'แอปเปิ้ล'],
      'อาหารทะเล และเนื้อสัตว์': ['ปลา', 'กุ้ง', 'หมู', 'เนื้อ', 'ไก่', 'แซลมอน'],
      'อาหารแช่แข็ง และอาหารแปรรูป': ['แช่แข็ง', 'โมเมน', 'เต้าหู้'],
      'ของแห้งและเครื่องปรุง': ['น้ำมัน', 'เกลือ', 'น้ำตาล', 'เครื่องปรุง'],
      'ของใช้': ['ถุง', 'กล่อง', 'ผงซักฟอก']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => productName.includes(keyword))) {
        return category;
      }
    }
    
    return 'อื่นๆ';
  }
  
  static async batchUploadShops(shops) {
    const shopsList = Object.values(shops);
    console.log(`📝 Uploading ${shopsList.length} shops...`);
    
    for (const shop of shopsList) {
      const docRef = doc(db, 'shops', shop.shopId);
      await setDoc(docRef, shop);
    }
    
    console.log('   ✓ Shops uploaded successfully');
  }
  
  static async batchUploadOrders(orders) {
    const ordersList = Object.values(orders);
    console.log(`📝 Uploading ${ordersList.length} orders...`);
    
    for (const order of ordersList) {
      // Upload to subcollection: shops/{shopId}/orders/{orderId}
      const docRef = doc(db, 'shops', order.shopId, 'orders', order.orderId);
      await setDoc(docRef, order);
    }
    
    console.log('   ✓ Orders uploaded successfully');
  }
}

// ===================================================================
// 5. Suppliers Data Creation
// ===================================================================

class SuppliersMigration {
  static async createSuppliersData() {
    console.log('🚀 Creating Suppliers Data...');
    
    // Based on your existing ใบแยกตลาด.xlsx categories
    const suppliersData = [
      {
        supplierId: 'SUP001',
        supplierName: 'ตลาดไท',
        supplierType: 'market',
        categories: ['ผักและผลไม้', 'ของแห้งและเครื่องปรุง'],
        contactInfo: {
          contactPerson: 'คุณสมศรี',
          phone: '02-123-4567',
          email: 'contact@talad-thai.com',
          address: 'ตลาดไท รังสิต ปทุมธานี',
          businessHours: '03:00-12:00'
        },
        capabilities: {
          deliveryService: true,
          minimumOrder: 1000,
          paymentTerms: 'cash',
          qualityCertifications: ['HACCP']
        },
        performance: {
          reliabilityScore: 4.5,
          avgDeliveryTime: 24,
          lastOrderDate: new Date().toISOString(),
          totalOrders: 0
        },
        isActive: true,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: 'migration_script'
        }
      },
      {
        supplierId: 'SUP002',
        supplierName: 'ตลาดคลองเตย',
        supplierType: 'market',
        categories: ['อาหารทะเล และเนื้อสัตว์', 'อาหารแช่แข็ง และอาหารแปรรูป'],
        contactInfo: {
          contactPerson: 'คุณสมชาย',
          phone: '02-234-5678',
          email: 'info@klong-toey-market.com',
          address: 'ตลาดคลองเตย กรุงเทพ',
          businessHours: '04:00-14:00'
        },
        capabilities: {
          deliveryService: true,
          minimumOrder: 1500,
          paymentTerms: 'credit30',
          qualityCertifications: ['HACCP', 'GMP']
        },
        performance: {
          reliabilityScore: 4.2,
          avgDeliveryTime: 18,
          lastOrderDate: new Date().toISOString(),
          totalOrders: 0
        },
        isActive: true,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: 'migration_script'
        }
      },
      {
        supplierId: 'SUP003',
        supplierName: 'บริษัท โฮลเซล จำกัด',
        supplierType: 'wholesaler',
        categories: ['ของใช้', 'ของแห้งและเครื่องปรุง'],
        contactInfo: {
          contactPerson: 'คุณสมหญิง',
          phone: '02-345-6789',
          email: 'sales@wholesale.co.th',
          address: 'สำโรง สมุทรปราการ',
          businessHours: '08:00-17:00'
        },
        capabilities: {
          deliveryService: true,
          minimumOrder: 2000,
          paymentTerms: 'credit60',
          qualityCertifications: ['ISO9001']
        },
        performance: {
          reliabilityScore: 4.0,
          avgDeliveryTime: 48,
          lastOrderDate: new Date().toISOString(),
          totalOrders: 0
        },
        isActive: true,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: 'migration_script'
        }
      }
    ];
    
    // Upload suppliers to Firestore
    for (const supplier of suppliersData) {
      const docRef = doc(db, 'suppliers', supplier.supplierId);
      await setDoc(docRef, supplier);
    }
    
    console.log(`✅ Created ${suppliersData.length} suppliers successfully!`);
    return suppliersData;
  }
}

// ===================================================================
// 6. Main Migration Controller
// ===================================================================

class MigrationController {
  static async runFullMigration() {
    console.log('🎯 Starting Full Database Migration...');
    console.log('=====================================');
    
    const results = {
      startTime: new Date().toISOString(),
      products: null,
      orders: null,
      suppliers: null,
      endTime: null,
      duration: null,
      errors: []
    };
    
    try {
      // Step 1: Products Migration
      console.log('\n1. 🛍️ Products Migration');
      results.products = await ProductsMigration.migrateProducts();
      
      // Step 2: Orders Migration  
      console.log('\n2. 📝 Orders & Shops Migration');
      results.orders = await OrdersMigration.migrateOrders();
      
      // Step 3: Suppliers Creation
      console.log('\n3. 🏢 Suppliers Creation');
      results.suppliers = await SuppliersMigration.createSuppliersData();
      
      results.endTime = new Date().toISOString();
      results.duration = new Date(results.endTime) - new Date(results.startTime);
      
      console.log('\n🎉 Migration Completed Successfully!');
      console.log('=====================================');
      console.log(`⏱️  Duration: ${results.duration}ms`);
      console.log(`📦 Products: ${results.products.migrated}`);
      console.log(`🏪 Shops: ${results.orders.shops}`);
      console.log(`📋 Orders: ${results.orders.orders}`);  
      console.log(`🏢 Suppliers: ${results.suppliers.length}`);
      
      return results;
      
    } catch (error) {
      results.errors.push(error.message);
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
  
  static async runStepByStep() {
    console.log('Choose migration step:');
    console.log('1. Products only');
    console.log('2. Orders & Shops only');
    console.log('3. Suppliers only');
    console.log('4. Full migration');
    
    // This would be called from a UI interface
    return this.runFullMigration();
  }
  
  // Verification functions
  static async verifyMigration() {
    console.log('🔍 Verifying migration results...');
    
    const verification = {
      products: await this.verifyCollection('products'),
      shops: await this.verifyCollection('shops'),
      suppliers: await this.verifyCollection('suppliers'),
      sampleOrder: await this.verifySampleOrder()
    };
    
    console.log('📊 Verification Results:');
    console.log('Products:', verification.products);
    console.log('Shops:', verification.shops);
    console.log('Suppliers:', verification.suppliers);
    console.log('Sample Order:', verification.sampleOrder);
    
    return verification;
  }
  
  static async verifyCollection(collectionName) {
    const snapshot = await getDocs(collection(db, collectionName));
    return {
      count: snapshot.size,
      sampleDoc: snapshot.docs[0]?.data() || null
    };
  }
  
  static async verifySampleOrder() {
    // Get first shop
    const shopsSnapshot = await getDocs(query(collection(db, 'shops')));
    if (shopsSnapshot.empty) return null;
    
    const firstShop = shopsSnapshot.docs[0];
    const ordersSnapshot = await getDocs(
      collection(db, 'shops', firstShop.id, 'orders')
    );
    
    return {
      shopId: firstShop.id,
      ordersCount: ordersSnapshot.size,
      sampleOrder: ordersSnapshot.docs[0]?.data() || null
    };
  }
}

// ===================================================================
// 7. Usage Examples & Testing
// ===================================================================

// Example usage:
// MigrationController.runFullMigration()
//   .then(results => console.log('Migration completed:', results))
//   .catch(error => console.error('Migration failed:', error));

// Step-by-step usage:
// ProductsMigration.migrateProducts();
// OrdersMigration.migrateOrders();
// SuppliersMigration.createSuppliersData();

export {
  MigrationController,
  ProductsMigration,
  OrdersMigration,
  SuppliersMigration,
  GoogleSheetsService
};