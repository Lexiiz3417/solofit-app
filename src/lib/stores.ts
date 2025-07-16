// src/lib/stores.ts
import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import type { UserProfile } from '$lib/services/userService';
import type { DailyProgress } from '$lib/services/dailyProgressService';

export const isSidebarOpen = writable(true);
export const user = writable<User | null>(null);
export const userProfile = writable<UserProfile | null>(null);
export const currentDayType = writable<'workout' | 'rest'>('workout');
export const dailyQuestCompleted = writable(false);
export const dailyProgress = writable<DailyProgress | null>(null);