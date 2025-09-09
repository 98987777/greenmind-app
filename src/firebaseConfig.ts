// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4HGqa0Ze1bz9FEG0rYWA8Ycz6-vE_hwc",
  authDomain: "greenmind-21e8f.firebaseapp.com",
  projectId: "greenmind-21e8f",
  storageBucket: "greenmind-21e8f.firebasestorage.app",
  messagingSenderId: "730432168258",
  appId: "1:730432168258:web:674e005b58d133d8d9a8db",
  measurementId: "G-ZG2K8GH8Q9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);