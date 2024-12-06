// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAX_0izZmmiN3DpOQcUrST4BEQc0xT5GU0",
  authDomain: "labw12-mcpp.firebaseapp.com",
  projectId: "labw12-mcpp",
  storageBucket: "labw12-mcpp.appspot.com", // Corrected URL
  messagingSenderId: "24526351781",
  appId: "1:24526351781:web:ab1d9e5f3a8a87f5d78c4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export
export const db = getFirestore(app);
