// firebase.js - Firebase Configuration (Modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

     // Your web app's Firebase configuration
     const firebaseConfig = {
           apiKey: "AIzaSyCcVOxMeTgcwpy7gM5zaJ_cheocvaIXIzE",
           authDomain: "street-13-restaurant.firebaseapp.com",
           projectId: "street-13-restaurant",
           storageBucket: "street-13-restaurant.firebasestorage.app",
           messagingSenderId: "848426454008",
           appId: "1:848426454008:web:ae8ded40e42f77ac92240d"
    }; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase initialized successfully!");