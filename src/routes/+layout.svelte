<script lang="ts">
	// Import-import lengkap kita
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { Toaster } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Home, Swords, User, ShieldCheck, Store } from 'lucide-svelte'; // <-- Tambahin ikon 'Store'
	import ThemeToggle from '$lib/components/custom/ThemeToggle.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte'; // <-- Impor onMount
	import '../app.css';

	type ToasterPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

	// --- LOGIKA ADAPTIF UNTUK TOASTER ---
	let toasterPosition = $state<ToasterPosition>('top-right'); // Default untuk desktop

	onMount(() => {
		// Dijalankan di sisi client untuk deteksi ukuran layar
		const mediaQuery = window.matchMedia('(max-width: 768px)'); // md breakpoint di Tailwind

		const updatePosition = (event: MediaQueryList | MediaQueryListEvent) => {
			// Kalo mobile (true), pake 'top-center'. Kalo desktop (false), pake 'top-right'.
			toasterPosition = event.matches ? 'top-center' : 'top-right';
		};

		updatePosition(mediaQuery); // Cek pas pertama kali render
		mediaQuery.addEventListener('change', updatePosition); // Dengerin perubahan ukuran layar

		// Cleanup listener pas komponen ancur
		return () => mediaQuery.removeEventListener('change', updatePosition);
	});
	// --- SELESAI LOGIKA ADAPTIF ---

	let { children } = $props();
	let isReady = $state(false);

	$effect(() => {
		if ($userStore === undefined) {
			isReady = false;
			return;
		}
		if ($userStore === null) {
			isReady = true;
			return;
		}
		if ($userStore && $profileStore === null) {
			isReady = false;
			return;
		}
		if ($userStore && $profileStore) {
			const isSetupComplete = $profileStore.isSetupComplete;
			const isOnSetupPage = $page.url.pathname.includes('/welcome/setup');
			if (isSetupComplete === false && !isOnSetupPage) {
				goto('/welcome/setup', { replaceState: true });
			} else {
				isReady = true;
			}
		}
	});
</script>

<Toaster richColors position={toasterPosition} />

<header
	class="hidden md:flex p-4 bg-background border-b border-border shadow-sm sticky top-0 z-10"
>
	<nav class="container mx-auto flex justify-between items-center">
		<a href="/" class="text-2xl font-bold">
			Solo<span class="text-primary">Fit</span>
		</a>
		<div class="flex items-center gap-2">
			{#if $userStore}
				<a href="/quest"><Button variant="ghost">Daily Quest</Button></a>
				<a href="/dungeon"><Button variant="ghost">Dungeon</Button></a>
				<a href="/shop"><Button variant="ghost">Shop</Button></a>
				<a href="/profile"><Button variant="ghost">Profile</Button></a>
			{/if}
			<ThemeToggle />
		</div>
	</nav>
</header>

<main class="pb-20 md:pb-0">
	{#if isReady}
		{@render children()}
	{:else}
		<div class="flex justify-center items-center pt-40">
			<p class="text-muted-foreground animate-pulse">Memuat data Hunter...</p>
		</div>
	{/if}
</main>

{#if $userStore}
	<footer
		class="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 z-10"
	>
		<nav class="flex justify-around">
			<a
				href="/"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname === '/'
					? 'text-primary'
					: 'text-muted-foreground hover:text-primary'}"
			>
				<Home class="size-6" />
				<span class="text-xs">Home</span>
			</a>
			<a
				href="/quest"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname ===
				'/quest'
					? 'text-primary'
					: 'text-muted-foreground hover:text-primary'}"
			>
				<ShieldCheck class="size-6" />
				<span class="text-xs">Quest</span>
			</a>
            <a
				href="/shop"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname ===
				'/shop'
					? 'text-primary'
					: 'text-muted-foreground hover:text-primary'}"
			>
				<Store class="size-6" />
				<span class="text-xs">Shop</span>
			</a>
			<a
				href="/dungeon"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname ===
				'/dungeon'
					? 'text-primary'
					: 'text-muted-foreground hover:text-primary'}"
			>
				<Swords class="size-6" />
				<span class="text-xs">Dungeon</span>
			</a>
			<a
				href="/profile"
				class="flex flex-col items-center transition-colors w-16 {$page.url.pathname ===
				'/profile'
					? 'text-primary'
					: 'text-muted-foreground hover:text-primary'}"
			>
				<User class="size-6" />
				<span class="text-xs">Profile</span>
			</a>
		</nav>
	</footer>
{/if}