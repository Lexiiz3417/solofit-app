// src/lib/services/penaltyService.ts
import { db } from '$lib/firebase';
import { doc, getDoc, updateDoc, increment, type Timestamp } from 'firebase/firestore';
import type { UserProfile } from './userService';

function getDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function checkAndApplyDailyPenalty(
    userProfile: UserProfile
): Promise<{ message: string; expPenalty: number } | null> {
    const today = new Date();
    const todayStr = getDateString(today);

    if (userProfile.lastPenaltyCheck === todayStr) {
        return null;
    }

    const accountCreationDate = (userProfile.createdAt as Timestamp).toDate();
    const accountAgeInHours = (today.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60);
    if (accountAgeInHours < 24) {
        await updateDoc(doc(db, 'users', userProfile.uid), { lastPenaltyCheck: todayStr });
        return null;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getDateString(yesterday);

    const progressRef = doc(db, `daily_progress/${userProfile.uid}/workouts/${yesterdayStr}`);
    const progressDoc = await getDoc(progressRef);
    const userRef = doc(db, 'users', userProfile.uid);

    if (progressDoc.exists() && progressDoc.data().questCompleted === true) {
        await updateDoc(userRef, {
            lastPenaltyCheck: todayStr,
            'debuffs.fatigue': false
        });
        return null;
    }

    const goldPenalty = -50;
    const expPenalty = -Math.round(userProfile.exp * 0.1);

    await updateDoc(userRef, {
        streak: 0,
        gold: increment(goldPenalty),
        exp: increment(expPenalty),
        'debuffs.fatigue': true,
        lastPenaltyCheck: todayStr
    });

    return {
        message: `Kamu gagal menyelesaikan quest kemarin! Streak kembali ke 0 & kamu kehilangan ${-goldPenalty} Gold.`,
        expPenalty: expPenalty
    };
}