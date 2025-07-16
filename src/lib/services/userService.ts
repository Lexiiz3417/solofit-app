// src/lib/services/userService.ts
import { db } from '$lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { WorkoutResult } from '$lib/game/progression';

export interface UserProfile {
	uid: string;
	email: string | null;
	nickname: string;
	title: string;
	level: number;
	exp: number;
	gold: number;
	streak: number;
	dungeonKeys: number;
	unallocatedStatPoints: number;
	debuffs: {
		fatigue: boolean;
	};
	lastPenaltyCheck: string;
	stats: {
		STR: number;
		masteryExp_STR: number;
		END: number;
		masteryExp_END: number;
		AGI: number;
		masteryExp_AGI: number;
		INT: number;
		masteryExp_INT: number;
		LUK: number;
		masteryExp_LUK: number;
	};
	createdAt: any;
}

export async function createUserProfile(userAuth: User): Promise<void> {
	const userRef = doc(db, 'users', userAuth.uid);
	const newUserProfile: UserProfile = {
		uid: userAuth.uid,
		email: userAuth.email,
		nickname: 'Hunter',
		title: '',
		level: 1,
		exp: 0,
		gold: 100,
		streak: 0,
		dungeonKeys: 0,
		unallocatedStatPoints: 0,
		debuffs: { fatigue: false },
		lastPenaltyCheck: new Date().toISOString().split('T')[0],
		stats: {
			STR: 5, masteryExp_STR: 0,
			END: 5, masteryExp_END: 0,
			AGI: 5, masteryExp_AGI: 0,
			INT: 5, masteryExp_INT: 0,
			LUK: 5, masteryExp_LUK: 0
		},
		createdAt: serverTimestamp()
	};
	await setDoc(userRef, newUserProfile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
	const userRef = doc(db, 'users', uid);
	const docSnap = await getDoc(userRef);
	return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, newData: { [key: string]: any }): Promise<boolean> {
	const userRef = doc(db, 'users', uid);
	try {
		await updateDoc(userRef, newData);
		return true;
	} catch (error) {
		console.error('Error updating user profile:', error);
		return false;
	}
}

export async function saveWorkoutResult(uid: string, result: WorkoutResult): Promise<boolean> {
	const userRef = doc(db, 'users', uid);
	const todayStr = new Date().toISOString().split('T')[0];
	const progressRef = doc(db, `daily_progress/${uid}/workouts/${todayStr}`);
	try {
		const updatePayload: { [key: string]: any } = {
			exp: increment(result.expGained),
			gold: increment(result.goldGained),
			dungeonKeys: increment(result.keysGained),
			streak: increment(1)
		};
		for (const key in result.masteryExpGained) {
			updatePayload[`stats.${key}`] = increment(result.masteryExpGained[key]);
		}
		if (result.leveledUp) {
			updatePayload.level = result.newLevel;
			updatePayload.unallocatedStatPoints = increment(result.unallocatedStatPointsGained);
		}
		await Promise.all([
			updateDoc(userRef, updatePayload),
			setDoc(progressRef, { questCompleted: true }, { merge: true })
		]);
		return true;
	} catch (error) {
		console.error('Error saving workout result:', error);
		return false;
	}
}