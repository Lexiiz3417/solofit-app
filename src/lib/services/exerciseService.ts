// src/lib/services/exerciseService.ts
import { db } from '$lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export type MasteryStat = 'STR' | 'END' | 'AGI';

// FIX: Sinkronkan interface dengan data seed exerciseData.ts
export interface Exercise {
	id: string;
	name: string;
	description: string;
	type: 'REPS' | 'TIME' | 'DISTANCE';
	unit: 'reps' | 'seconds' | 'meters';
	epCostPerUnit: number;
	masteryStat: MasteryStat;
	masteryExpPerUnit: number;
}

export async function getWorkoutPlan(): Promise<Exercise[]> {
	const exercisesCol = collection(db, 'exercises');
    const q = query(exercisesCol, where("id", "!=", "full_body_stretch"));
	const exerciseSnapshot = await getDocs(q);
	const exerciseList = exerciseSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Exercise));
	return exerciseList;
}