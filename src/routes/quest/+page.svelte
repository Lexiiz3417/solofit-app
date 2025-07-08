<script lang="ts">
	// Import-import yang sudah disederhanakan
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import {
		doc,
		updateDoc,
		increment,
		runTransaction,
		collection,
		query,
		where,
		getDocs,
		writeBatch,
		Timestamp,
		orderBy
	} from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Award, Dumbbell, Star, Shield, HeartPulse, Footprints, Gem, Weight, Flame, Zap, Wind, BookOpen, BrainCircuit, Lightbulb } from 'lucide-svelte';
	import type { Quest, UserProfile, TransactionResult } from '$lib/types';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	// Tipe data untuk quest harian yang aktif
	interface ActiveQuest extends Quest {
		progress: number;
		target: number;
		isComplete: boolean;
	}

	// State reaktif, tanpa state dialog yang rumit
	let dailyQuests = $state<ActiveQuest[]>([]);
	let questProgressInputs = $state<{ [key: string]: number | undefined }>({});
	let isLoadingQuests = $state(true);
	let hasFetched = $state(false);

	const iconMap = { Dumbbell, HeartPulse, Footprints, Award, Gem, Weight, Flame, Zap, Wind, BookOpen, BrainCircuit, Lightbulb };

	onMount(() => {
		const unsubscribe = profileStore.subscribe((profile) => {
			if (profile && !hasFetched) {
				hasFetched = true;
				fetchOrCreateDailyQuests();
			}
		});
		return () => unsubscribe();
	});

	// Fungsi fetch dan generate tidak berubah
	async function fetchOrCreateDailyQuests() {
		const currentUser = get(userStore);
		const profile = get(profileStore);
		if (!currentUser || !profile) return;
		isLoadingQuests = true;
		const userDocRef = doc(db, 'users', currentUser.uid);
		const dailyQuestsColRef = collection(userDocRef, 'dailyQuests');
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const q = query(dailyQuestsColRef, where('date', '>=', Timestamp.fromDate(today)));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.empty) {
			await generateNewQuests(dailyQuestsColRef, profile);
		} else {
			let quests = querySnapshot.docs.map((d) => ({ ...(d.data() as Omit<ActiveQuest, 'id'>), id: d.id }));
			dailyQuests = quests.map((q) => ({
				...q,
				icon: iconMap[q.iconName as keyof typeof iconMap]
			}));
		}
		isLoadingQuests = false;
	}
	async function generateNewQuests(dailyQuestsColRef: any, profile: UserProfile) {
		const questBankQuery = query(collection(db, 'quests'), where('categories', 'array-contains', profile.goal), orderBy('name'));
		const bankSnapshot = await getDocs(questBankQuery);
		let questPool = bankSnapshot.docs.map((doc) => ({ ...(doc.data() as Omit<Quest, 'id'>), id: doc.id }));
		questPool.sort(() => 0.5 - Math.random());
		const selectedQuests = questPool.slice(0, 3);
		const difficultyMultipliers = { beginner: 1, intermediate: 1.5, advanced: 2.5 };
		const multiplier = difficultyMultipliers[profile.fitnessLevel] || 1;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const batch = writeBatch(db);
		selectedQuests.forEach((questTemplate) => {
			const newQuestDocRef = doc(dailyQuestsColRef);
			batch.set(newQuestDocRef, {
				...questTemplate,
				target: Math.ceil(questTemplate.baseTarget * multiplier),
				progress: 0,
				isComplete: false,
				date: Timestamp.fromDate(today)
			});
		});
		await batch.commit();
		await fetchOrCreateDailyQuests();
	}

	// Fungsi untuk "mencicil" progres dengan progres yang dibatasi (capped)
	async function handleAddProgress(quest: ActiveQuest, amount: number | undefined) {
		const currentUser = get(userStore);
		if (!currentUser || !amount || amount <= 0) {
			toast.warning('Masukkan jumlah progres yang valid.');
			return;
		}
		if (quest.isComplete) {
			toast.info(`Quest '${quest.name}' sudah selesai hari ini.`);
			return;
		}
		const questDocRef = doc(db, 'users', currentUser.uid, 'dailyQuests', quest.id);
		const amountNeeded = quest.target - quest.progress;
		const amountToAdd = Math.min(amount, amountNeeded);
		if (amountToAdd <= 0) {
			toast.info(`Progres untuk '${quest.name}' sudah maksimal.`);
			return;
		}
		await updateDoc(questDocRef, { progress: increment(amountToAdd) });
		const newProgress = quest.progress + amountToAdd;
		if (newProgress >= quest.target) {
			await updateDoc(questDocRef, { isComplete: true });
			await grantRewards(quest); // Panggil fungsi pemberian hadiah
		} else {
			toast.success(`Progres '${quest.name}' ditambahkan sebanyak ${amountToAdd}!`);
		}
		questProgressInputs[quest.id] = undefined;
		fetchOrCreateDailyQuests();
	}

	// Fungsi untuk memberikan hadiah HANYA SEKALI saat quest selesai
	async function grantRewards(quest: ActiveQuest) {
		const currentUser = get(userStore);
		if (!currentUser) return;
		try {
			const mainExpGained = quest.baseExp;
			const masteryExpGained = quest.baseMasteryExp;

			const result = await runTransaction<TransactionResult>(db, async (transaction) => {
				const userDocRef = doc(db, 'users', currentUser.uid);
				const userDoc = await transaction.get(userDocRef);
				if (!userDoc.exists()) throw new Error('Profil user tidak ditemukan.');
				const userData = userDoc.data() as UserProfile;
				let updates: { [key: string]: any } = {};
				const transactionResult: TransactionResult = { mainLeveledUp: false, newMainLevel: 0, masteryLeveledUp: false, newMasteryLevel: 0, statGained: null, statPointsGained: 0 };
				updates['exp'] = increment(mainExpGained);
				updates[`mastery.${quest.masteryType}.exp`] = increment(masteryExpGained);
				const newMainExp = userData.exp + mainExpGained;
				if (newMainExp >= userData.requiredExp) {
					transactionResult.mainLeveledUp = true;
					transactionResult.newMainLevel = userData.level + 1;
					transactionResult.statPointsGained = 5;
					updates['level'] = increment(1);
					updates['exp'] = newMainExp - userData.requiredExp;
					updates['requiredExp'] = Math.floor(userData.requiredExp * 1.5);
					updates['statPoints'] = increment(5);
				}
				const masteryData = userData.mastery[quest.masteryType];
				const newMasteryExp = masteryData.exp + masteryExpGained;
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
				return transactionResult;
			});

			// --- LOGIKA NOTIFIKASI KEMBALI KE TOAST YANG SIMPEL ---
			toast.success(`Quest '${quest.name}' Selesai!`, {
				description: `Kamu mendapatkan +${mainExpGained} EXP & +${masteryExpGained} M.EXP`
			});

			if (result.mainLeveledUp) {
				toast.info(`SELAMAT! Kamu naik ke LEVEL ${result.newMainLevel}!`, {
					description: `Kamu mendapatkan ${result.statPointsGained} Stat Points.`
				});
			}
			if (result.masteryLeveledUp && result.statGained) {
				toast.success(`${result.statGained.toUpperCase()} MASTERY NAIK KE LV. ${result.newMasteryLevel}!`, {
					description: `Stat ${result.statGained} permanen +1!`
				});
			}
		} catch (error: any) {
			toast.error('Gagal memproses hadiah quest.');
			console.error("Error menyelesaikan quest: ", error);
		}
	}
</script>

<main class="p-4 md:p-8 max-w-2xl mx-auto">
	<div class="flex items-center gap-4 mb-8">
		<Award class="size-9 text-yellow-500" />
		<div>
			<h1 class="text-3xl font-bold">Misi Harian</h1>
			<p class="text-gray-500 dark:text-gray-400">Selesaikan untuk mendapatkan EXP dan jadi lebih kuat!</p>
		</div>
	</div>
	
	<div class="p-4 mb-6 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200">
		<p class="font-bold">PERINGATAN</p>
		<p>Kegagalan untuk menyelesaikan Misi Harian akan mengakibatkan penalti yang sesuai.</p>
	</div>

	<div class="space-y-4">
		{#if isLoadingQuests}
			<p class="text-center text-gray-500 dark:text-gray-400">Mencari misi untukmu...</p>
		{:else if dailyQuests.length === 0}
			<Card class="text-center p-6"><CardTitle>Tidak Ada Misi Hari Ini</CardTitle><CardDescription class="mt-2"> Cek kembali besok! </CardDescription></Card>
		{:else}
			{#each dailyQuests as quest}
				<Card class={quest.isComplete ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-70' : ''}>
					<div class="p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-4">
								<div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
									{#if quest.icon}
										<quest.icon class="size-8 text-slate-600 dark:text-slate-300" />
									{/if}
								</div>
								<div>
									<CardTitle class="text-lg">{quest.name}</CardTitle>
									<CardDescription class="dark:text-gray-400">Progres: {quest.progress} / {quest.target} {quest.unit}</CardDescription>
								</div>
							</div>
							<div class="text-sm text-center">
								<p class="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1.5">
									<Star class="size-4" />{quest.baseExp} EXP
								</p>
								<p class="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
									<Shield class="size-4" />{quest.baseMasteryExp} M.EXP
								</p>
							</div>
						</div>
						
						<Progress value={quest.progress} max={quest.target} class="mt-4" />
						
						<div class="flex items-center gap-2 mt-4">
							<Input
								type="number"
								placeholder="Jumlah..."
								class="flex-grow"
								value={questProgressInputs[quest.id] ?? ''}
								oninput={(event) => {
									const target = event.currentTarget as HTMLInputElement;
									questProgressInputs[quest.id] = target.valueAsNumber || undefined;
								}}
								disabled={quest.isComplete}
							/>
							<Button onclick={() => handleAddProgress(quest, questProgressInputs[quest.id])} disabled={quest.isComplete}>+</Button>
						</div>
					</div>
				</Card>
			{/each}
		{/if}
	</div>
</main>
