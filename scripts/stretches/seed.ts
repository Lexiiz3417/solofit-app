// /scripts/stretching/seed.ts

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { stretchingData } from './stretchesData';
import serviceAccount from '../../service-account-key.json'; 

// Inisialisasi Firebase Admin dengan kunci service account
initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
});

// Panggil getFirestore SETELAH inisialisasi
const db = getFirestore();

async function seedStretches() {
    console.log('Memulai proses seeding data peregangan...');
    const stretchesRef = db.collection('stretches');

    // Cek apakah koleksi sudah berisi data
    const snapshot = await stretchesRef.get();
    if (!snapshot.empty) {
        console.log('🟡 Koleksi "stretches" sudah berisi data. Seeding dibatalkan.');
        return;
    }

    console.log('Memulai seeding data peregangan...');
    const batch = db.batch();
    
    stretchingData.forEach((stretch) => {
        // Gunakan ID dari data sebagai ID dokumen
        const docRef = stretchesRef.doc(stretch.id);
        batch.set(docRef, stretch);
    });

    await batch.commit();
    console.log(`✅ Seeding berhasil! ${stretchingData.length} dokumen peregangan ditambahkan.`);
}

seedStretches().catch((error) => {
    console.error('❌ Terjadi kesalahan fatal saat seeding:', error);
});