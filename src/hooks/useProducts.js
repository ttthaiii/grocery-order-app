// src/hooks/useProducts.js - Firebase Firestore Version
import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedProducts = null;
let cacheTimestamp = null;

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless force refresh)
      if (!forceRefresh && cachedProducts && cacheTimestamp && 
          (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        console.log('Using cached products');
        setProducts(cachedProducts);
        setCategories(categorizeProducts(cachedProducts));
        setLoading(false);
        return;
      }

      console.log('Fetching products from Firestore...');
      
      // Fetch products from Firestore
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.warn('No products found in Firestore');
        setProducts([]);
        setCategories({});
        setLoading(false);
        return;
      }

      // Transform Firestore documents to expected format
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          // Map Firestore fields to Google Sheets format for compatibility
          รายการ: data.name,
          หน่วย: data.unit,
          รูป: data.imageUrl,
          ประเภทหลัก: data.mainCategory,
          ประเภทย่อย: data.subCategory,
          // Keep Firestore fields for future use
          productId: data.productId,
          description: data.description,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          metadata: data.metadata
        };
      });

      console.log(`✅ Fetched ${fetchedProducts.length} products from Firestore`);
      
      // Update cache
      cachedProducts = fetchedProducts;
      cacheTimestamp = Date.now();
      
      // Update state
      setProducts(fetchedProducts);
      setCategories(categorizeProducts(fetchedProducts));
      
    } catch (err) {
      console.error('❌ Error loading products from Firestore:', err);
      setError(err.message);
      
      // Fallback to empty state
      setProducts([]);
      setCategories({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const refreshProducts = () => {
    console.log('🔄 Force refreshing products...');
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

// Helper function to categorize products (same as before)
const categorizeProducts = (products) => {
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
    
    // Handle subcategories
    if (subCategory) {
      if (!categories[mainCategory].subCategories[subCategory]) {
        categories[mainCategory].subCategories[subCategory] = [];
      }
      categories[mainCategory].subCategories[subCategory].push(product);
    }
  });
  
  console.log('📊 Categories created:', Object.keys(categories));
  return categories;
};

// Additional utility functions for Firestore operations
export const useProductOperations = () => {
  // Get single product by ID
  const getProductById = async (productId) => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('productId', '==', productId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      return snapshot.docs[0].data();
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  };

  // Search products
  const searchProducts = async (searchTerm, category = null) => {
    try {
      let q = collection(db, 'products');
      
      // Add category filter if specified
      if (category && category !== 'all') {
        q = query(q, where('mainCategory', '==', category));
      }
      
      q = query(q, where('isActive', '==', true));
      
      const snapshot = await getDocs(q);
      const allProducts = snapshot.docs.map(doc => doc.data());
      
      // Client-side text search (Firestore doesn't have full-text search)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return allProducts.filter(product => 
          product.name?.toLowerCase().includes(term) ||
          product.mainCategory?.toLowerCase().includes(term) ||
          product.subCategory?.toLowerCase().includes(term)
        );
      }
      
      return allProducts;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  };

  return {
    getProductById,
    searchProducts
  };
};

// Clear cache function (useful for development)
export const clearProductsCache = () => {
  cachedProducts = null;
  cacheTimestamp = null;
  console.log('🗑️ Products cache cleared');
};