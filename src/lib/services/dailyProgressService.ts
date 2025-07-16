// src/lib/services/dailyProgressService.ts
import { db } from '$lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export type RestDayTask = 'stretching' | 'reading';

export interface DailyProgress {
	lastUpdated: any;
	questCompleted: boolean;
	progress: { [key: string]: number };
	tasksCompleted: { [key in RestDayTask]?: boolean };
}

function getTodayDateString(): string {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export async function getDailyProgress(uid: string): Promise<DailyProgress> {
	const todayStr = getTodayDateString();
	const progressRef = doc(db, `daily_progress/${uid}/workouts/${todayStr}`);
	const docSnap = await getDoc(progressRef);

	if (docSnap.exists()) {
		return docSnap.data() as DailyProgress;
	} else {
		return {
			lastUpdated: serverTimestamp(),
			questCompleted: false,
			progress: {},
			tasksCompleted: { stretching: false, reading: false }
		};
	}
}

export async function addWorkoutProgress(uid: string, exerciseId: string, additionalReps: number): Promise<boolean> {
	const todayStr = getTodayDateString();
	const progressRef = doc(db, `daily_progress/${uid}/workouts/${todayStr}`);
	try {
		const docSnap = await getDoc(progressRef);
		if (docSnap.exists()) {
			await updateDoc(progressRef, {
				[`progress.${exerciseId}`]: increment(additionalReps),
				lastUpdated: serverTimestamp()
			});
		} else {
			await setDoc(progressRef, {
				progress: { [exerciseId]: additionalReps },
				tasksCompleted: { stretching: false, reading: false },
				questCompleted: false,
				lastUpdated: serverTimestamp()
			});
		}
		return true;
	} catch (error) {
		console.error("Error adding workout progress:", error);
		return false;
	}
}

export async function updateDailyTaskStatus(uid: string, task: RestDayTask, isComplete: boolean): Promise<boolean> {
	const todayStr = getTodayDateString();
	const progressRef = doc(db, `daily_progress/${uid}/workouts/${todayStr}`);
	try {
		const docSnap = await getDoc(progressRef);
		const taskKey = `tasksCompleted.${task}`;
		if (docSnap.exists()) {
			await updateDoc(progressRef, { [taskKey]: isComplete, lastUpdated: serverTimestamp() });
		} else {
			await setDoc(progressRef, {
				tasksCompleted: { [task]: isComplete },
				lastUpdated: serverTimestamp(),
				questCompleted: false,
				progress: {}
			});
		}
		return true;
	} catch (error) {
		console.error('Error updating task status:', error);
		return false;
	}
}

export async function completeRestDayQuest(uid: string): Promise<boolean> {
	const todayStr = getTodayDateString();
	const progressRef = doc(db, `daily_progress/${uid}/workouts/${todayStr}`);
	const userRef = doc(db, 'users', uid);
	try {
		await updateDoc(progressRef, { questCompleted: true });
		await updateDoc(userRef, { streak: increment(1) });
		return true;
	} catch (error) {
		console.error('Error completing rest day quest:', error);
		return false;
	}
}