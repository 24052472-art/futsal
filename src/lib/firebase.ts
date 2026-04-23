import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBizYMp6y0s9Z_An1VK-07AWUY8myR_MN4",
  authDomain: "futsal-fc566.firebaseapp.com",
  projectId: "futsal-fc566",
  storageBucket: "futsal-fc566.firebasestorage.app",
  messagingSenderId: "1068047182618",
  appId: "1:1068047182618:web:6c800947ef1419be915aa3",
  measurementId: "G-0NDVCZLC59"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, db, googleProvider };
