import { writable } from 'svelte/store';
import type { ComponentType } from 'svelte';

// 1. Definisikan "KTP" atau bentuk data notifikasi kita
export interface NotificationPayload {
	title: string;
	description: string;
	icon?: ComponentType;
	iconColorClass?: string; // <-- TAMBAHAN BARU
	rewards?: string[];
}

interface NotificationState extends NotificationPayload {
	isOpen: boolean;
}

// 2. Buat store-nya menggunakan pola "Custom Store"
function createNotificationStore() {
	// 'writable' adalah store internal yang bisa kita ubah
	const { subscribe, set } = writable<NotificationState>({
		isOpen: false,
		title: '',
		description: ''
	});

	// Ini adalah fungsi-fungsi yang boleh diakses dari luar
	return {
		subscribe, // Wajib ada agar bisa di-subscribe (pakai '$')

		// Fungsi untuk menampilkan notifikasi dengan data baru
		show: (data: NotificationPayload) => {
			set({
				isOpen: true,
				title: data.title,
				description: data.description,
				icon: data.icon,
				iconColorClass: data.iconColorClass, // <-- TAMBAHAN BARU
				rewards: data.rewards
			});
		},

		// Fungsi untuk menutup notifikasi
		hide: () => {
			set({
				isOpen: false,
				title: '',
				description: ''
			});
		}
	};
}

// 3. Export store-nya untuk dipakai di seluruh aplikasi
export const notificationStore = createNotificationStore();
