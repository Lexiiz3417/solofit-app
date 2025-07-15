// /src/lib/services/adminService.ts

import { db } from '$lib/firebase';
import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { exerciseData } from '$lib/data/exerciseData';

export async function seedExercises() {
    console.log('Memulai proses seeding dari API endpoint...');
    const exercisesRef = collection(db, 'exercises');

    const snapshot = await getDocs(exercisesRef);
    if (!snapshot.empty) {
        const message = 'Koleksi "exercises" sudah berisi data. Seeding dibatalkan.';
        console.log(message);
        return { success: false, message };
    }

    try {
        // Gunakan batch write untuk operasi yang lebih efisien dan atomik
        const batch = writeBatch(db);

        exerciseData.forEach((exercise) => {
            const docRef = doc(db, 'exercises', exercise.id);
            batch.set(docRef, exercise);
        });

        await batch.commit(); // Kirim semua operasi tulis sekaligus

        const message = `✅ Seeding data latihan berhasil diselesaikan! ${exerciseData.length} dokumen ditambahkan.`;
        console.log(message);
        return { success: true, message };
        
    } catch (error: any) {
        const message = `❌ Terjadi kesalahan saat seeding: ${error.message}`;
        console.error(message);
        return { success: false, message };
    }
}