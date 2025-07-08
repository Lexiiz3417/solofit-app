<script lang="ts">
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import { doc, updateDoc, increment, serverTimestamp, type Timestamp } from 'firebase/firestore';
	import { Button } from '$lib/components/ui/button';
	import { Gift } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let isLoading = $state(false);

	// Fungsi helper buat ngecek apakah dua tanggal ada di hari yang sama
	function isSameDay(ts1: Timestamp, ts2: Date): boolean {
		const date1 = ts1.toDate();
		return (
			date1.getFullYear() === ts2.getFullYear() &&
			date1.getMonth() === ts2.getMonth() &&
			date1.getDate() === ts2.getDate()
		);
	}

	// State turunan (derived state) untuk menentukan kelayakan
	const isEligible = $derived.by(() => {
		if (!$profileStore) return false;

		const lastAwarded = $profileStore.dailyKeyAwardedOn;
		if (!lastAwarded) {
			// Kalau belum pernah dapet, berarti layak
			return true;
		}

		// Layak kalo tanggal terakhir dapet BUKAN hari ini
		return !isSameDay(lastAwarded, new Date());
	});

	async function claimReward() {
		if (!$userStore) {
			toast.error('Kamu harus login untuk klaim hadiah.');
			return;
		}

		isLoading = true;
		try {
			const userRef = doc(db, 'users', $userStore.uid);
			await updateDoc(userRef, {
				dungeonKeys: increment(1),
				dailyKeyAwardedOn: serverTimestamp()
			});
			toast.success('Hadiah Harian Diklaim!', {
				description: '+1 Dungeon Key telah ditambahkan ke inventory.'
			});
		} catch (error) {
			console.error('Error claiming daily reward:', error);
			toast.error('Gagal mengklaim hadiah harian.');
		} finally {
			isLoading = false;
		}
	}
</script>

{#if $profileStore}
	<div class="mt-4">
		{#if isEligible}
			<Button onclick={claimReward} disabled={isLoading} class="w-full animate-pulse-slow bg-green-600 hover:bg-green-700">
				<Gift class="mr-2 h-4 w-4" />
				Klaim Kunci Dungeon Harian!
				{#if isLoading}
						<svg class="animate-spin ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
				{/if}
			</Button>
		{:else}
			<p class="text-center text-sm text-muted-foreground p-2 rounded-md bg-muted">
				Hadiah harian sudah diklaim. Coba lagi besok!
			</p>
		{/if}
	</div>
{/if}