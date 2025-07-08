// src/lib/services/rewardService.ts
import { db } from '$lib/firebase/client';
import type { UserProfile } from '$lib/types';
import { doc, runTransaction, increment } from 'firebase/firestore';

// Definisikan tipe untuk reward biar jelas
interface RewardPayload {
	exp?: number;
	gold?: number;
	masteryType?: 'strength' | 'stamina' | 'agility' | 'intelligence';
	masteryExp?: number;
}

/**
 * Fungsi utama untuk memproses semua jenis reward dan menangani level up.
 * @param userId ID user yang menerima reward.
 * @param payload Objek yang berisi jumlah reward.
 * @returns Pesan notifikasi hasil dari proses reward.
 */
export async function processRewards(userId: string, payload: RewardPayload): Promise<string[]> {
	const userDocRef = doc(db, 'users', userId);
	const notifications: string[] = [];

	await runTransaction(db, async (transaction) => {
		const userSnap = await transaction.get(userDocRef);
		if (!userSnap.exists()) {
			throw 'Dokumen user tidak ditemukan!';
		}

		const profile = userSnap.data() as UserProfile;
		const updates: { [key: string]: any } = {};

		// --- 1. Proses Level Up Utama ---
		if (payload.exp && payload.exp > 0) {
			updates.exp = increment(payload.exp);
			let newExp = profile.exp + payload.exp;

			if (newExp >= profile.requiredExp) {
				updates.level = increment(1);
				updates.exp = newExp - profile.requiredExp; // Reset dengan sisa EXP
				updates.requiredExp = Math.floor(profile.requiredExp * 1.5);
				updates.statPoints = increment(1); // Aturan baru: +1 stat point
				notifications.push(`✨ DING! Kamu mencapai Level ${profile.level + 1}!`);
			}
		}

		// --- 2. Proses Level Up Mastery (jika ada) ---
		if (payload.masteryType && payload.masteryExp && payload.masteryExp > 0) {
			const mastery = profile.mastery[payload.masteryType];
			updates[`mastery.${payload.masteryType}.exp`] = increment(payload.masteryExp);

			if (mastery && mastery.exp + payload.masteryExp >= mastery.requiredExp) {
				updates[`mastery.${payload.masteryType}.level`] = increment(1);
				updates[`mastery.${payload.masteryType}.exp`] = mastery.exp + payload.masteryExp - mastery.requiredExp;
				updates[`mastery.${payload.masteryType}.requiredExp`] = Math.floor(mastery.requiredExp * 1.5);
				// Beri bonus pasif permanen
				if (payload.masteryType === 'strength') updates['stats.strength'] = increment(1);

				notifications.push(`🔥 Mastery ${payload.masteryType} meningkat!`);
			}
		}

        // --- 3. Proses Gold ---
        if (payload.gold && payload.gold > 0) {
            updates.gold = increment(payload.gold);
        }

		// Terapkan semua pembaruan ke database
		transaction.update(userDocRef, updates);
	});

	return notifications;
}