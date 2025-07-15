// /scripts/exercise/seed.ts

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { exerciseData } from './exerciseData';
import serviceAccount from '../../service-account-key.json';

// Inisialisasi Firebase Admin dengan kunci service account
initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
});

// Panggil getFirestore SETELAH inisialisasi
const db = getFirestore();

async function seedDatabase() {
    console.log('Memulai proses seeding dengan hak akses ADMIN...');
    const exercisesRef = db.collection('exercises');

    const snapshot = await exercisesRef.get();
    if (!snapshot.empty) {
        console.log('🟡 Koleksi "exercises" sudah berisi data. Seeding dibatalkan.');
        return;
    }

    console.log('Memulai seeding data latihan...');
    const batch = db.batch();
    
    exerciseData.forEach((exercise) => {
        const docRef = exercisesRef.doc(exercise.id);
        batch.set(docRef, exercise);
    });

    await batch.commit();
    console.log(`✅ Seeding berhasil! ${exerciseData.length} dokumen latihan ditambahkan.`);
}

seedDatabase().catch((error) => {
    console.error('❌ Terjadi kesalahan fatal saat seeding:', error);
});