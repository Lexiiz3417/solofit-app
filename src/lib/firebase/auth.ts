// src/lib/firebase/auth.ts

import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from './client'; // db bisa di-import langsung di sini
import { readable } from 'svelte/store';
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore';

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
 * Isinya bisa berupa:
 * - `null`: Jika user logout atau data profil tidak ditemukan.
 * - `DocumentData`: Objek berisi data profil (level, exp, dll) jika user login dan datanya ada.
 */
export const profileStore = readable<DocumentData | null>(null, (set) => {
	const unsubscribe = userStore.subscribe((user) => {
		if (user) {
			// Jika user login, kita 'dengarkan' perubahan pada dokumen profilnya
			const userDocRef = doc(db, 'users', user.uid);
			const unsubDoc = onSnapshot(userDocRef, (doc) => {
				// Setiap kali data di firestore berubah, update store kita
				// Tanda '??' artinya: jika doc.data() hasilnya undefined, gunakan null.
				set(doc.data() ?? null); // <-- PERBAIKAN ADA DI SINI
			});
			return () => unsubDoc();
		} else {
			// Jika user logout, set profil menjadi null
			set(null);
		}
	});

	return () => unsubscribe();
});