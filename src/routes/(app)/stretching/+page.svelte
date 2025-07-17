<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Accordion from '$lib/components/ui/accordion';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { user } from '$lib/stores';
	import { updateDailyTaskStatus } from '$lib/services/dailyProgressService';
	// --- Impor Baru & Perubahan ---
	import { onMount } from 'svelte';
	import { getStretchingRoutine, type StretchingMove } from '$lib/services/stretchingService';

	let isLoading = false;
	let isPageLoading = true; // State untuk loading halaman
	let routine: StretchingMove[] = []; // State untuk menampung data peregangan

	// onMount hanya berjalan di sisi client (browser)
	onMount(async () => {
		isPageLoading = true;
		try {
			// Ambil data peregangan saat komponen sudah dimuat di browser
			routine = await getStretchingRoutine();
		} catch (error) {
			toast.error('Gagal memuat data peregangan.');
			console.error(error);
		} finally {
			isPageLoading = false;
		}
	});

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
		<p class="text-muted-foreground mt-2">
			Ikuti setiap gerakan di bawah ini untuk menjaga fleksibilitas dan pemulihan tubuhmu.
		</p>
	</div>

	{#if isPageLoading}
		<p>Memuat sesi peregangan...</p>
	{:else if routine.length > 0}
		<Accordion.Root class="w-full" type="single">
			{#each routine as move, i}
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
		<p class="text-center">
			Tidak ada data peregangan yang bisa dimuat. Pastikan kamu sudah menjalankan seed script.
		</p>
	{/if}
</div>