<script lang="ts">
	// Import-import lengkap kita
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import { doc, updateDoc, increment, collection, getDocs, runTransaction } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Swords, User, Heart, Bot, ScrollText, ShieldAlert, PartyPopper,KeyRound, Zap } from 'lucide-svelte';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog/index.js';
	import type { Monster, UserProfile, TransactionResult } from '$lib/types';
	import { get } from 'svelte/store';

	// Fungsi untuk warna HP adaptif
	function getHpColorClass(current: number, max: number): string {
		if (max === 0) return '[&>div]:bg-red-600';
		const percentage = (current / max) * 100;
		if (percentage > 70) return '[&>div]:bg-green-500';
		if (percentage > 40) return '[&>div]:bg-yellow-400';
		if (percentage > 15) return '[&>div]:bg-orange-500';
		return '[&>div]:bg-red-600';
	}

	// State pertarungan
	let monster = $state<Monster | null>(null);
	let battleLog = $state<string[]>([]);
	let isBattleOver = $state(false);
	let battleResult = $state('');
	let isConfirmationDialogOpen = $state(false);
	let hasAttackedOnce = $state(false);
	// State untuk dialog notifikasi berantai
	let isLevelUpDialogOpen = $state(false);
	let levelUpInfo = $state({ newLevel: 0, pointsGained: 0 });
	let lastBattleResult = $state<TransactionResult | null>(null);

	// Fungsi untuk memulai pertarungan
	async function startBattle() {
		const profile = get(profileStore);
		const currentUser = get(userStore);

		if (!profile || !currentUser) return;

		// 1. Cek HP dulu
		if (profile.hp <= 0) {
			toast.error('HP kamu habis! Pulihkan dulu gih.');
			return;
		}

		// 2. Cek Kunci Dungeon
		if (profile.dungeonKeys <= 0) {
			toast.error('Kunci Dungeon tidak cukup!');
			return;
		}

		try {
			// 3. Kurangi Kunci (Sistem "Bayar")
			const userDocRef = doc(db, 'users', currentUser.uid);
			await updateDoc(userDocRef, {
				dungeonKeys: increment(-1)
			});
			toast.info('1 Kunci Dungeon telah digunakan.');

			// Ambil monster acak (logika ini tetap sama)
			const monstersSnapshot = await getDocs(collection(db, 'monsters'));
			const monsterPool = monstersSnapshot.docs.map((d) => ({
				...(d.data() as Omit<Monster, 'id'>),
				id: d.id
			}));
			if (monsterPool.length === 0) {
				toast.error('Tidak ada monster di dalam dungeon saat ini.');
				return;
			}
			const randomIndex = Math.floor(Math.random() * monsterPool.length);
			const randomMonster = monsterPool[randomIndex];
			
			monster = { ...randomMonster, hp: randomMonster.maxHp };
			battleLog = [`Seekor ${monster.name} liar muncul di hadapanmu!`];
			isBattleOver = false;
			battleResult = '';
			hasAttackedOnce = false;
		} catch (error) {
			console.error('Gagal memulai pertarungan:', error);
			toast.error('Gagal memasuki dungeon.');
		}
	}

	// Fungsi yang menjalankan logika serangan
	async function executeAttack() {
		isConfirmationDialogOpen = false;
		if (isBattleOver || !$userStore || !$profileStore) return;
		
		// PERBAIKAN 1: Buat variabel lokal untuk monster biar TypeScript gak bingung
		const currentMonster = monster;
		if (!currentMonster) return;

		hasAttackedOnce = true;

		// Giliran Pemain
		const playerDamage = Math.max(1, $profileStore.stats.strength * 2 - currentMonster.defense);
		const newMonsterHp = Math.max(0, (currentMonster.hp ?? 0) - playerDamage);
		monster = { ...currentMonster, hp: newMonsterHp }; // Re-assignment untuk reaktivitas
		battleLog = [...battleLog, `Kamu menyerang ${currentMonster.name} dan memberikan ${playerDamage} damage!`];

		if (newMonsterHp <= 0) {
			isBattleOver = true;
			battleResult = 'win';
			battleLog = [...battleLog, `${currentMonster.name} telah dikalahkan! Kamu menang!`];
			await grantRewards(currentMonster.expReward);
			return;
		}

		// Giliran Monster
		const monsterDamage = Math.max(1, Math.floor(currentMonster.attack - $profileStore.stats.stamina / 2));
		const userDocRef = doc(db, 'users', $userStore.uid);
		await updateDoc(userDocRef, { hp: increment(-monsterDamage) });
		battleLog = [...battleLog, `${currentMonster.name} menyerang kamu dan memberikan ${monsterDamage} damage!`];

		setTimeout(() => {
			if ($profileStore && $profileStore.hp <= 0) {
				isBattleOver = true;
				battleResult = 'lose';
				battleLog = [...battleLog, `HP kamu habis! Kamu telah dikalahkan!`];
			}
		}, 200);
	}

	// Fungsi yang dipanggil oleh tombol Serang
	function handleAttackClick() {
		if (hasAttackedOnce) {
			executeAttack();
		} else {
			isConfirmationDialogOpen = true;
		}
	}

	// Fungsi untuk memberi hadiah EXP setelah menang
	async function grantRewards(expReward: number) {
		const currentUser = get(userStore);
		if (!currentUser) return;
		try {
			const result = await runTransaction<TransactionResult>(db, async (transaction) => {
				const userDocRef = doc(db, 'users', currentUser.uid);
				const userDoc = await transaction.get(userDocRef);
				if (!userDoc.exists()) throw new Error('Profil user tidak ditemukan.');
				const userData = userDoc.data() as UserProfile;
				let updates: { [key: string]: any } = {};
				const transactionResult: TransactionResult = { mainLeveledUp: false, newMainLevel: 0, masteryLeveledUp: false, newMasteryLevel: 0, statGained: null, statPointsGained: 0 };
				updates['exp'] = increment(expReward);
				const newMainExp = userData.exp + expReward;
				if (newMainExp >= userData.requiredExp) {
					transactionResult.mainLeveledUp = true;
					transactionResult.newMainLevel = userData.level + 1;
					transactionResult.statPointsGained = 5;
					updates['level'] = increment(1);
					updates['exp'] = newMainExp - userData.requiredExp;
					updates['requiredExp'] = Math.floor(userData.requiredExp * 1.5);
					updates['statPoints'] = increment(5);
				}
				transaction.update(userDocRef, updates);
				return transactionResult;
			});

			lastBattleResult = result; // Simpan hasil untuk notifikasi berantai

			if (result.mainLeveledUp) {
				levelUpInfo = { newLevel: result.newMainLevel, pointsGained: result.statPointsGained };
				isLevelUpDialogOpen = true;
			} else {
				toast.success(`Kamu mendapatkan ${expReward} EXP!`);
			}
		} catch (error) {
			console.error('Gagal memberi hadiah:', error);
		}
	}

	// Fungsi untuk memulihkan HP
	async function fullyHeal() {
		const currentUser = get(userStore);
		const profile = get(profileStore);
		if (!currentUser || !profile) return;
		const userDocRef = doc(db, 'users', currentUser.uid);
		try {
			await updateDoc(userDocRef, { hp: profile.maxHp });
			toast.success('HP kamu pulih sepenuhnya! Siap tempur lagi!');
			monster = null;
		} catch (error) {
			console.error('Gagal memulihkan HP:', error);
			toast.error('Gagal memulihkan HP.');
		}
	}

	// PERBAIKAN 2: Fungsi baru untuk menangani notifikasi berantai
	function handleLevelUpDialogClose() {
		isLevelUpDialogOpen = false;
		// Di sini kita bisa tambahkan logika untuk notifikasi lain jika perlu
	}
</script>

<main class="p-4 md:p-8 max-w-5xl mx-auto">
	<div class="flex items-center gap-4 mb-8">
		<Swords class="size-9 text-destructive" />
		<div>
			<h1 class="text-3xl font-bold">Dungeon Entrance</h1>
			<p class="text-gray-500 dark:text-gray-400">Tantangan baru menanti, Hunter!</p>
		</div>
	</div>

	{#if !monster}
		<div class="text-center mt-16 space-y-4">
			<!-- TAMPILAN BARU: Tampilkan jumlah kunci -->
			{#if $profileStore}
				<div class="flex items-center justify-center gap-2 text-lg">
					<KeyRound class="size-5 text-yellow-500" />
					<span class="font-semibold">Kunci Dungeon:</span>
					<span class="font-bold text-xl">{$profileStore.dungeonKeys}</span>
				</div>
			{/if}
			<!-- Tombol sekarang punya kondisi disabled -->
			<Button onclick={startBattle} size="lg" disabled={!$profileStore || $profileStore.dungeonKeys <= 0}>
				Cari Pertarungan
			</Button>
		</div>
	{:else if $profileStore}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Panel Player -->
			<Card class="order-2 lg:order-1">
				<CardHeader class="flex flex-row items-center gap-4 space-y-0 pb-2">
					<User class="size-8 text-blue-600" />
					<CardTitle>{$profileStore.username}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-1">
						<div class="flex justify-between items-center">
							<div class="flex items-center gap-1.5 text-sm font-medium">
								<Heart class="size-4 text-red-500" />
								<span>HP</span>
							</div>
							<span class="text-sm font-mono text-red-500">{$profileStore.hp} / {$profileStore.maxHp}</span>
						</div>
						<Progress
							value={$profileStore.hp}
							max={$profileStore.maxHp}
							class={getHpColorClass($profileStore.hp, $profileStore.maxHp)}
						/>
					</div>
					<div class="text-sm space-y-1 text-gray-600 dark:text-gray-300 pt-2 border-t dark:border-slate-700">
						<p>Strength: {$profileStore.stats.strength}</p>
						<p>Agility: {$profileStore.stats.agility}</p>
						<p>Stamina: {$profileStore.stats.stamina}</p>
					</div>
				</CardContent>
			</Card>

			<!-- Panel Aksi & Monster -->
			<Card class="order-1 lg:order-2 bg-slate-900 text-white">
				<CardHeader class="flex flex-row items-center gap-4 space-y-0 pb-2">
					<Bot class="size-8 text-destructive" />
					<CardTitle>{monster.name}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="text-xs flex justify-around border-b border-slate-700 pb-2">
						<p>Attack: {monster.attack}</p>
						<p>Defense: {monster.defense}</p>
					</div>
					<div class="space-y-1">
						<div class="flex justify-between items-center">
							<div class="flex items-center gap-1.5 text-sm font-medium">
								<Heart class="size-4 text-green-400" />
								<span>HP</span>
							</div>
							<span class="text-sm font-mono text-green-400">{monster.hp ?? 0} / {monster.maxHp}</span>
						</div>
						<Progress
							value={monster.hp ?? 0}
							max={monster.maxHp}
							class={getHpColorClass(monster.hp ?? 0, monster.maxHp)}
						/>
					</div>
					{#if !isBattleOver}
						<div class="pt-4 text-center">
							<Button onclick={handleAttackClick} variant="destructive" size="lg">SERANG!</Button>
						</div>
					{:else}
						<div class="mt-4 text-center p-4 rounded-lg {battleResult === 'win' ? 'bg-green-500' : 'bg-red-500'}">
							<h3 class="text-2xl font-bold">{battleResult === 'win' ? 'KEMENANGAN!' : 'KEKALAHAN!'}</h3>
							{#if battleResult === 'win'}
								<Button onclick={startBattle} class="mt-2">Cari Lawan Baru</Button>
							{:else}
								<Button onclick={fullyHeal} class="mt-2">Pulihkan HP & Coba Lagi</Button>
							{/if}
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Battle Log -->
			<Card class="order-3 h-96 flex flex-col">
				<CardHeader class="flex flex-row items-center gap-4 space-y-0 pb-2">
					<ScrollText class="size-8 text-gray-500" />
					<CardTitle>Battle Log</CardTitle>
				</CardHeader>
				<!-- PERUBAHAN DI SINI: Membuat kontennya bisa di-scroll -->
				<CardContent class="flex-1 overflow-y-auto text-sm font-mono space-y-2 pr-2">
					{#each battleLog as log}
						<p><span class="text-gray-500 mr-2">»</span>{log}</p>
					{/each}
				</CardContent>
			</Card>
		</div>
	{/if}

	<!-- Dialog Konfirmasi Serangan -->
	<Dialog bind:open={isConfirmationDialogOpen}>
		<DialogContent class="dark:bg-slate-950 dark:border-blue-500/50 shadow-lg dark:shadow-blue-500/20">
			<DialogHeader>
				<DialogTitle class="flex items-center justify-center gap-2">
					<ShieldAlert class="size-5 text-yellow-500" />
					<span>[ PERINGATAN SISTEM ]</span>
				</DialogTitle>
				<!-- PERBAIKAN 3: Tambah class text-center -->
				<DialogDescription class="pt-4 text-md text-center text-slate-600 dark:text-slate-300">
					Sekali pertarungan dimulai, tidak ada jalan untuk lari. Kamu harus bertarung sampai salah
					satu pihak tumbang.
					<p class="font-bold mt-4">Lanjutkan pertarungan?</p>
				</DialogDescription>
			</DialogHeader>
			<DialogFooter class="gap-2 sm:justify-end">
				<Button onclick={() => (isConfirmationDialogOpen = false)} variant="secondary">Mundur</Button>
				<Button onclick={executeAttack}>Lanjutkan Pertarungan</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>

	<!-- Dialog Level Up -->
	<Dialog bind:open={isLevelUpDialogOpen}>
		<DialogContent class="dark:bg-slate-950 dark:border-blue-500/50 shadow-lg dark:shadow-blue-500/20">
			<DialogHeader class="text-center">
				<DialogTitle class="flex items-center justify-center gap-2 text-2xl">
					<PartyPopper class="size-6 text-yellow-500" />
					<span>[ LEVEL UP ]</span>
				</DialogTitle>
				<!-- PERBAIKAN 3: Tambah class text-center -->
				<DialogDescription class="text-md !mt-4 text-center dark:text-slate-300">
					Kerja kerasmu terbayar, Hunter! Kamu telah mencapai:
					<p class="text-4xl font-bold text-blue-600 my-4">LEVEL {levelUpInfo.newLevel}</p>
					Kamu mendapatkan hadiah:
					<p class="font-semibold text-lg text-slate-800 dark:text-slate-100 mt-2">{levelUpInfo.pointsGained} Stat Points</p>
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button onclick={handleLevelUpDialogClose} class="w-full">Lanjutkan!</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</main>
