// src/lib/firebase/server.ts
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Impor data JSON-nya
import serviceAccountData from '../../../serviceAccountKey.json';

// --- PERBAIKAN: Yakinkan TypeScript dengan 'as ServiceAccount' ---
const serviceAccount = serviceAccountData as ServiceAccount;
// -----------------------------------------------------------------

// Cek apakah aplikasi sudah diinisialisasi biar gak dobel
if (!getApps().length) {
	initializeApp({
		// Sekarang TypeScript percaya kalo serviceAccount ini valid
		credential: cert(serviceAccount)
	});
}

// Ekspor instance db untuk dipake di server-side
export const db = getFirestore();