// src/lib/game/progression.ts

import type { UserProfile } from '$lib/services/userService';

// --- Type Definitions ---

export interface WorkoutExercise {
    id: string;
    repsCompleted: number;
    epPerRep: number;
    masteryStat: 'STR' | 'END' | 'AGI';
    masteryExpPerUnit: number;
}

export interface WorkoutResult {
    // Data utama untuk disimpan
    expGained: number;
    goldGained: number;
    keysGained: number;
    unallocatedStatPointsGained: number;
    masteryExpGained: { [key: string]: number };

    // Info status untuk UI
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    
    // Info tambahan untuk UI
    totalEpUsed: number;
    questPointsGained: number; 
}

// --- Game Constants ---
const DAILY_EP_TARGET = 80;
const BASE_EXP_REWARD = 100;
const BASE_GOLD_REWARD = 50;
const KEY_REWARD = 1;
const STAT_POINT_PER_LEVEL = 1;

/**
 * Memproses workout, termasuk menghitung reward DAN kenaikan level.
 * @param currentUserProfile - Objek profil pengguna saat ini.
 * @param workoutData - Array latihan yang diselesaikan.
 * @returns Objek WorkoutResult yang sudah matang.
 */
export function processWorkoutResult(
    currentUserProfile: UserProfile,
    workoutData: WorkoutExercise[]
): WorkoutResult {

    let totalEpUsed = 0;
    const masteryExpUpdates: { [key: string]: number } = {};
    for (const exercise of workoutData) {
        totalEpUsed += exercise.repsCompleted * exercise.epPerRep;
        const masteryKey = `masteryExp_${exercise.masteryStat}`;
        masteryExpUpdates[masteryKey] = (masteryExpUpdates[masteryKey] || 0) + (exercise.repsCompleted * exercise.masteryExpPerUnit);
    }

    let expGained = 0;
    let goldGained = 0;
    let keysGained = 0;
    let questPointsGained = 0; 

    if (totalEpUsed >= DAILY_EP_TARGET) {
        expGained = BASE_EXP_REWARD;
        goldGained = BASE_GOLD_REWARD;
        keysGained = KEY_REWARD;
        questPointsGained = totalEpUsed - DAILY_EP_TARGET; 
    }

    let currentExp = currentUserProfile.exp + expGained;
    let currentLevel = currentUserProfile.level;
    let unallocatedStatPointsGained = 0;
    let leveledUp = false;

    let expToNextLevel = currentLevel * 100;
    while (currentExp >= expToNextLevel) {
        leveledUp = true;
        currentExp -= expToNextLevel;
        currentLevel += 1;
        unallocatedStatPointsGained += STAT_POINT_PER_LEVEL;
        expToNextLevel = currentLevel * 100;
    }

    const result: WorkoutResult = {
        expGained,
        goldGained,
        keysGained,
        unallocatedStatPointsGained,
        masteryExpGained: masteryExpUpdates,
        leveledUp,
        oldLevel: currentUserProfile.level,
        newLevel: currentLevel,
        totalEpUsed,
        questPointsGained, 
    };

    return result;
};