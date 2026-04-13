import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-28b07.firebaseapp.com",
  projectId: "reactchat-28b07",
  storageBucket: "reactchat-28b07.firebasestorage.app",
  messagingSenderId: "37255330720",
  appId: "1:37255330720:web:bb9c56305a46e0167c02c5",
  measurementId: "G-SVVSKF6KJK",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
export const googleProvider = new GoogleAuthProvider();
