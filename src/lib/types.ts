import type { Timestamp } from 'firebase/firestore';
import type { ComponentType } from 'svelte';

// Tipe untuk data Quest dari Firestore
export interface Quest {
	id: string;
	name: string;
	masteryType: 'strength' | 'stamina' | 'agility' | 'intelligence';
	baseExp: number;
	baseMasteryExp: number;
	baseTarget: number;
	unit: string;
	categories: string[];
	iconName: string;
	icon?: ComponentType;
	finalTarget?: number;
}

export interface UserProfile {
	email: string;
	username: string;
	isSetupComplete: boolean;
	level: number;
	exp: number;
	requiredExp: number;
	statPoints: number;
	stats: {
		strength: number;
		agility: number;
		stamina: number;
	};
	hp: number;
	maxHp: number;
	createdAt: Timestamp;
	mastery: {
		[key: string]: {
			level: number;
			exp: number;
			requiredExp: number;
		};
	};
	goal: 'build_muscle' | 'endurance' | 'agility';
	fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
	commitmentDays: number;
	
	// --- TAMBAHAN BARU ---
	gold: number;
	dungeonKeys: number;
	dailyKeyAwardedOn?: Timestamp; 
}

// Tipe untuk hasil transaksi
export interface TransactionResult {
	mainLeveledUp: boolean;
	newMainLevel: number;
	masteryLeveledUp: boolean;
	newMasteryLevel: number;
	statGained: string | null;
	statPointsGained: number;
}

// --- TIPE DATA BARU UNTUK MONSTER ---
export interface Monster {
	id: string;
	name: string;
	maxHp: number;
	attack: number;
	defense: number;
	expReward: number;
	imageUrl?: string;
	hp?: number; // HP saat ini, ditambahkan saat pertarungan
}
