<script lang="ts">
	// 1. Import hal-hal baru yang kita butuhkan
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Import-import lama
	import { Toaster } from 'svelte-sonner';
	import { userStore, profileStore } from '$lib/firebase/auth'; // pastikan profileStore di-import
	import Button from '$lib/components/ui/button/button.svelte';
	import '../app.css';

	// Props Svelte 5, biarkan saja
	let { children } = $props();

	// 2. Gunakan $effect untuk menjalankan kode saat store berubah
	$effect(() => {
		// Kita hanya peduli jika user sudah login DAN data profilnya sudah termuat
		if ($userStore && $profileStore) {
			const isSetupComplete = $profileStore.isSetupComplete;
			const isOnSetupPage = $page.route.id === '/welcome/setup';

			// 3. Logika Gatekeeper
			// Jika setup belum selesai DAN pengguna TIDAK sedang di halaman setup
			if (isSetupComplete === false && !isOnSetupPage) {
				// Paksa pengguna pindah ke halaman setup
				goto('/welcome/setup', { replaceState: true });
			}
		}
	});
</script>

<Toaster richColors />

<header class="p-4 bg-white border-b shadow-sm sticky top-0 z-10">
	<nav class="container mx-auto flex justify-between items-center">
		<a href="/" class="text-2xl font-bold text-gray-800">
			Solo<span class="text-blue-600">Fit</span>
		</a>

		<div class="flex items-center gap-2">
			{#if $userStore}
				<a href="/quest">
					<Button variant="ghost">Daily Quest</Button>
				</a>
				<a href="/profile">
					<Button variant="ghost">Profile</Button>
				</a>
			{/if}
		</div>
	</nav>
</header>
<main>
	{@render children()}
</main>