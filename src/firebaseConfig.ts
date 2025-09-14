import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4HGqa0Ze1bz9FEG0rYWA8Ycz6-vE_hwc",
  authDomain: "greenmind-21e8f.firebaseapp.com",
  projectId: "greenmind-21e8f",
  storageBucket: "greenmind-21e8f.appspot.com",
  messagingSenderId: "730432168258",
  appId: "1:730432168258:web:674e005b58d133d8d9a8db",
  measurementId: "G-ZG2K8GH8Q9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize and export storage

export default app;

