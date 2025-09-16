// src/services/googleDriveImageService.js

// แปลง Google Drive URL เป็นรูปแบบที่สามารถใช้ได้
export const convertGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // ดึง file ID จาก URL
  let fileId = null;
  
  // รูปแบบ: https://drive.google.com/uc?export=view&id=FILE_ID
  if (url.includes('uc?export=view&id=')) {
    const match = url.match(/id=([a-zA-Z0-9-_]+)/);
    if (match) {
      fileId = match[1];
    }
  }
  
  // รูปแบบ: https://drive.google.com/file/d/FILE_ID/view
  else if (url.includes('/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      fileId = match[1];
    }
  }

  if (!fileId) {
    return null;
  }

  // ใช้ Google Drive thumbnail API
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`;
};

// ฟังก์ชันสำรองสำหรับใช้ proxy
export const getProxiedImageUrl = (originalUrl) => {
  if (!originalUrl) return null;
  
  const fileId = extractFileId(originalUrl);
  if (!fileId) return null;
  
  // ใช้ service อื่นเป็น proxy
  return `https://images.weserv.nl/?url=drive.google.com/uc?export=view%26id=${fileId}&w=400&h=400&fit=cover`;
};

// ดึง file ID จาก Google Drive URL
const extractFileId = (url) => {
  if (!url) return null;
  
  // รูปแบบต่างๆ ของ Google Drive URL
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

// ทดสอบ URL ว่าใช้ได้หรือไม่
export const testImageUrl = async (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // timeout หลัง 5 วินาที
    setTimeout(() => resolve(false), 5000);
  });
};

// ลองหลายวิธีในการโหลดรูป
export const getBestImageUrl = async (originalUrl) => {
  if (!originalUrl) return null;
  
  const urls = [
    convertGoogleDriveUrl(originalUrl),
    getProxiedImageUrl(originalUrl),
    originalUrl // ลองใช้ URL เดิม
  ].filter(Boolean);
  
  // ทดสอบ URL ทีละตัว
  for (const url of urls) {
    const works = await testImageUrl(url);
    if (works) {
      console.log('Working image URL found:', url);
      return url;
    }
  }
  
  console.log('No working image URL found for:', originalUrl);
  return null;
};