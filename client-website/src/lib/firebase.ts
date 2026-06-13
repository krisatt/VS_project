// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBREvU51EKN8Zne1D_O9ald5Y6V7ofE6gc",
  authDomain: "loftmaxproject.firebaseapp.com",
  projectId: "loftmaxproject",
  storageBucket: "loftmaxproject.firebasestorage.app",
  messagingSenderId: "263564681671",
  appId: "1:263564681671:web:a3674116cee001e546f9e2",
  measurementId: "G-WKDWBRDKWW"
};

// Инициализация Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
};
