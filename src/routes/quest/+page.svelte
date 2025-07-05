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

	// Fungsi handleCompleteQuest tidak ada yang berubah
	async function handleCompleteQuest(expReward: number, questName: string) {
		if (!$userStore || !$profileStore) {
			toast.error('Kamu harus login untuk menyelesaikan quest.');
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
				toast.success(`SELAMAT! KAMU NAIK KE LEVEL ${newLevel}!`, {
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

	// Kita tambahkan properti 'icon' di sini
	const dailyQuests = [
		{ id: 'pushup', name: 'Push-up', target: '100x', exp: 10, icon: Dumbbell },
		{ id: 'situp', name: 'Sit-up', target: '100x', exp: 10, icon: Bot },
		{ id: 'squat', name: 'Squat', target: '100x', exp: 10, icon: Dumbbell },
		{ id: 'run', name: 'Lari', target: '10km', exp: 40, icon: Wind }
	];
</script>

<main class="p-4 md:p-8 max-w-2xl mx-auto">
	<div class="flex items-center gap-4 mb-8">
		<Award class="size-9 text-yellow-500" />
		<div>
			<h1 class="text-3xl font-bold">Misi Harian</h1>
			<p class="text-gray-500">Selesaikan untuk mendapatkan EXP dan jadi lebih kuat!</p>
		</div>
	</div>

	<div class="space-y-4">
		{#each dailyQuests as quest}
			<Card>
				<div class="flex items-center justify-between p-4">
					<div class="flex items-center gap-4">
						<div class="p-2 bg-slate-100 rounded-md">
							<svelte:component this={quest.icon} class="size-8 text-slate-600" />
						</div>
						<div>
							<CardTitle class="text-lg">{quest.name}</CardTitle>
							<CardDescription>Target: {quest.target}</CardDescription>
						</div>
					</div>
					<div class="flex items-center gap-4">
						<div class="text-md text-green-600 font-semibold flex items-center gap-1.5">
							<Star class="size-5" />
							<span>{quest.exp} EXP</span>
						</div>
						<Button onclick={() => handleCompleteQuest(quest.exp, quest.name)} size="sm">
							Selesaikan
						</Button>
					</div>
				</div>
			</Card>
		{/each}
	</div>
</main>