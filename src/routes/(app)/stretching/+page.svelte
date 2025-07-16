<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { user } from '$lib/stores';
	import { updateDailyTaskStatus } from '$lib/services/dailyProgressService';

	let isLoading = false;

	async function handleFinishStretching() {
		if (!$user) {
			toast.error('Sesi tidak valid.');
			return;
		}
		isLoading = true;
		const success = await updateDailyTaskStatus($user.uid, 'stretching', true);
		
		if (success) {
			toast.success('Sesi peregangan selesai!');
			goto('/');
		} else {
			toast.error('Gagal menyimpan progres. Coba lagi.');
		}
		isLoading = false;
	}
</script>

<div class="flex flex-col items-center justify-center text-center gap-4 h-full">
	<h1 class="text-3xl font-bold">Sesi Peregangan</h1>
	<p class="text-muted-foreground max-w-md">
		Lakukan sesi peregangan seluruh tubuh selama 5-10 menit untuk menjaga fleksibilitas dan mempercepat
		pemulihan.
	</p>
	<div class="mt-4">
		<Button size="lg" onclick={handleFinishStretching} disabled={isLoading}>
			{#if isLoading} Mencatat... {:else} Tandai Selesai {/if}
		</Button>
	</div>
</div>