// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYcAtxtUQ0glGSoKYLzzNhHy4cDjH_ncE",
  authDomain: "customer-portal-f1bef.firebaseapp.com",
  projectId: "customer-portal-f1bef",
  storageBucket: "customer-portal-f1bef.firebasestorage.app",
  messagingSenderId: "908596091082",
  appId: "1:908596091082:web:2d5f558dda221c31adbc33",
  measurementId: "G-LP1G9K1955"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services that we'll use
export const db = getFirestore(app);
export const functions = getFunctions(app, 'asia-southeast1');

export default app;