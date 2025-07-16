// src/lib/services/stretchingService.ts
import { db } from '$lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

// Definisikan 'kontrak data' untuk satu gerakan peregangan
export interface StretchingMove {
    id: string;
    name: string;
    description: string;
    durationInSeconds: number;
}

/**
 * Mengambil semua data gerakan peregangan dari koleksi 'stretches'.
 * @returns Array berisi data peregangan.
 */
export async function getStretchingRoutine(): Promise<StretchingMove[]> {
    const stretchesCol = collection(db, 'stretches');
    const stretchSnapshot = await getDocs(query(stretchesCol));

    // Ubah data dari Firestore menjadi array yang kita inginkan
    const stretchList = stretchSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }) as StretchingMove);

    return stretchList;
}