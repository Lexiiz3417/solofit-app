// src/lib/firebase/client.ts

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyD5BhRlDzLuFsQ6T_D6ygT5LEV5-cUi21c",
    authDomain: "skripsi-gamifikasi-dev.firebaseapp.com",
    projectId: "skripsi-gamifikasi-dev",
    storageBucket: "skripsi-gamifikasi-dev.firebasestorage.app",
    messagingSenderId: "881974990341",
    appId: "1:881974990341:web:234834d4423bea44cfae6c"
};

// Inisialisasi Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, db, auth };