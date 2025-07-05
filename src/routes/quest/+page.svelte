<script lang="ts">
	// Import-import lama
	import { db } from '$lib/firebase/client';
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { doc, updateDoc, increment } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';

	// Import untuk UI baru
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Award, Dumbbell, Star, Bot, Wind } from 'lucide-svelte'; // Import ikon

	// Logika fungsi tidak ada yang berubah sama sekali
	async function handleCompleteQuest(expReward: number, questName: string) {
		if (!$userStore || !$profileStore) {
			toast.error('Anda harus login untuk menyelesaikan quest.');
			return;
		}

		try {
			const userDocRef = doc(db, 'users', $userStore.uid);

			await updateDoc(userDocRef, {
				exp: increment(expReward)
			});

			toast.success(`${questName} Selesai!`, {
				description: `Kamu mendapatkan ${expReward} EXP.`
			});

			const currentExp = $profileStore.exp + expReward;
			const requiredExp = $profileStore.requiredExp;

			if (currentExp >= requiredExp) {
				const newLevel = $profileStore.level + 1;
				const newRequiredExp = Math.floor(requiredExp * 1.5);
				const remainingExp = currentExp - requiredExp;

				await updateDoc(userDocRef, {
					level: newLevel,
					exp: remainingExp,
					requiredExp: newRequiredExp,
					statPoints: increment(5)
				});

				toast.success(`SELAMAT! ANDA NAIK KE LEVEL ${newLevel}!`, {
					description: 'Kerja bagus, teruslah berlatih!',
					duration: 5000
				});
			}
		} catch (error: any) {
			console.error('Error menyelesaikan quest: ', error);
			toast.error('Gagal menyelesaikan quest', {
				description: error.message
			});
		}
	}

	const dailyQuests = [
		{ id: 'pushup', name: 'Push-up', target: '100x', exp: 10, icon: Dumbbell },
		{ id: 'situp', name: 'Sit-up', target: '100x', exp: 10, icon: Bot },
		{ id: 'squat', name: 'Squat', target: '100x', exp: 10, icon: Dumbbell },
		{ id: 'run', name: 'Lari', target: '10km', exp: 40, icon: Wind }
	];
</script>

<main class="p-4 md:p-8 max-w-2xl mx-auto">
	<div class="flex items-center gap-4 mb-6">
		<Award class="size-8 text-yellow-500" />
		<h1 class="text-3xl font-bold">Misi Harian</h1>
	</div>

	<div class="space-y-4">
		{#each dailyQuests as quest}
			<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<div class="space-y-1">
						<CardTitle class="text-xl">{quest.name}</CardTitle>
						<CardDescription>Target: {quest.target}</CardDescription>
					</div>
					<svelte:component this={quest.icon} class="size-8 text-gray-400" />
				</CardHeader>
				<CardContent class="flex items-center justify-between">
					<div class="text-sm text-green-600 font-semibold flex items-center gap-1">
						<Star class="size-4" />
						<span>Reward: {quest.exp} EXP</span>
					</div>
					<Button onclick={() => handleCompleteQuest(quest.exp, quest.name)} size="sm">
						Selesaikan
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>

	<div class="mt-8 text-center">
		<a href="/" class="text-blue-600 hover:underline">&larr; Kembali ke Halaman Utama</a>
	</div>
</main>