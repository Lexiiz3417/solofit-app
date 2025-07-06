<script lang="ts">
	// Script lengkap dan benar untuk halaman profil
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db, auth } from '$lib/firebase/client';
	import { doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import { signOut } from 'firebase/auth';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Sword, Shield, Heart, Star, Award, Activity, Settings } from 'lucide-svelte';
	import ThemeToggle from '$lib/components/custom/ThemeToggle.svelte';
	import { goto } from '$app/navigation';
	
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
					updates = { ...updates, maxHp: increment(10), hp: increment(10) };
				}
				transaction.update(userDocRef, updates);
			});
			toast.success(`+1 ${statName.charAt(0).toUpperCase() + statName.slice(1)}!`);
		} catch (error: any) {
			console.error('Gagal alokasi poin:', error);
			toast.error('Gagal menaikkan status', { description: error.message });
		}
	}

	async function handleLogout() {
		try {
			await signOut(auth);
			toast.success('Kamu telah berhasil logout.');
			goto('/');
		} catch (error: any) {
			toast.error('Gagal logout', { description: error.message });
		}
	}
</script>

<main class="p-4 md:p-8 container mx-auto">
	
	<div class="mb-8">
		<h1 class="text-4xl font-bold">Profil Karakter</h1>
		<p class="text-lg text-gray-500 dark:text-gray-400">Atur dan lihat perkembangan Hunter-mu di sini.</p>
	</div>

	{#if $profileStore}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="lg:col-span-1 order-1">
				<Card>
					<CardHeader><CardTitle>Info Utama</CardTitle></CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center justify-between text-md"><div class="flex items-center gap-2 dark:text-gray-300"><Award class="size-5 text-yellow-500" /><span>Level</span></div><span class="font-mono font-bold dark:text-white">{$profileStore.level}</span></div>
						<div class="flex items-center justify-between text-md"><div class="flex items-center gap-2 dark:text-gray-300"><Heart class="size-5 text-red-500" /><span>HP</span></div><span class="font-mono font-bold text-red-600">{$profileStore.hp} / {$profileStore.maxHp}</span></div>
						<div class="space-y-1"><div class="flex justify-between items-baseline text-sm dark:text-gray-400"><span>Main EXP</span><span class="font-mono">{$profileStore.exp} / {$profileStore.requiredExp}</span></div><Progress value={$profileStore.exp} max={$profileStore.requiredExp} /></div>
						<div class="flex items-center justify-between text-md pt-4 border-t dark:border-slate-700"><div class="flex items-center gap-2 dark:text-gray-300"><Star class="size-5 text-blue-500" /><span>Poin Tersedia</span></div><span class="font-mono text-2xl font-bold text-blue-600">{$profileStore.statPoints}</span></div>
					</CardContent>
				</Card>
			</div>

			<div class="lg:col-span-2 order-2">
				<Card>
					<CardHeader><CardTitle>Alokasi Atribut</CardTitle></CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 dark:text-gray-300"><Sword class="size-5 text-gray-500 dark:text-gray-400" /><span>Strength</span></div>
							<div class="flex items-center gap-4">
								<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.strength}</span>
								<Button onclick={() => allocateStatPoint('strength')} disabled={$profileStore.statPoints <= 0} size="sm" variant="outline">+</Button>
							</div>
						</div>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 dark:text-gray-300"><Activity class="size-5 text-gray-500 dark:text-gray-400" /><span>Agility</span></div>
							<div class="flex items-center gap-4">
								<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.agility}</span>
								<Button onclick={() => allocateStatPoint('agility')} disabled={$profileStore.statPoints <= 0} size="sm" variant="outline">+</Button>
							</div>
						</div>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 dark:text-gray-300"><Shield class="size-5 text-gray-500 dark:text-gray-400" /><span>Stamina</span></div>
							<div class="flex items-center gap-4">
								<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.stamina}</span>
								<Button onclick={() => allocateStatPoint('stamina')} disabled={$profileStore.statPoints <= 0} size="sm" variant="outline">+</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="lg:col-span-2 order-3">
				<Card>
					<CardHeader><CardTitle>Progres Mastery</CardTitle></CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-1"><div class="flex justify-between items-baseline text-sm dark:text-gray-300"><span class="font-medium">Strength Mastery (Lv. {$profileStore.mastery.strength.level})</span><span class="font-mono">{$profileStore.mastery.strength.exp} / {$profileStore.mastery.strength.requiredExp}</span></div><Progress value={$profileStore.mastery.strength.exp} max={$profileStore.mastery.strength.requiredExp} /></div>
						<div class="space-y-1"><div class="flex justify-between items-baseline text-sm dark:text-gray-300"><span class="font-medium">Stamina Mastery (Lv. {$profileStore.mastery.stamina.level})</span><span class="font-mono">{$profileStore.mastery.stamina.exp} / {$profileStore.mastery.stamina.requiredExp}</span></div><Progress value={$profileStore.mastery.stamina.exp} max={$profileStore.mastery.stamina.requiredExp} /></div>
						<div class="space-y-1"><div class="flex justify-between items-baseline text-sm dark:text-gray-300"><span class="font-medium">Agility Mastery (Lv. {$profileStore.mastery.agility.level})</span><span class="font-mono">{$profileStore.mastery.agility.exp} / {$profileStore.mastery.agility.requiredExp}</span></div><Progress value={$profileStore.mastery.agility.exp} max={$profileStore.mastery.agility.requiredExp} /></div>
					</CardContent>
				</Card>
			</div>

			<div class="lg:col-span-1 order-4">
				<Card>
					<CardHeader class="flex flex-row items-center gap-4 space-y-0">
						<Settings class="size-6 text-muted-foreground" />
						<CardTitle>Pengaturan</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center justify-between">
							<Label class="text-sm">Mode Tampilan</Label>
							<ThemeToggle />
						</div>
						<div class="pt-4 border-t dark:border-slate-700">
							<Button onclick={handleLogout} variant="destructive" class="w-full">Logout</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{:else}
		<p class="text-center">Memuat profil...</p>
	{/if}
</main>