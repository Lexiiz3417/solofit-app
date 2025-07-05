<script lang="ts">
	// 1. Import semua yang kita butuhkan, perhatikan ada yang baru
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import { doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	// IMPORT BARU untuk "mencuri" gaya tombol
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	// Sisa dari script ini SAMA PERSIS seperti sebelumnya, tidak ada yang berubah
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
	let battleResult = ''; // 'win' or 'lose'
	async function handleAttack() {
		if (isBattleOver || !$userStore || !$profileStore) return;
		const playerDamage = Math.max(1, $profileStore.stats.strength * 2 - monster.defense);
		monster.hp = Math.max(0, monster.hp - playerDamage);
		battleLog = [...battleLog, `Anda menyerang ${monster.name} dan memberikan ${playerDamage} damage!`];
		if (monster.hp <= 0) {
			isBattleOver = true;
			battleResult = 'win';
			battleLog = [...battleLog, `${monster.name} telah dikalahkan! Anda menang!`];
			await grantRewards(monster.expReward);
			return;
		}
		const monsterDamage = Math.max(1, Math.floor(monster.attack - $profileStore.stats.stamina / 2));
		const userDocRef = doc(db, 'users', $userStore.uid);
		await updateDoc(userDocRef, { hp: increment(-monsterDamage) });
		battleLog = [...battleLog, `${monster.name} menyerang Anda dan memberikan ${monsterDamage} damage!`];
		setTimeout(() => {
			if ($profileStore && $profileStore.hp <= 0) {
				isBattleOver = true;
				battleResult = 'lose';
				battleLog = [...battleLog, `HP Anda habis! Anda telah dikalahkan!`];
			}
		}, 200);
	}
	async function grantRewards(expReward: number) {
		if (!$userStore) return;
		try {
			const userDocRef = doc(db, 'users', $userStore.uid);
			await updateDoc(userDocRef, { exp: increment(expReward) });
			toast.success(`Anda mendapatkan ${expReward} EXP!`);
		} catch (error) {
			console.error('Gagal memberi hadiah:', error);
		}
	}
	function startBattle() {
		if ($profileStore && $profileStore.hp <= 0) {
			toast.error('HP Anda habis! Silakan pulihkan HP terlebih dahulu.');
			return;
		}
		monster.hp = monster.maxHp;
		battleLog = [`Seekor ${monster.name} liar muncul di hadapan Anda!`];
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

<main class="p-4 md:p-8 max-w-4xl mx-auto">
	<h1 class="text-3xl font-bold mb-6 text-center">Dungeon: Hutan Goblin</h1>

	{#if !isBattleStarted}
		<div class="text-center mt-16">
			<button on:click={startBattle} class={cn(buttonVariants({ size: 'lg' }))}>Masuk Dungeon</button>
		</div>
	{:else if $profileStore}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="bg-white p-4 rounded-lg shadow order-2 md:order-1">
				<h2 class="text-xl font-bold mb-2">{$userStore?.email}</h2>
				<p class="text-lg font-semibold text-red-600">HP: {$profileStore.hp} / {$profileStore.maxHp}</p>
				<progress class="w-full" value={$profileStore.hp} max={$profileStore.maxHp}></progress>
				<div class="mt-4 space-y-1 text-sm">
					<p>Strength: {$profileStore.stats.strength}</p>
					<p>Agility: {$profileStore.stats.agility}</p>
					<p>Stamina: {$profileStore.stats.stamina}</p>
				</div>
			</div>

			<div class="bg-gray-800 text-white p-4 rounded-lg shadow order-1 md:order-2">
				<h2 class="text-xl font-bold mb-2 text-center">{monster.name}</h2>
				<p class="text-lg font-semibold text-green-400 text-center">
					HP: {monster.hp} / {monster.maxHp}
				</p>
				<progress class="w-full" value={monster.hp} max={monster.maxHp}></progress>

				{#if !isBattleOver}
					<div class="mt-4 text-center">
						<button
							on:click={handleAttack}
							class={cn(buttonVariants({ variant: 'destructive', size: 'lg' }))}>SERANG!</button
						>
					</div>
				{:else}
					<div
						class="mt-4 text-center p-4 rounded-lg
                        {battleResult === 'win' ? 'bg-green-500' : 'bg-red-500'}"
					>
						<h3 class="text-2xl font-bold">{battleResult === 'win' ? 'KEMENANGAN!' : 'KEKALAHAN!'}</h3>
						{#if battleResult === 'win'}
							<button on:click={startBattle} class={cn(buttonVariants({ class: 'mt-2' }))}
								>Lawan Lagi</button
							>
						{:else}
							<button on:click={fullyHeal} class={cn(buttonVariants({ class: 'mt-2' }))}
								>Pulihkan HP & Coba Lagi</button
							>
						{/if}
					</div>
				{/if}
			</div>

			<div class="bg-gray-100 p-4 rounded-lg shadow order-3 h-64 overflow-y-auto">
				<h3 class="text-lg font-semibold border-b pb-2 mb-2">Battle Log</h3>
				<div class="space-y-1 text-sm font-mono">
					{#each battleLog as log}
						<p>{log}</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</main>