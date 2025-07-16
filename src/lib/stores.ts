import { writable } from 'svelte/store';
import type { User } from 'firebase/auth'; // <-- Impor tipe data User dari Firebase
import type { UserProfile } from '$lib/services/userService'; // Impor interface profil kita

/**
 * Mengontrol status terbuka atau tertutupnya sidebar.
 * true = terbuka, false = tertutup.
 */
export const isSidebarOpen = writable(true);

/**
 * Menyimpan data pengguna yang sedang login.
 * Isinya bisa objek User dari Firebase, atau null jika tidak ada yang login.
 */
export const user = writable<User | null>(null);

/**
 * Menyimpan data profil lengkap dari Firestore.
 */
export const userProfile = writable<UserProfile | null>(null);

/**
 * Mengontrol tipe hari saat ini untuk ditampilkan di Dashboard.
 * Bisa 'workout' atau 'rest'.
 */
export const currentDayType = writable<'workout' | 'rest'>('workout');

/**
 * Menyimpan status apakah quest harian sudah selesai atau belum.
 * Akan di-reset setiap hari (logika masa depan).
 */
export const dailyQuestCompleted = writable(false);

export const remainingEp = writable(100);