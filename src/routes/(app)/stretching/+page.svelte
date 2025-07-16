<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Accordion from '$lib/components/ui/accordion';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { user } from '$lib/stores';
	import { updateDailyTaskStatus } from '$lib/services/dailyProgressService';

	export let data: PageData;
	let isLoading = false;

	async function handleFinishStretching() {
		if (!$user) {
			toast.error('Sesi tidak valid.');
			return;
		}
		isLoading = true;
		const success = await updateDailyTaskStatus($user.uid, 'stretching', true);

		if (success) {
			toast.success('Sesi peregangan selesai dicatat!');
			goto('/'); // Kembali ke Dashboard
		} else {
			toast.error('Gagal menyimpan progres. Coba lagi.');
		}
		isLoading = false;
	}
</script>

<div class="flex flex-col gap-8 max-w-4xl mx-auto">
	<div>
		<h1 class="text-3xl font-bold tracking-tighter">Sesi Peregangan</h1>
		<p class="text-muted-foreground mt-2">Ikuti setiap gerakan di bawah ini untuk menjaga fleksibilitas dan mempercepat pemulihan tubuhmu.</p>
	</div>

	{#if data.routine && data.routine.length > 0}
	<Accordion.Root class="w-full" type="single">
			{#each data.routine as move, i}
				<Accordion.Item value="item-{i}">
					<Accordion.Trigger class="text-lg font-semibold">
						{i + 1}. {move.name}
					</Accordion.Trigger>
					<Accordion.Content class="prose dark:prose-invert max-w-none text-base pl-6">
						<p>{move.description}</p>
						<p><strong>Durasi anjuran:</strong> {move.durationInSeconds} detik.</p>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>

		<div class="mt-4 flex justify-center">
			<Button size="lg" onclick={handleFinishStretching} disabled={isLoading}>
				{#if isLoading} Mencatat... {:else} Tandai Sesi Selesai {/if}
			</Button>
		</div>
	{:else}
		<p>Tidak ada data peregangan yang bisa dimuat saat ini. Coba lagi nanti.</p>
	{/if}
</div>