// src/services/googleSheetsService.js - แก้ไขให้รองรับรูปภาพ

// แปลง Google Sheets URL เป็น CSV URL
const convertToCSVUrl = (googleSheetsUrl, sheetGid = 0) => {
  const match = googleSheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error('Invalid Google Sheets URL');
  }
  
  const sheetId = match[1];
  const gidMatch = googleSheetsUrl.match(/gid=([0-9]+)/);
  const finalGid = gidMatch ? gidMatch[1] : sheetGid;
  
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${finalGid}`;
};

// ปรับปรุง Google Drive URL ให้แสดงได้ดีขึ้น
const fixGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  // ถ้าเป็น Google Drive URL แล้ว ให้ใช้เลย
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    return url;
  }
  
  // ถ้าเป็นรูปแบบอื่นของ Google Drive
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }
  
  // ถ้าเป็น URL ปกติ ให้ใช้เลย
  return url;
};

// ฟังก์ชันสำหรับ parse CSV
const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
  
  console.log('CSV Headers found:', headers);
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      // Parse CSV ที่มี comma ในข้อมูล
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim()); // เพิ่มค่าสุดท้าย
      
      // สร้าง object จาก headers และ values
      const row = {};
      headers.forEach((header, index) => {
        let value = values[index] ? values[index].replace(/"/g, '') : '';
        
        // แก้ไข URL รูปภาพถ้าเป็น column รูป
        if (header === 'รูป' || header === 'รูปภาพ' || header === 'image') {
          value = fixGoogleDriveUrl(value);
        }
        
        row[header] = value;
      });
      
      // เช็คว่ามีข้อมูลครบ
      if (row[headers[0]] && row[headers[0]] !== '') {
        data.push(row);
      }
    }
  }
  
  console.log(`Parsed ${data.length} products with images`);
  // แสดง sample data พร้อมรูป
  if (data.length > 0) {
    console.log('Sample product with image:', {
      name: data[0].รายการ,
      unit: data[0].หน่วย,
      image: data[0].รูป,
      category: data[0].ประเภทหลัก
    });
  }
  
  return data;
};

// ดึงข้อมูลจาก Google Sheets
export const fetchProductsFromSheets = async (googleSheetsUrl, sheetGid = 0) => {
  try {
    const csvUrl = convertToCSVUrl(googleSheetsUrl, sheetGid);
    
    console.log('Fetching from CSV URL:', csvUrl);
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const products = parseCSV(csvText);
    
    console.log('Fetched products:', products.length);
    console.log('Products with images:', products.filter(p => p.รูป && p.รูป.trim() !== '').length);
    
    return products;
  } catch (error) {
    console.error('Error fetching products from Google Sheets:', error);
    throw error;
  }
};

// จัดหมวดหมู่สินค้า
export const categorizeProducts = (products) => {
  const categories = {};
  
  products.forEach(product => {
    const mainCategory = product.ประเภทหลัก || 'อื่นๆ';
    const subCategory = product.ประเภทย่อย || '';
    
    if (!categories[mainCategory]) {
      categories[mainCategory] = {
        name: mainCategory,
        products: [],
        subCategories: {}
      };
    }
    
    categories[mainCategory].products.push(product);
    
    // จัดหมวดย่อย
    if (subCategory) {
      if (!categories[mainCategory].subCategories[subCategory]) {
        categories[mainCategory].subCategories[subCategory] = [];
      }
      categories[mainCategory].subCategories[subCategory].push(product);
    }
  });
  
  return categories;
};

// ค้นหาสินค้า
export const searchProducts = (products, searchTerm) => {
  if (!searchTerm) return products;
  
  const term = searchTerm.toLowerCase();
  return products.filter(product => 
    product.รายการ?.toLowerCase().includes(term) ||
    product.ประเภทหลัก?.toLowerCase().includes(term) ||
    product.ประเภทย่อย?.toLowerCase().includes(term)
  );
};

// Cache สำหรับเก็บข้อมูล
let cachedProducts = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 นาที

export const getCachedProducts = () => {
  if (cachedProducts && cacheTimestamp && 
      (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return cachedProducts;
  }
  return null;
};

export const setCachedProducts = (products) => {
  cachedProducts = products;
  cacheTimestamp = Date.now();
};