import { writable } from 'svelte/store';

/**
 * Mengontrol status terbuka atau tertutupnya sidebar.
 * true = terbuka, false = tertutup.
 */
export const isSidebarOpen = writable(true);