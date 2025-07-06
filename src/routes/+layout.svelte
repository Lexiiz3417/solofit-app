<script lang="ts">
	// Import-import lengkap kita
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { Toaster } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Home, Swords, User, ShieldCheck } from 'lucide-svelte';
	import ThemeToggle from '$lib/components/custom/ThemeToggle.svelte';
	import SystemNotification from '$lib/components/custom/SystemNotification.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import '../app.css';

	let { children } = $props();

	// State untuk menahan tampilan halaman
	let isReady = $state(false);

	// --- LOGIKA GATEKEEPER BARU YANG TANGGUH ---
	$effect(() => {
		// Di Svelte 5, kita cukup pakai $userStore dan $profileStore di sini.
		// Effect ini akan otomatis jalan lagi setiap kali nilainya berubah.

		// Kondisi 1: Saat aplikasi baru dibuka, kita belum tahu status user. Tahan tampilan.
		if ($userStore === undefined) {
			isReady = false;
			return;
		}

		// Kondisi 2: Saat kita sudah tahu user tidak login. Tampilkan halaman publik.
		if ($userStore === null) {
			isReady = true;
			return;
		}

		// Kondisi 3: Saat kita tahu user login, tapi data profilnya dari Firestore masih dalam perjalanan. Tahan tampilan.
		if ($userStore && $profileStore === null) {
			isReady = false;
			return;
		}

		// Kondisi 4: Saat user dan profil sudah siap. Ini saatnya membuat keputusan.
		if ($userStore && $profileStore) {
			const isSetupComplete = $profileStore.isSetupComplete;
			const isOnSetupPage = $page.url.pathname.includes('/welcome/setup');

			// Jika setup belum selesai & dia tidak di halaman setup -> PAKSA ke setup.
			if (isSetupComplete === false && !isOnSetupPage) {
				goto('/welcome/setup', { replaceState: true });
			} else {
				// Jika setup sudah selesai atau dia memang di halaman setup -> TAMPILKAN HALAMAN.
				isReady = true;
			}
		}
	});
</script>

<!-- Toaster untuk notifikasi kecil -->
<Toaster richColors position="top-center" />

<!-- Navbar Atas (HANYA UNTUK DESKTOP) -->
<header
	class="hidden md:flex p-4 bg-white dark:bg-slate-950 border-b dark:border-slate-800 shadow-sm sticky top-0 z-10"
>
	<nav class="container mx-auto flex justify-between items-center">
		<a href="/" class="text-2xl font-bold text-gray-800 dark:text-gray-50">
			Solo<span class="text-blue-600">Fit</span>
		</a>
		<div class="flex items-center gap-2">
			{#if $userStore}
				<a href="/quest"><Button variant="ghost">Daily Quest</Button></a>
				<a href="/profile"><Button variant="ghost">Profile</Button></a>
				<a href="/dungeon"><Button variant="ghost">Dungeon</Button></a>
			{/if}
			<ThemeToggle />
		</div>
	</nav>
</header>

<!-- Konten Utama Halaman -->
<main class="pb-20 md:pb-0">
	{#if isReady}
		{@render children()}
	{:else}
		<div class="flex justify-center items-center pt-40">
			<p class="dark:text-gray-300 animate-pulse">Memuat data Hunter...</p>
		</div>
	{/if}
</main>

<!-- Navbar Bawah (HANYA UNTUK MOBILE & JIKA SUDAH LOGIN) -->
{#if $userStore}
	<footer
		class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t dark:bg-slate-950 dark:border-slate-800 p-2 z-10"
	>
		<nav class="flex justify-around">
			<a
				href="/"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname === '/'
					? 'text-blue-600 dark:text-blue-400'
					: 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'}"
			>
				<Home class="size-6" />
				<span class="text-xs">Home</span>
			</a>
			<a
				href="/quest"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname === '/quest'
					? 'text-blue-600 dark:text-blue-400'
					: 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'}"
			>
				<ShieldCheck class="size-6" />
				<span class="text-xs">Quest</span>
			</a>
			<a
				href="/dungeon"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname === '/dungeon'
					? 'text-blue-600 dark:text-blue-400'
					: 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'}"
			>
				<Swords class="size-6" />
				<span class="text-xs">Dungeon</span>
			</a>
			<a
				href="/profile"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname === '/profile'
					? 'text-blue-600 dark:text-blue-400'
					: 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'}"
			>
				<User class="size-6" />
				<span class="text-xs">Profile</span>
			</a>
		</nav>
	</footer>
{/if}

<!-- Komponen Notifikasi Global kita -->
<SystemNotification />
