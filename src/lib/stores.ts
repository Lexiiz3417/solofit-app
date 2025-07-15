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