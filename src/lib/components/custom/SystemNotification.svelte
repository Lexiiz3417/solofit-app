<script lang="ts">
	// 1. Import store dan komponen yang dibutuhkan
	import { notificationStore } from '$lib/stores/notificationStore';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ShieldAlert } from 'lucide-svelte';

	// Fungsi untuk menangani event buka/tutup dari dialog
	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			notificationStore.hide();
		}
	}
</script>

<Dialog open={$notificationStore.isOpen} onOpenChange={handleOpenChange}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle class="flex items-center justify-center gap-2 text-2xl">
				{#if $notificationStore.icon}
					<svelte:component this={$notificationStore.icon} class="size-6" />
				{:else}
					<ShieldAlert class="size-6 text-yellow-500" />
				{/if}
				<span>{$notificationStore.title}</span>
			</DialogTitle>
			<DialogDescription class="pt-4 text-md text-center text-slate-600">
				{$notificationStore.description}
			</DialogDescription>
		</DialogHeader>

		{#if $notificationStore.rewards && $notificationStore.rewards.length > 0}
			<div class="my-4 p-4 bg-slate-100 rounded-lg">
				<h4 class="font-semibold mb-2">Hadiah Didapatkan:</h4>
				<ul class="list-disc list-inside space-y-1">
					{#each $notificationStore.rewards as reward}
						<li>{reward}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<DialogFooter>
			<Button onclick={() => notificationStore.hide()} class="w-full">Mengerti</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>