// src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { 
  fetchProductsFromSheets, 
  categorizeProducts, 
  getCachedProducts, 
  setCachedProducts 
} from '../services/googleSheetsService';

// ใส่ Google Sheets URL และ Sheet GID ของคุณที่นี่
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1Dmlk4uP4828FN3guLYXVi2zzENMZ-GcwOiM7sJX0ipc/edit';
const SHEET_GID = '1313232357'; // gid ของชีท "รายการสินค้า"

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // ตรวจสอบ cache ก่อน
      if (!forceRefresh) {
        const cached = getCachedProducts();
        if (cached) {
          setProducts(cached);
          setCategories(categorizeProducts(cached));
          setLoading(false);
          return;
        }
      }

      // ดึงข้อมูลจาก Google Sheets
      const fetchedProducts = await fetchProductsFromSheets(GOOGLE_SHEETS_URL, SHEET_GID);
      
      // เก็บ cache
      setCachedProducts(fetchedProducts);
      
      // ตั้งค่า state
      setProducts(fetchedProducts);
      setCategories(categorizeProducts(fetchedProducts));
      
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const refreshProducts = () => {
    loadProducts(true);
  };

  return {
    products,
    categories,
    loading,
    error,
    refreshProducts
  };
};