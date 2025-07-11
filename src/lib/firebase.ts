// File: src/lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi ini ngambil data dari file .env secara aman
const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID,
};

// Inisialisasi aplikasi Firebase, dengan cek biar gak dobel
let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApps()[0];
}

// Ekspor service yang akan kita pakai di seluruh aplikasi
// Sesuai Batasan Masalah kita pake Firebase buat Backend [cite: 111]
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);