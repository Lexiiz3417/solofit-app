<script lang="ts">
    // Import-import kita
    import { processRewards } from '$lib/services/rewardService';
    import { userStore, profileStore } from '$lib/firebase/auth';
    import { db } from '$lib/firebase/client';
    import { doc, updateDoc, increment, collection, getDocs, runTransaction, writeBatch } from 'firebase/firestore';
    import { toast } from 'svelte-sonner';
    import Button from '$lib/components/ui/button/button.svelte';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Progress } from '$lib/components/ui/progress';
    import { Swords, User, Heart, Bot, ScrollText, ShieldAlert, KeyRound, FlaskConical } from 'lucide-svelte';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import type { Monster, UserProfile } from '$lib/types';
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';

    // State pertarungan
    let monster = $state<UserProfile['activeDungeonSession'] | null>(null);
    let battleLog = $state<string[]>([]);
    let isBattleOver = $state(false);
    let battleResult = $state('');
    let isConfirmationDialogOpen = $state(false);

    // Cek sesi dungeon yang ada saat komponen pertama kali dimuat
    onMount(() => {
        const session = get(profileStore)?.activeDungeonSession;
        if (session) {
            monster = session;
            battleLog = [`Kamu melanjutkan pertarungan melawan ${session.monsterName}!`];
        }
    });

    // Fungsi startBattle yang baru
    async function startBattle() {
        const profile = get(profileStore);
        const currentUser = get(userStore);
        if (!profile || !currentUser) return;
        if (profile.hp <= 0) {
            toast.error('HP kamu habis! Pulihkan dulu.');
            return;
        }
        if (profile.dungeonKeys <= 0) {
            toast.error('Kunci Dungeon tidak cukup!');
            return;
        }

        try {
            const monstersSnapshot = await getDocs(collection(db, 'monsters'));
            const monsterPool = monstersSnapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as (Monster & { id: string })[];
            const randomMonster = monsterPool[Math.floor(Math.random() * monsterPool.length)];

            const sessionData = {
                monsterId: randomMonster.id,
                monsterName: randomMonster.name,
                monsterHp: randomMonster.maxHp,
                maxHp: randomMonster.maxHp,
                attack: randomMonster.attack,
                defense: randomMonster.defense,
                expReward: randomMonster.expReward,
                goldReward: randomMonster.goldReward
            };

            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                dungeonKeys: increment(-1),
                activeDungeonSession: sessionData
            });

            monster = sessionData;
            battleLog = [`Seekor ${monster.monsterName} liar muncul di hadapanmu!`];
            isBattleOver = false;
            battleResult = '';
            toast.info('1 Kunci Dungeon telah digunakan.');
        } catch (error) {
            console.error('Gagal memulai pertarungan:', error);
            toast.error('Gagal memasuki dungeon.');
        }
    }

    // Fungsi executeAttack yang baru
    async function executeAttack() {
        const currentUser = get(userStore);
        const profile = get(profileStore);
        if (isBattleOver || !currentUser || !profile || !monster) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        const playerDamage = Math.max(1, profile.stats.strength * 2 - monster.defense);
        const newMonsterHp = Math.max(0, monster.monsterHp - playerDamage);

        const batch = writeBatch(db);
        batch.update(userDocRef, { 'activeDungeonSession.monsterHp': newMonsterHp });
        battleLog = [...battleLog, `Kamu menyerang ${monster.monsterName} dan memberikan ${playerDamage} damage!`];

        if (newMonsterHp <= 0) {
            isBattleOver = true;
            battleResult = 'win';
            await grantRewards(monster);
        } else {
            const monsterDamage = Math.max(1, Math.floor(monster.attack - profile.stats.stamina / 2));
            batch.update(userDocRef, { hp: increment(-monsterDamage) });
            battleLog = [...battleLog, `${monster.monsterName} menyerang kamu dan memberikan ${monsterDamage} damage!`];

            if (profile.hp - monsterDamage <= 0) {
                isBattleOver = true;
                battleResult = 'lose';
                battleLog = [...battleLog, `HP kamu habis! Kamu telah dikalahkan!`];
                // Hapus sesi dungeon saat kalah
                batch.update(userDocRef, { activeDungeonSession: null });
            }
        }
        await batch.commit();
    }

    // Fungsi grantRewards yang baru
    async function grantRewards(killedMonster: NonNullable<UserProfile['activeDungeonSession']>) {
        const currentUser = get(userStore);
        if (!currentUser) return;
        try {
            const rewardPayload = {
                exp: killedMonster.expReward,
                gold: killedMonster.goldReward,
                masteryType: 'strength' as const,
                masteryExp: 10
            };
            const notifications = await processRewards(currentUser.uid, rewardPayload);

            // Hapus sesi dungeon setelah menang
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { activeDungeonSession: null });

            battleLog = [
                ...battleLog,
                `${killedMonster.monsterName} telah dikalahkan! Kamu menang!`,
                `🏆 Kamu mendapatkan ${rewardPayload.exp} EXP dan ${rewardPayload.gold} Gold!`,
                ...notifications
            ];
        } catch (error) {
            console.error('Gagal memberi hadiah:', error);
        }
    }

    // --- SISTEM POTION BARU ---
    async function usePotion() {
        const currentUser = get(userStore);
        const profile = get(profileStore);
        if (!currentUser || !profile || profile.healthPotions <= 0) {
            toast.error("Kamu tidak punya Health Potion!");
            return;
        }

        const healAmount = Math.floor(profile.maxHp * 0.5); // Potion memulihkan 50% Max HP
        const newHp = Math.min(profile.maxHp, profile.hp + healAmount);

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                healthPotions: increment(-1),
                hp: newHp
            });
            toast.success(`Kamu memulihkan ${healAmount} HP!`);
            battleLog = [...battleLog, `Kamu menggunakan Potion dan memulihkan ${healAmount} HP.`];
        } catch (error) {
            toast.error("Gagal menggunakan potion.");
        }
    }

    // Fungsi untuk kembali ke entrance setelah pertarungan selesai
    function exitDungeon() {
        monster = null;
        isBattleOver = false;
    }
</script>

{#if !isBattleOver}
    <div class="pt-4 text-center flex gap-2 justify-center">
        <Button onclick={usePotion} variant="secondary" disabled={!$profileStore || $profileStore.healthPotions <= 0}>
            <FlaskConical class="size-4 mr-2"/> Gunakan Potion ({$profileStore?.healthPotions ?? 0})
        </Button>
        <Button onclick={executeAttack} variant="destructive" size="lg">SERANG!</Button>
    </div>
{:else}
    <div class="mt-4 text-center p-4 rounded-lg {battleResult === 'win' ? 'bg-green-500' : 'bg-red-500'}">
        <h3 class="text-2xl font-bold">{battleResult === 'win' ? 'KEMENANGAN!' : 'KEKALAHAN!'}</h3>
        <Button onclick={exitDungeon} class="mt-2">Kembali ke Entrance</Button>
    </div>
{/if}
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
			{#if $profileStore}
				<div class="flex items-center justify-center gap-2 text-lg">
					<KeyRound class="size-5 text-yellow-500" />
					<span class="font-semibold">Kunci Dungeon:</span>
					<span class="font-bold text-xl">{$profileStore.dungeonKeys}</span>
				</div>
			{/if}
			<Button onclick={startBattle} size="lg" disabled={!$profileStore || $profileStore.dungeonKeys <= 0}>
				Cari Pertarungan
			</Button>
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
					<div class="text-sm space-y-1 text-gray-600 dark:text-gray-300 pt-2 border-t dark:border-slate-700">
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
						<div
							class="mt-4 text-center p-4 rounded-lg {battleResult === 'win'
								? 'bg-green-500'
								: 'bg-red-500'}"
						>
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

			<Card class="order-3 h-96 flex flex-col">
				<CardHeader class="flex flex-row items-center gap-4 space-y-0 pb-2">
					<ScrollText class="size-8 text-gray-500" />
					<CardTitle>Battle Log</CardTitle>
				</CardHeader>
				<CardContent class="flex-1 overflow-y-auto text-sm font-mono space-y-2 pr-2">
					{#each battleLog as log}
						<p><span class="text-gray-500 mr-2">»</span>{log}</p>
					{/each}
				</CardContent>
			</Card>
		</div>
	{/if}

	<Dialog bind:open={isConfirmationDialogOpen}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle class="flex items-center justify-center gap-2">
					<ShieldAlert class="size-5 text-yellow-500" />
					[ PERINGATAN SISTEM ]
				</DialogTitle>
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
</main>
