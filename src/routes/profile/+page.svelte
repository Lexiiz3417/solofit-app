<script lang="ts">
	import { profileStore, userStore } from '$lib/firebase/auth';
	import { db, auth } from '$lib/firebase/client';
	import { doc, updateDoc, increment } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { User, Star, LogOut, Swords, Brain, Dumbbell, Zap, Settings } from 'lucide-svelte';
	import ThemeToggle from '$lib/components/custom/ThemeToggle.svelte';

	// Fungsi incrementStat tidak berubah
	async function incrementStat(statName: 'strength' | 'stamina' | 'agility' | 'intelligence') {
		if (!$profileStore || !$userStore || $profileStore.statPoints <= 0) {
			toast.error('Poin Status tidak cukup!');
			return;
		}
		try {
			const userRef = doc(db, 'users', $userStore.uid);
			await updateDoc(userRef, {
				statPoints: increment(-1),
				[`stats.${statName}`]: increment(1)
			});
			toast.success(`Stat ${statName.charAt(0).toUpperCase() + statName.slice(1)} berhasil ditingkatkan!`);
		} catch (error) {
			console.error(`Gagal meningkatkan stat ${statName}:`, error);
			toast.error('Terjadi kesalahan saat meningkatkan stat.');
		}
	}

	function handleLogout() {
		auth.signOut();
		toast.success('Kamu berhasil logout.');
	}
</script>

<main class="container mx-auto p-4 md:p-8 max-w-4xl">
	{#if $profileStore}
		<div class="flex items-center justify-between mb-8">
			<div class="flex items-center gap-4">
				<User class="size-9 text-primary" />
				<div>
					<h1 class="text-3xl font-bold">{$profileStore.username}</h1>
					<p class="text-muted-foreground">Level {$profileStore.level} Hunter</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<ThemeToggle />
				<Button onclick={handleLogout} variant="destructive" size="sm">
					<LogOut class="size-4 md:mr-2" />
					<span class="hidden md:inline">Logout</span>
				</Button>
			</div>
		</div>

		<Card class="mb-8">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Star class="size-5 text-yellow-400" />
					Alokasi Poin Status
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-muted-foreground mb-4">
					Kamu punya <span class="font-bold text-primary">{$profileStore.statPoints}</span> poin yang bisa dialokasikan.
				</p>
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Dumbbell class="size-5 text-red-500" />
							<span class="font-medium">Strength</span>
						</div>
						<div class="flex items-center gap-4">
							<span class="font-bold text-lg w-8 text-center">{$profileStore.stats.strength}</span>
							<Button onclick={() => incrementStat('strength')} size="icon" disabled={$profileStore.statPoints <= 0}>+</Button>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Swords class="size-5 text-green-500" />
							<span class="font-medium">Stamina</span>
						</div>
						<div class="flex items-center gap-4">
							<span class="font-bold text-lg w-8 text-center">{$profileStore.stats.stamina}</span>
							<Button onclick={() => incrementStat('stamina')} size="icon" disabled={$profileStore.statPoints <= 0}>+</Button>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Zap class="size-5 text-blue-500" />
							<span class="font-medium">Agility</span>
						</div>
						<div class="flex items-center gap-4">
							<span class="font-bold text-lg w-8 text-center">{$profileStore.stats.agility}</span>
							<Button onclick={() => incrementStat('agility')} size="icon" disabled={$profileStore.statPoints <= 0}>+</Button>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Brain class="size-5 text-purple-500" />
							<span class="font-medium">Intelligence</span>
						</div>
						<div class="flex items-center gap-4">
							<span class="font-bold text-lg w-8 text-center">{$profileStore.stats.intelligence ?? 0}</span>
							<Button onclick={() => incrementStat('intelligence')} size="icon" disabled={$profileStore.statPoints <= 0}>+</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Mastery EXP</CardTitle>
				<CardDescription>Latih terus untuk membuka potensi tersembunyi!</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<div class="flex justify-between mb-1">
						<span class="text-sm font-medium">Strength Mastery</span>
						<span class="text-sm text-muted-foreground">
							{$profileStore.mastery.strength?.exp ?? 0} / {$profileStore.mastery.strength?.requiredExp ?? 100}
						</span>
					</div>
					<Progress value={$profileStore.mastery.strength?.exp ?? 0} max={$profileStore.mastery.strength?.requiredExp ?? 100} />
				</div>
				<div>
					<div class="flex justify-between mb-1">
						<span class="text-sm font-medium">Agility Mastery</span>
						<span class="text-sm text-muted-foreground">
							{$profileStore.mastery.agility?.exp ?? 0} / {$profileStore.mastery.agility?.requiredExp ?? 100}
						</span>
					</div>
					<Progress value={$profileStore.mastery.agility?.exp ?? 0} max={$profileStore.mastery.agility?.requiredExp ?? 100} />
				</div>
				<div>
					<div class="flex justify-between mb-1">
						<span class="text-sm font-medium">Intelligence Mastery</span>
						<span class="text-sm text-muted-foreground">
							{$profileStore.mastery.intelligence?.exp ?? 0} / {$profileStore.mastery.intelligence?.requiredExp ?? 100}
						</span>
					</div>
					<Progress value={$profileStore.mastery.intelligence?.exp ?? 0} max={$profileStore.mastery.intelligence?.requiredExp ?? 100} />
				</div>
			</CardContent>
		</Card>

	{:else}
		<div class="text-center py-20">
			<p class="text-muted-foreground">Memuat data profil...</p>
		</div>
	{/if}
</main>