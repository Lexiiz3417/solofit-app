<script lang="ts">
	// Import-import lama
	import { Toaster } from 'svelte-sonner';
	import { userStore, profileStore } from '$lib/firebase/auth';
	import '../app.css';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Home, Swords, User, ShieldCheck } from 'lucide-svelte';

	// Import baru untuk Gatekeeper
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Props Svelte 5
	let { children } = $props();

	// 1. TAMBAHKAN STATE "SIAP"
	// Secara default, halaman belum siap ditampilkan
	let isReady = $state(false);

	$effect(() => {
		// Kondisi saat data masih loading (undefined adalah state awal dari store kita)
		// Kita tahan tampilan dengan membuat isReady tetap false
		if ($userStore === undefined || $profileStore === undefined) {
			isReady = false;
			return; // Hentikan eksekusi lebih lanjut sampai data ada
		}

		// Kondisi saat user sudah pasti logout (store bernilai null)
		if ($userStore === null) {
			isReady = true; // Tampilkan halaman (misalnya tombol login/register)
			return;
		}

		// Kondisi saat user login dan data profilnya ada
		if ($userStore && $profileStore) {
			const isSetupComplete = $profileStore.isSetupComplete;
			const isOnSetupPage = $page.route.id?.includes('/welcome/setup'); // Cek URL

			if (isSetupComplete === false && !isOnSetupPage) {
				// Redirect jika setup belum selesai
				goto('/welcome/setup', { replaceState: true });
				// isReady tetap false karena kita sedang redirect, tidak perlu tampilkan apa-apa
			} else {
				// Jika setup sudah selesai atau sudah di halaman setup, tampilkan halaman
				isReady = true;
			}
		}
	});
</script>

<Toaster richColors position="top-center" />

<header class="hidden md:flex p-4 bg-white border-b shadow-sm sticky top-0 z-10">
	<nav class="container mx-auto flex justify-between items-center">
		<a href="/" class="text-2xl font-bold text-gray-800">
			Solo<span class="text-blue-600">Fit</span>
		</a>
		<div class="flex items-center gap-2">
			{#if $userStore}
				<a href="/quest"><Button variant="ghost">Daily Quest</Button></a>
				<a href="/profile"><Button variant="ghost">Profile</Button></a>
				<a href="/dungeon"><Button variant="ghost">Dungeon</Button></a>
			{/if}
		</div>
	</nav>
</header>

<main class="pb-20 md:pb-0">
	{#if isReady}
		{@render children()}
	{:else}
		<div class="flex justify-center items-center pt-20">
			<p>Loading...</p>
		</div>
	{/if}
</main>

<footer class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 z-10">
	<nav class="flex justify-around">
		{#if $userStore}
			<a href="/" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
				<Home class="size-6" />
				<span class="text-xs">Home</span>
			</a>
			<a href="/quest" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
				<ShieldCheck class="size-6" />
				<span class="text-xs">Quest</span>
			</a>
			<a href="/dungeon" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
				<Swords class="size-6" />
				<span class="text-xs">Dungeon</span>
			</a>
			<a href="/profile" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
				<User class="size-6" />
				<span class="text-xs">Profile</span>
			</a>
		{:else}
			<a href="/login" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
				<User class="size-6" />
				<span class="text-xs">Login</span>
			</a>
			<a href="/register" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
				<User class="size-6" />
				<span class="text-xs">Register</span>
			</a>
		{/if}
	</nav>
</footer>