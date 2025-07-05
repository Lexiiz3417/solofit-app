<script lang="ts">
	// Script ini sudah benar, tidak ada perubahan
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import { doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Sword, Shield, Heart, Star, Award, Activity } from 'lucide-svelte';

	type StatName = 'strength' | 'agility' | 'stamina';

	async function allocateStatPoint(statName: StatName) {
		if (!$userStore) {
			toast.error('Kamu harus login.');
			return;
		}
		try {
			await runTransaction(db, async (transaction) => {
				const userDocRef = doc(db, 'users', $userStore.uid);
				const userDoc = await transaction.get(userDocRef);
				if (!userDoc.exists()) throw new Error('Dokumen pengguna tidak ditemukan.');
				const currentPoints = userDoc.data().statPoints;
				if (currentPoints <= 0) throw new Error('Poin tidak cukup.');
				let updates: { [key: string]: any } = {
					statPoints: increment(-1),
					[`stats.${statName}`]: increment(1)
				};
				if (statName === 'stamina') {
					updates = {
						...updates,
						maxHp: increment(10),
						hp: increment(10)
					};
				}
				transaction.update(userDocRef, updates);
			});
			toast.success(`+1 ${statName.charAt(0).toUpperCase() + statName.slice(1)}!`);
		} catch (error: any) {
			console.error('Gagal alokasi poin:', error);
			toast.error('Gagal menaikkan status', { description: error.message });
		}
	}
</script>

<main class="p-4 md:p-8 max-w-lg mx-auto">
	{#if $profileStore}
		<Card>
			<CardHeader>
				<CardTitle class="text-2xl">Status Karakter</CardTitle>
				<CardDescription>Lihat progres dan alokasikan poin statusmu.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-6">
				<div class="space-y-4 p-4 border rounded-lg">
					<div class="flex items-center justify-between text-md">
						<div class="flex items-center gap-2 text-gray-700">
							<Award class="size-5 text-yellow-500" />
							<span>Level</span>
						</div>
						<span class="font-mono font-bold">{$profileStore.level}</span>
					</div>
					<div class="flex items-center justify-between text-md">
						<div class="flex items-center gap-2 text-gray-700">
							<Heart class="size-5 text-red-500" />
							<span>HP</span>
						</div>
						<span class="font-mono font-bold text-red-600">{$profileStore.hp} / {$profileStore.maxHp}</span>
					</div>
					<div class="space-y-1">
						<div class="flex justify-between items-baseline text-sm">
							<span class="font-medium">Main EXP</span>
							<span class="font-mono">{$profileStore.exp} / {$profileStore.requiredExp}</span>
						</div>
						<Progress value={$profileStore.exp} max={$profileStore.requiredExp} />
					</div>
					<div class="flex items-center justify-between text-md pt-2 border-t">
						<div class="flex items-center gap-2 text-gray-700">
							<Star class="size-5 text-blue-500" />
							<span>Poin Tersedia</span>
						</div>
						<span class="font-mono text-2xl font-bold text-blue-600">{$profileStore.statPoints}</span>
					</div>
				</div>

				<div class="space-y-3 pt-4 border-t">
					<h3 class="text-lg font-semibold">Alokasi Atribut</h3>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2"><Sword class="size-5 text-gray-600" /><span>Strength</span></div>
						<div class="flex items-center gap-4">
							<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.strength}</span>
							<Button onclick={() => allocateStatPoint('strength')} disabled={$profileStore.statPoints <= 0} size="sm" variant="outline">+</Button>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2"><Activity class="size-5 text-gray-600" /><span>Agility</span></div>
						<div class="flex items-center gap-4">
							<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.agility}</span>
							<Button onclick={() => allocateStatPoint('agility')} disabled={$profileStore.statPoints <= 0} size="sm" variant="outline">+</Button>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2"><Shield class="size-5 text-gray-600" /><span>Stamina</span></div>
						<div class="flex items-center gap-4">
							<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.stamina}</span>
							<Button onclick={() => allocateStatPoint('stamina')} disabled={$profileStore.statPoints <= 0} size="sm" variant="outline">+</Button>
						</div>
					</div>
				</div>

				<div class="space-y-4 pt-4 border-t">
					<h3 class="text-lg font-semibold">Progres Mastery</h3>
					<div class="space-y-1">
						<div class="flex justify-between items-baseline text-sm">
							<span class="font-medium">Strength Mastery (Lv. {$profileStore.mastery.strength.level})</span>
							<span class="font-mono">{$profileStore.mastery.strength.exp} / {$profileStore.mastery.strength.requiredExp}</span>
						</div>
						<Progress value={$profileStore.mastery.strength.exp} max={$profileStore.mastery.strength.requiredExp} />
					</div>
					<div class="space-y-1">
						<div class="flex justify-between items-baseline text-sm">
							<span class="font-medium">Stamina Mastery (Lv. {$profileStore.mastery.stamina.level})</span>
							<span class="font-mono">{$profileStore.mastery.stamina.exp} / {$profileStore.mastery.stamina.requiredExp}</span>
						</div>
						<Progress value={$profileStore.mastery.stamina.exp} max={$profileStore.mastery.stamina.requiredExp} />
					</div>
					<div class="space-y-1">
						<div class="flex justify-between items-baseline text-sm">
							<span class="font-medium">Agility Mastery (Lv. {$profileStore.mastery.agility.level})</span>
							<span class="font-mono">{$profileStore.mastery.agility.exp} / {$profileStore.mastery.agility.requiredExp}</span>
						</div>
						<Progress value={$profileStore.mastery.agility.exp} max={$profileStore.mastery.agility.requiredExp} />
					</div>
				</div>
			</CardContent>
		</Card>
	{:else}
		<p class="text-center">Memuat profil...</p>
	{/if}
</main>