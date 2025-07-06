<script lang="ts">
	import { notificationStore } from '$lib/stores/notificationStore';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ShieldAlert } from 'lucide-svelte';

	// Kita bind state 'open' dari dialog ke variabel lokal
	let open = $state(false);

	// Effect ini akan "nontonin" store. Kalau store minta buka, kita buka dialognya.
	$effect(() => {
		open = $notificationStore.isOpen;
	});

	// Effect ini akan "nontonin" dialognya. Kalau dialognya ditutup (oleh user),
	// kita kasih tau store untuk reset state-nya.
	$effect(() => {
		if (!open) {
			notificationStore.hide();
		}
	});
</script>

<!-- Gunakan `bind:open` untuk kontrol dua arah yang aman di Svelte 5 -->
<Dialog bind:open>
	<DialogContent class="dark:bg-slate-950 dark:border-blue-500/50 shadow-lg dark:shadow-blue-500/20">
		<DialogHeader class="text-center space-y-4">
			<!-- Bagian Ikon, ditampilkan jika ada -->
			{#if $notificationStore.icon}
				<div class="flex justify-center">
					<!-- PERBAIKAN: Logika class jadi jauh lebih simpel -->
					<!-- svelte-ignore svelte_component_deprecated -->
					<svelte:component
						this={$notificationStore.icon}
						class={`size-16 ${$notificationStore.iconColorClass ?? ''}`}
					/>
				</div>
			{/if}

			<!-- Bagian Judul -->
			<DialogTitle class="flex items-center justify-center gap-2 text-2xl">
				{#if !$notificationStore.icon}
					<ShieldAlert class="size-6 text-yellow-500" />
				{/if}
				<span>{$notificationStore.title}</span>
			</DialogTitle>

			<!-- Bagian Deskripsi -->
			<DialogDescription class="text-md !mt-2 dark:text-slate-300">
				{@html $notificationStore.description}
			</DialogDescription>

			<!-- Bagian Hadiah (Rewards) -->
			{#if $notificationStore.rewards && $notificationStore.rewards.length > 0}
				<div class="my-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-left">
					<h4 class="font-semibold mb-2 dark:text-slate-100">Hadiah Didapatkan:</h4>
					<ul class="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
						{#each $notificationStore.rewards as reward}
							<li>{reward}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</DialogHeader>
		<DialogFooter>
			<Button onclick={() => notificationStore.hide()} class="w-full">Mengerti</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
