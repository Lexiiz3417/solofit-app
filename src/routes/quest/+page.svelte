<script lang="ts">
	// Import-import lama
	import { db } from '$lib/firebase/client';
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';

	// Import untuk UI baru
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	// PERHATIKAN IMPORT IKON YANG BARU DAN LEBIH RELEVAN
	import { Award, Dumbbell, Star, HeartPulse, Footprints, Shield } from 'lucide-svelte';

	// Fungsi handleCompleteQuest tidak ada yang berubah
	async function handleCompleteQuest(quest: (typeof dailyQuests)[0]) {
        // ... (fungsi ini biarkan sama persis seperti sebelumnya) ...
	}

	// KITA GANTI IKON-IKONNYA DI SINI
	const dailyQuests = [
		{ id: 'pushup', name: 'Push-up', target: '100x', exp: 10, masteryType: 'strength', masteryExp: 20, icon: Dumbbell },
		{ id: 'situp', name: 'Sit-up', target: '100x', exp: 10, masteryType: 'stamina', masteryExp: 15, icon: HeartPulse }, // <-- Lebih cocok!
		{ id: 'squat', name: 'Squat', target: '100x', exp: 10, masteryType: 'strength', masteryExp: 20, icon: Dumbbell },
		{ id: 'run', name: 'Lari', target: '10km', exp: 40, masteryType: 'stamina', masteryExp: 50, icon: Footprints } // <-- Lebih cocok!
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
						<div class="text-sm text-center">
							<p class="text-green-600 font-semibold flex items-center gap-1.5">
								<Star class="size-4" />{quest.exp} EXP
							</p>
							<p class="text-blue-600 font-semibold flex items-center gap-1.5">
								<Shield class="size-4" />{quest.masteryExp} M.EXP
							</p>
						</div>
						<Button onclick={() => handleCompleteQuest(quest)} size="sm"> Selesaikan </Button>
					</div>
				</div>
			</Card>
		{/each}
	</div>
</main>