// src/lib/game/types.ts

/**
 * @fileoverview Berisi definisi tipe dan interface fundamental untuk mekanika game SoloFit.
 * File ini berfungsi sebagai "kontrak" data di seluruh aplikasi.
 */

/**
 * Mendefinisikan struktur data untuk semua jenis latihan di dalam game.
 * Ini adalah 'Source of Truth' untuk setiap exercise yang ada.
 */
export interface Exercise {
    /** ID unik untuk referensi internal, e.g., 'push_up_standard'. */
    id: string;

    /** Nama latihan yang akan ditampilkan ke pengguna, e.g., "Push-up". */
    name: string;

    /** Deskripsi singkat tentang cara melakukan latihan atau manfaatnya. */
    description: string;

    /** Tipe utama dari latihan untuk menentukan cara pelacakan progres. */
    type: 'REPS' | 'TIME' | 'DISTANCE';

    /** Satuan yang digunakan pengguna untuk menginput progres mereka. */
    unit: 'reps' | 'seconds' | 'meters';

    /**
     * Jumlah 'Energy Points' (EP) yang "dikonsumsi" per satuan unit.
     * Ini adalah "biaya" untuk melakukan latihan.
     */
    epCostPerUnit: number;

    /** Stat utama yang akan menerima Mastery Experience dari latihan ini. */
    masteryStat: 'STR' | 'END' | 'AGI';

    /** Jumlah Mastery EXP yang didapat per satuan unit. */
    masteryExpPerUnit: number;
}


// --- CONTOH DATA (MOCK DATA) ---
// Ini adalah contoh bagaimana kita akan mendefinisikan latihan di database Firestore kita nanti.

export const mockExercises: Exercise[] = [
    {
        id: 'push_up_standard',
        name: 'Push-up',
        description: 'Latihan klasik untuk membangun kekuatan tubuh bagian atas, terutama dada, bahu, dan trisep.',
        type: 'REPS',
        unit: 'reps',
        epCostPerUnit: 1, // Setiap 1 repetisi push-up memakan 1 EP
        masteryStat: 'STR',
        masteryExpPerUnit: 1.5 // Setiap 1 repetisi push-up memberikan 1.5 STR EXP
    },
    {
        id: 'plank_standard',
        name: 'Plank',
        description: 'Latihan isometrik untuk memperkuat otot inti (core), punggung, dan menstabilkan seluruh tubuh.',
        type: 'TIME',
        unit: 'seconds',
        epCostPerUnit: 0.5, // Setiap 1 detik plank memakan 0.5 EP
        masteryStat: 'END',
        masteryExpPerUnit: 0.8 // Setiap 1 detik plank memberikan 0.8 END EXP
    },
    {
        id: 'run_medium_distance',
        name: 'Lari (Jarak Menengah)',
        description: 'Aktivitas kardiovaskular untuk meningkatkan daya tahan jantung dan paru-paru, serta membakar kalori.',
        type: 'DISTANCE',
        unit: 'meters',
        epCostPerUnit: 0.05, // Setiap 1 meter lari memakan 0.05 EP
        masteryStat: 'END',
        masteryExpPerUnit: 0.02 // Setiap 1 meter lari memberikan 0.02 END EXP
    }
];