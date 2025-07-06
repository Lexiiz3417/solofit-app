<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Sun, Moon } from 'lucide-svelte';

	let isDarkMode = $state(false);

	// Saat komponen pertama kali muncul, cek tema yang tersimpan atau tema sistem
	onMount(() => {
		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
			isDarkMode = true;
		} else {
			document.documentElement.classList.remove('dark');
			isDarkMode = false;
		}
	});

	function toggleTheme() {
		if (document.documentElement.classList.contains('dark')) {
			document.documentElement.classList.remove('dark');
			localStorage.theme = 'light';
			isDarkMode = false;
		} else {
			document.documentElement.classList.add('dark');
			localStorage.theme = 'dark';
			isDarkMode = true;
		}
	}
</script>

<Button onclick={toggleTheme} variant="ghost" size="icon">
	{#if isDarkMode}
		<Sun class="size-[1.2rem]" />
	{:else}
		<Moon class="size-[1.2rem]" />
	{/if}
</Button>