<script lang="ts">
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Award, Heart, Star, Swords, ShieldCheck } from 'lucide-svelte';
	import DailyReward from '$lib/components/DailyReward.svelte';
	import { Toaster } from 'svelte-sonner'; 
</script>


<main class="p-4 md:p-8 container mx-auto">
	{#if $userStore === undefined || ($userStore && $profileStore === undefined)}
		<div class="flex items-center justify-center h-screen -mt-20">
			<p class="dark:text-gray-300">Loading...</p>
		</div>
	{:else if $userStore === null}
		<div class="flex flex-col items-center justify-center text-center" style="height: 80vh;">
			<h1 class="text-5xl md:text-6xl font-bold">
				Solo<span class="text-blue-600">Fit</span>
			</h1>
			<p class="mt-4 mb-8 max-w-md text-lg text-gray-500 dark:text-gray-400">
				Ubah Latihan Membosankan Menjadi Petualangan RPG Epik. Naikkan Level di Dunia Nyata.
			</p>
			<div class="space-y-4 w-full max-w-xs">
				<a href="/register" class="w-full">
                    <Button size="lg" class="w-full">Mulai Petualangan</Button>
                </a>
				<p class="text-sm">
					Sudah punya akun?
					<a href="/login"><Button variant="link">Login di sini</Button></a>
				</p>
			</div>
		</div>
	{:else if $profileStore}
		<div class="space-y-8">
			<div>
				<h1 class="text-4xl font-bold">Selamat Datang, {$profileStore.username}!</h1>
				<p class="text-lg text-gray-500 dark:text-gray-400">Siap untuk menjadi lebih kuat hari ini?</p>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Level</CardTitle>
						<Award class="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{$profileStore.level}</div>
						<Progress value={$profileStore.exp} max={$profileStore.requiredExp} class="mt-2 h-2" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Health Points</CardTitle>
						<Heart class="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold text-red-500">{$profileStore.hp} / {$profileStore.maxHp}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Poin Status Tersedia</CardTitle>
						<Star class="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold text-blue-600">{$profileStore.statPoints}</div>
					</CardContent>
				</Card>
			</div>

            <div class="max-w-md mx-auto">
                <DailyReward />
            </div>
            <div class="grid gap-4 md:grid-cols-2">
				<a href="/quest">
					<Card class="hover:bg-accent dark:hover:bg-slate-800 transition-colors">
						<CardHeader class="flex flex-row items-center gap-4">
							<ShieldCheck class="size-10 text-green-500" />
							<div>
								<CardTitle>Daily Quest</CardTitle>
								<CardDescription>Selesaikan misi harianmu.</CardDescription>
							</div>
						</CardHeader>
					</Card>
				</a>
				<a href="/dungeon">
					<Card class="hover:bg-accent dark:hover:bg-slate-800 transition-colors">
						<CardHeader class="flex flex-row items-center gap-4">
							<Swords class="size-10 text-destructive" />
							<div>
								<CardTitle>Masuk Dungeon</CardTitle>
								<CardDescription>Lawan monster dan buktikan kekuatanmu.</CardDescription>
							</div>
						</CardHeader>
					</Card>
				</a>
			</div>
		</div>
	{/if}
</main>