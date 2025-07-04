<script lang="ts">
	import { Toaster } from 'svelte-sonner';
	import { userStore } from '$lib/firebase/auth'; // Import userStore untuk cek status login
	import Button from '$lib/components/ui/button/button.svelte'; // Import Shadcn Button yang baru kita tambahkan
	import '../app.css';

	// Ini adalah sintaksis Svelte 5, biarkan saja
	let { children } = $props();
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