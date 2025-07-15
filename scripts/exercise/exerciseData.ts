// /src/lib/data/exerciseData.ts

import type { Exercise } from "../../src/lib/game/types";

/**
 * @fileoverview Berisi data master untuk semua latihan yang tersedia di SoloFit.
 * Data ini akan di-seed ke Firestore dan menjadi 'source of truth' untuk
 * menu latihan yang bisa dipilih oleh pengguna.
 */
export const exerciseData: Exercise[] = [
    // === Latihan Kekuatan (STR) ===
    {
        id: 'push_up_standard',
        name: 'Push-up',
        description: 'Latihan klasik untuk membangun kekuatan tubuh bagian atas, terutama dada, bahu, dan trisep.',
        type: 'REPS',
        unit: 'reps',
        epCostPerUnit: 1,
        masteryStat: 'STR',
        masteryExpPerUnit: 1
    },
    {
        id: 'pull_up_standard',
        name: 'Pull-up',
        description: 'Latihan tingkat lanjut untuk kekuatan punggung dan bisep, salah satu tolok ukur kekuatan tubuh bagian atas.',
        type: 'REPS',
        unit: 'reps',
        epCostPerUnit: 2,
        masteryStat: 'STR',
        masteryExpPerUnit: 2.5
    },

    // === Latihan Daya Tahan (END) ===
    {
        id: 'bodyweight_squat',
        name: 'Bodyweight Squat',
        description: 'Latihan fundamental untuk kekuatan kaki dan otot inti, meningkatkan mobilitas dan keseimbangan.',
        type: 'REPS',
        unit: 'reps',
        epCostPerUnit: 0.8,
        masteryStat: 'END',
        masteryExpPerUnit: 1
    },
    {
        id: 'plank_standard',
        name: 'Plank',
        description: 'Latihan isometrik untuk memperkuat otot inti (core), punggung, dan menstabilkan seluruh tubuh.',
        type: 'TIME',
        unit: 'seconds',
        epCostPerUnit: 0.5,
        masteryStat: 'END',
        masteryExpPerUnit: 0.8
    },
    {
        id: 'lunges',
        name: 'Lunges',
        description: 'Latihan unilateral yang efektif untuk menargetkan paha depan, paha belakang, dan bokong secara seimbang.',
        type: 'REPS',
        unit: 'reps',
        epCostPerUnit: 0.7,
        masteryStat: 'END',
        masteryExpPerUnit: 0.9
    },
    {
        id: 'wall_sit',
        name: 'Wall Sit',
        description: 'Latihan ketahanan isometrik yang membakar otot paha depan dan melatih daya tahan otot.',
        type: 'TIME',
        unit: 'seconds',
        epCostPerUnit: 0.6,
        masteryStat: 'END',
        masteryExpPerUnit: 1
    },

    // === Latihan Kelincahan (AGI) ===
    {
        id: 'jumping_jacks',
        name: 'Jumping Jacks',
        description: 'Latihan kardio seluruh tubuh yang bagus untuk pemanasan dan meningkatkan detak jantung.',
        type: 'REPS',
        unit: 'reps',
        epCostPerUnit: 0.4,
        masteryStat: 'AGI',
        masteryExpPerUnit: 0.5
    },
    {
        id: 'burpees',
        name: 'Burpees',
        description: 'Latihan intensitas tinggi yang menggabungkan squat, push-up, dan lompatan dalam satu gerakan.',
        type: 'REPS',
        unit: 'reps',
        epCostPerUnit: 2.5,
        masteryStat: 'AGI',
        masteryExpPerUnit: 2
    },

    // === Latihan untuk Active Rest Day ===
    {
        id: 'full_body_stretch',
        name: 'Peregangan Seluruh Tubuh',
        description: 'Sesi peregangan dinamis dan statis untuk meningkatkan fleksibilitas, mengurangi nyeri otot, dan mempersiapkan tubuh untuk pemulihan.',
        type: 'TIME',
        unit: 'seconds',
        epCostPerUnit: 0.2, // Biaya EP sangat rendah
        masteryStat: 'AGI',
        masteryExpPerUnit: 0.1 // Reward Mastery sangat rendah
    }
];