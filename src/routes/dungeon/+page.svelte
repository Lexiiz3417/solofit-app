<script lang="ts">
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import { doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Swords, User, Heart, Bot, ScrollText } from 'lucide-svelte';

	// --- FUNGSI WARNA HP ADAPTIF (SEKARANG MENGHASILKAN CLASS TAILWIND) ---
	function getHpColorClass(current: number, max: number): string {
		if (max === 0) return '[&>div]:bg-red-600'; // Mencegah pembagian dengan nol
		const percentage = (current / max) * 100;
		if (percentage > 70) return '[&>div]:bg-green-500'; // HP Penuh
		if (percentage > 40) return '[&>div]:bg-yellow-400'; // HP Setengah
		if (percentage > 15) return '[&>div]:bg-orange-500'; // HP Kritis
		return '[&>div]:bg-red-600'; // HP Sekarat
	}

	// Semua logika di bawah ini sama persis
	let monster = {
		name: 'Goblin',
		hp: 50,
		maxHp: 50,
		attack: 15,
		defense: 5,
		expReward: 25
	};
	let battleLog: string[] = [];
	let isBattleStarted = false;
	let isBattleOver = false;
	let battleResult = '';
	async function handleAttack() {
		if (isBattleOver || !$userStore || !$profileStore) return;
		const playerDamage = Math.max(1, $profileStore.stats.strength * 2 - monster.defense);
		monster.hp = Math.max(0, monster.hp - playerDamage);
		battleLog = [...battleLog, `Kamu menyerang ${monster.name} dan memberikan ${playerDamage} damage!`];
		if (monster.hp <= 0) {
			isBattleOver = true;
			battleResult = 'win';
			battleLog = [...battleLog, `${monster.name} telah dikalahkan! Kamu menang!`];
			await grantRewards(monster.expReward);
			return;
		}
		const monsterDamage = Math.max(1, Math.floor(monster.attack - $profileStore.stats.stamina / 2));
		const userDocRef = doc(db, 'users', $userStore.uid);
		await updateDoc(userDocRef, { hp: increment(-monsterDamage) });
		battleLog = [...battleLog, `${monster.name} menyerang kamu dan memberikan ${monsterDamage} damage!`];
		setTimeout(() => {
			if ($profileStore && $profileStore.hp <= 0) {
				isBattleOver = true;
				battleResult = 'lose';
				battleLog = [...battleLog, `HP kamu habis! Kamu telah dikalahkan!`];
			}
		}, 200);
	}
	async function grantRewards(expReward: number) {
		if (!$userStore) return;
		try {
			const userDocRef = doc(db, 'users', $userStore.uid);
			await updateDoc(userDocRef, { exp: increment(expReward) });
			toast.success(`Kamu mendapatkan ${expReward} EXP!`);
		} catch (error) {
			console.error('Gagal memberi hadiah:', error);
		}
	}
	function startBattle() {
		if ($profileStore && $profileStore.hp <= 0) {
			toast.error('HP kamu habis! Pulihkan dulu gih.');
			return;
		}
		monster.hp = monster.maxHp;
		battleLog = [`Seekor ${monster.name} liar muncul di hadapanmu!`];
		isBattleStarted = true;
		isBattleOver = false;
		battleResult = '';
	}
	async function fullyHeal() {
		if (!$userStore || !$profileStore) return;
		const userDocRef = doc(db, 'users', $userStore.uid);
		try {
			await updateDoc(userDocRef, { hp: $profileStore.maxHp });
			toast.success('HP telah pulih sepenuhnya!');
			startBattle();
		} catch (error) {
			console.error('Gagal memulihkan HP:', error);
			toast.error('Gagal memulihkan HP.');
		}
	}
</script>

<main class="p-4 md:p-8 max-w-5xl mx-auto">
	<div class="flex items-center gap-4 mb-8">
		<Swords class="size-9 text-destructive" />
		<div>
			<h1 class="text-3xl font-bold">Dungeon: Hutan Goblin</h1>
			<p class="text-gray-500">Buktikan kekuatanmu, Hunter!</p>
		</div>
	</div>

	{#if !isBattleStarted}
		<div class="text-center mt-16">
			<Button onclick={startBattle} size="lg">Masuk Dungeon</Button>
		</div>
	{:else if $profileStore}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
					<div class="text-sm space-y-1 text-gray-600 pt-2 border-t">
						<p>Strength: {$profileStore.stats.strength}</p>
						<p>Agility: {$profileStore.stats.agility}</p>
						<p>Stamina: {$profileStore.stats.stamina}</p>
					</div>
				</CardContent>
			</Card>

			<Card class="order-1 lg:order-2 bg-slate-900 text-white">
				<CardHeader class="flex flex-row items-center gap-4 space-y-0 pb-2">
					<Bot class="size-8 text-destructive" />
					<CardTitle>{monster.name}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-1">
						<div class="flex justify-between items-center">
							<div class="flex items-center gap-1.5 text-sm font-medium">
								<Heart class="size-4 text-green-400" />
								<span>HP</span>
							</div>
							<span class="text-sm font-mono text-green-400">{monster.hp} / {monster.maxHp}</span>
						</div>
						<Progress
							value={monster.hp}
							max={monster.maxHp}
							class={getHpColorClass(monster.hp, monster.maxHp)}
						/>
					</div>
					{#if !isBattleOver}
						<div class="pt-4 text-center">
							<Button onclick={handleAttack} variant="destructive" size="lg">SERANG!</Button>
						</div>
					{:else}
						<div class="mt-4 text-center p-4 rounded-lg {battleResult === 'win' ? 'bg-green-500' : 'bg-red-500'}">
							<h3 class="text-2xl font-bold">{battleResult === 'win' ? 'KEMENANGAN!' : 'KEKALAHAN!'}</h3>
							{#if battleResult === 'win'}
								<Button onclick={startBattle} class="mt-2">Lawan Lagi</Button>
							{:else}
								<Button onclick={fullyHeal} class="mt-2">Pulihkan HP & Coba Lagi</Button>
							{/if}
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card class="order-3 h-80 lg:h-auto">
				<CardHeader class="flex flex-row items-center gap-4 space-y-0 pb-2">
					<ScrollText class="size-8 text-gray-500" />
					<CardTitle>Battle Log</CardTitle>
				</CardHeader>
				<CardContent class="h-full overflow-y-auto text-sm font-mono space-y-2 pr-2">
					{#each battleLog as log}
						<p><span class="text-gray-500 mr-2">»</span>{log}</p>
					{/each}
				</CardContent>
			</Card>
		</div>
	{/if}
</main>