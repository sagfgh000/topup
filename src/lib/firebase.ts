// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "diamond-depot-c0uf9",
  "appId": "1:655513396122:web:8aa576ea25d33963921023",
  "storageBucket": "diamond-depot-c0uf9.firebasestorage.app",
  "apiKey": "AIzaSyBt0lbDKPZqA4dgYJKPWIlEcseD89aOLhc",
  "authDomain": "diamond-depot-c0uf9.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "655513396122"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
