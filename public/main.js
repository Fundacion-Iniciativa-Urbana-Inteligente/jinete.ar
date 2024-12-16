import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4tzqkpRG1jK56WHkKLL6QQrf_myG7IaY",
  authDomain: "jinete-ar.firebaseapp.com",
  projectId: "jinete-ar",
  storageBucket: "jinete-ar.firebasestorage.app",
  messagingSenderId: "784654587373",
  appId: "1:784654587373:web:7073fbb416818eb5ed83e4",
  measurementId: "G-BDT2HGW1ED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));