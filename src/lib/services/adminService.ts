// /src/lib/services/adminService.ts

import { db } from '$lib/firebase';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { exerciseData } from '$lib/data/exerciseData'; // Path import baru

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
        await Promise.all(
            exerciseData.map(async (exercise) => {
                const docRef = doc(db, 'exercises', exercise.id);
                await setDoc(docRef, exercise);
            })
        );
        const message = '✅ Seeding data latihan berhasil diselesaikan!';
        console.log(message);
        return { success: true, message };
    } catch (error: any) {
        const message = `❌ Terjadi kesalahan saat seeding: ${error.message}`;
        console.error(message);
        return { success: false, message };
    }
}