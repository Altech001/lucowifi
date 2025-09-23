
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-2193487041-7bc42",
  appId: "1:54002096951:web:118427d6270728c31a98b2",
  apiKey: "AIzaSyAIQb9_RJSz5EKB7Xs6RXTk1UnHbfeyaMA",
  authDomain: "studio-2193487041-7bc42.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "54002096951"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
