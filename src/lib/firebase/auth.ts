// src/lib/firebase/auth.ts

import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from './client';
import { readable } from 'svelte/store';
import { doc, onSnapshot } from 'firebase/firestore';
import type { UserProfile } from '$lib/types'; // <-- 1. TAMBAHKAN IMPORT INI

/**
 * Sebuah store yang secara reaktif menyediakan status otentikasi pengguna.
 * Isinya bisa berupa:
 * - `undefined`: Saat awal, status belum diketahui.
 * - `null`: Pengguna sudah dipastikan tidak login.
 * - `User object`: Pengguna sudah dipastikan login.
 */
export const userStore = readable<User | null | undefined>(undefined, (set) => {
	const unsubscribe = onAuthStateChanged(auth, (user) => {
		set(user);
	});

	return () => unsubscribe();
});

/**
 * Sebuah store yang menyediakan data profil pengguna dari Firestore secara real-time.
 * Isinya sekarang menggunakan tipe UserProfile yang spesifik.
 */
// 2. GANTI DocumentData MENJADI UserProfile
export const profileStore = readable<UserProfile | null>(null, (set) => {
	const unsubscribe = userStore.subscribe((user) => {
		if (user) {
			// Jika user login, kita 'dengarkan' perubahan pada dokumen profilnya
			const userDocRef = doc(db, 'users', user.uid);
			const unsubDoc = onSnapshot(userDocRef, (doc) => {
				// Kita beri tahu TypeScript bahwa data ini adalah UserProfile
				set((doc.data() as UserProfile) ?? null);
			});
			return () => unsubDoc();
		} else {
			// Jika user logout, set profil menjadi null
			set(null);
		}
	});

	return () => unsubscribe();
});