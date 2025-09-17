import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4HGqa0Ze1bz9FEG0rYWA8Ycz6-vE_hwc",
  authDomain: "greenmind-21e8f.firebaseapp.com",
  projectId: "greenmind-21e8f",
  storageBucket: "greenmind-21e8f.firebasestorage.app",   // ✅ corrected bucket
  messagingSenderId: "730432168258",
  appId: "1:730432168258:web:674e005b58d133d8d9a8db",
  measurementId: "G-ZG2K8GH8Q9"
};

// Ensure only one app instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth (React Native persistence safe)
export const auth = getAuth(app) || initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Firestore
export const db = getFirestore(app);

// Storage (force correct bucket)
export const storage = getStorage(app, "gs://greenmind-21e8f.firebasestorage.app");

export default app;
