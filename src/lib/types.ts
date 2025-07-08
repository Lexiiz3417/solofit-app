// src/lib/types.ts
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
	target?: number; // Target dinamis setelah dihitung
}

// Tipe untuk data profil user dari Firestore
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
		intelligence: number; // <-- FIX: STAT INTELLIGENCE DITAMBAHKAN
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
	gold: number;
	dungeonKeys: number;
	dailyKeyAwardedOn?: Timestamp;
    
	// --- TAMBAHAN BARU YANG KETINGGALAN ---
    healthPotions: number; // Untuk sistem potion
    activeDungeonSession?: { // Untuk menyimpan progres dungeon
        monsterId: string;
        monsterName: string;
        monsterHp: number;
        maxHp: number;
        attack: number;
        defense: number;
        expReward: number;
        goldReward: number;
    };
}

// Tipe untuk data awal saat user baru dibuat
export interface InitialUserData {
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
        intelligence: number;
    };
    hp: number;
    maxHp: number;
    createdAt: any;
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
    gold: number;
    dungeonKeys: number;
    healthPotions: number;
}


// Tipe data untuk Monster (tidak berubah)
export interface Monster {
	id: string;
	name: string;
	maxHp: number;
	attack: number;
	defense: number;
	expReward: number;
	goldReward: number;
	imageUrl?: string;
	hp?: number;
}

// Tipe data untuk Artikel (tidak berubah)
export interface Article {
	id: string;
	slug: string;
	title: string;
	sourceName: string;
	sourceUrl: string;
	publishedDate: Timestamp;
	coverImage: string;
	summary: string;
	content: string;
	estimatedReadTime: number;
}