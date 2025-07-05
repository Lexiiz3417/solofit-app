<script lang="ts">
	import { db } from '$lib/firebase/client';
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { doc, updateDoc, increment, runTransaction, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Award, Dumbbell, Star, Bot, Wind, Shield, HeartPulse, Footprints } from 'lucide-svelte';
	import type { Quest, UserProfile, TransactionResult } from '$lib/types'; // Tambahkan TransactionResult
	import { get } from 'svelte/store';

	let activeQuests = $state<Quest[]>([]);
	let isLoadingQuests = $state(true);
	let hasFetched = $state(false);

	const iconMap = { Dumbbell, Bot, Wind, Shield, HeartPulse, Footprints, Award };

	$effect(() => {
		const profile = get(profileStore);
		if (profile && !hasFetched) {
			hasFetched = true;
			fetchAndGenerateQuests();
		}
		if (!profile) {
			hasFetched = false;
			activeQuests = [];
		}
	});

	async function fetchAndGenerateQuests() {
		const profile = get(profileStore);
		if (!profile) return;
		isLoadingQuests = true;
		try {
			const q = query(collection(db, 'quests'), where('categories', 'array-contains', profile.goal), orderBy('name'));
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				activeQuests = [];
			} else {
				const questPool = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Quest));
				questPool.sort(() => 0.5 - Math.random());
				const selectedQuests = questPool.slice(0, 3);
				const difficultyMultipliers = {
					beginner: 1,
					intermediate: 1.5,
					advanced: 2.5
				};
				const multiplier = difficultyMultipliers[profile.fitnessLevel] || 1;
				const generatedQuests = selectedQuests.map((quest) => ({
					...quest,
					finalTarget: Math.ceil(quest.baseTarget * multiplier),
					icon: iconMap[quest.iconName as keyof typeof iconMap] || Award
				}));
				activeQuests = generatedQuests;
			}
		} catch (error) {
			console.error('Gagal mengambil quest:', error);
			toast.error('Gagal memuat quest harian.');
		} finally {
			isLoadingQuests = false;
		}
	}

	async function handleCompleteQuest(quest: Quest) {
	const currentUser = get(userStore);
	if (!currentUser) {
		toast.error('Kamu harus login untuk menyelesaikan quest.');
		return;
	}

	try {
		// Secara eksplisit beritahu tipe apa yang akan dikembalikan oleh transaksi ini
		const result = await runTransaction<TransactionResult>(db, async (transaction) => {
			const userDocRef = doc(db, 'users', currentUser.uid);
			const userDoc = await transaction.get(userDocRef);

			if (!userDoc.exists()) throw new Error('Profil user tidak ditemukan.');

			const userData = userDoc.data() as UserProfile;
			let updates: { [key: string]: any } = {};
			
			// Buat objek laporan dengan tipe yang jelas
			const transactionResult: TransactionResult = {
				mainLeveledUp: false,
				newMainLevel: 0,
				masteryLeveledUp: false,
				newMasteryLevel: 0,
				statGained: null
			};

			// Logika EXP Utama
			updates['exp'] = increment(quest.baseExp);
			const newMainExp = userData.exp + quest.baseExp;
			if (newMainExp >= userData.requiredExp) {
				transactionResult.mainLeveledUp = true;
				transactionResult.newMainLevel = userData.level + 1;
				updates['level'] = increment(1);
				updates['exp'] = newMainExp - userData.requiredExp;
				updates['requiredExp'] = Math.floor(userData.requiredExp * 1.5);
				updates['statPoints'] = increment(5);
			}

			// Logika EXP Mastery
			const masteryData = userData.mastery[quest.masteryType];
			const newMasteryExp = masteryData.exp + quest.baseMasteryExp;
			updates[`mastery.${quest.masteryType}.exp`] = increment(quest.baseMasteryExp);
			if (newMasteryExp >= masteryData.requiredExp) {
				transactionResult.masteryLeveledUp = true;
				transactionResult.newMasteryLevel = masteryData.level + 1;
				transactionResult.statGained = quest.masteryType;
				updates[`mastery.${quest.masteryType}.level`] = increment(1);
				updates[`mastery.${quest.masteryType}.exp`] = newMasteryExp - masteryData.requiredExp;
				updates[`mastery.${quest.masteryType}.requiredExp`] = Math.floor(masteryData.requiredExp * 1.8);
				updates[`stats.${quest.masteryType}`] = increment(1);
			}

			transaction.update(userDocRef, updates);
			return transactionResult; // Kembalikan laporan hasil yang sudah jelas tipenya
		});

		// Logika Notifikasi
		toast.success(`${quest.name} Selesai!`, {
			description: `Kamu mendapatkan ${quest.baseExp} EXP & ${quest.baseMasteryExp} ${quest.masteryType} EXP.`
		});

		if (result.mainLeveledUp) {
			toast.info(`NAIK LEVEL KE ${result.newMainLevel}!`);
		}

		// Sekarang TypeScript 100% yakin 'result.statGained' adalah string di sini
		if (result.masteryLeveledUp && result.statGained) {
			toast.success(`${result.statGained.toUpperCase()} MASTERY NAIK KE LV. ${result.newMasteryLevel}!`, {
				description: `Stat ${result.statGained} permanen +1!`
			});
		}
	} catch (error: any) {
		console.error('Error menyelesaikan quest: ', error);
		toast.error('Gagal menyelesaikan quest', {
			description: error.message
		});
	}
}
</script>

<main class="p-4 md:p-8 max-w-2xl mx-auto">
	<div class="flex items-center gap-4 mb-8">
		<Award class="size-9 text-yellow-500" />
		<div>
			<h1 class="text-3xl font-bold">Misi Harian</h1>
			<p class="text-gray-500">Misi hari ini telah disesuaikan untukmu, Hunter!</p>
		</div>
	</div>

	<div class="space-y-4">
		{#if isLoadingQuests}
			<p class="text-center text-gray-500">Mencari misi untukmu...</p>
		{:else if activeQuests.length === 0}
			<Card class="text-center p-6">
				<CardTitle>Tidak Ada Misi</CardTitle>
				<CardDescription class="mt-2">
					Cek kembali besok atau pastikan 'goal' di profilmu sudah sesuai dengan kategori quest yang ada.
				</CardDescription>
			</Card>
		{:else}
			{#each activeQuests as quest}
				<Card>
					<div class="flex items-center justify-between p-4">
						<div class="flex items-center gap-4">
							<div class="p-2 bg-slate-100 rounded-md">
								{#if quest.icon}
									<quest.icon class="size-8 text-slate-600" />
								{/if}
							</div>
							<div>
								<CardTitle class="text-lg">{quest.name}</CardTitle>
								<CardDescription>Target: {quest.finalTarget} {quest.unit}</CardDescription>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="text-sm text-center">
								<p class="text-green-600 font-semibold flex items-center gap-1.5">
									<Star class="size-4" />{quest.baseExp} EXP
								</p>
								<p class="text-blue-600 font-semibold flex items-center gap-1.5">
									<Shield class="size-4" />{quest.baseMasteryExp} M.EXP
								</p>
							</div>
							<Button onclick={() => handleCompleteQuest(quest)} size="sm"> Selesaikan </Button>
						</div>
					</div>
				</Card>
			{/each}
		{/if}
	</div>
</main>