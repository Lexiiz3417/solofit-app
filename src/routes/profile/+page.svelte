<script lang="ts">
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import { doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';

	type StatName = 'strength' | 'agility' | 'stamina';

	async function allocateStatPoint(statName: StatName) {
		if (!$userStore) {
			toast.error('Anda harus login.');
			return;
		}

		try {
			await runTransaction(db, async (transaction) => {
				const userDocRef = doc(db, 'users', $userStore.uid);
				const userDoc = await transaction.get(userDocRef);

				if (!userDoc.exists()) {
					throw new Error('Dokumen pengguna tidak ditemukan.');
				}

				const currentPoints = userDoc.data().statPoints;

				if (currentPoints <= 0) {
					throw new Error('Poin tidak cukup.');
				}

				// Siapkan data update dasar
				let updates: { [key: string]: any } = {
					statPoints: increment(-1),
					[`stats.${statName}`]: increment(1)
				};

				// Jika yang dinaikkan adalah stamina, tambah juga maxHp
				if (statName === 'stamina') {
					updates = {
						...updates,
						maxHp: increment(10), // Setiap 1 poin stamina = +10 maxHp
						hp: increment(10) // Tambah HP saat ini juga agar konsisten
					};
				}

				transaction.update(userDocRef, updates);
			});

			toast.success(`+1 ${statName.charAt(0).toUpperCase() + statName.slice(1)}!`);
		} catch (error: any) {
			console.error('Gagal alokasi poin:', error);
			toast.error('Gagal menaikkan status', { description: error.message });
		}
	}
</script>

<main class="p-8 max-w-2xl mx-auto">
	<h1 class="text-3xl font-bold mb-6">Status Karakter</h1>

	{#if $profileStore}
		<div class="bg-white p-6 rounded-lg shadow-lg space-y-4">
			<div class="flex justify-between items-center pb-4 border-b">
				<div class="text-center">
					<p class="text-sm text-gray-500">Level</p>
					<p class="text-2xl font-bold">{$profileStore.level}</p>
				</div>
				<div class="text-center">
					<p class="text-sm text-gray-500">HP</p>
					<p class="text-lg font-mono text-red-600">
						{$profileStore.hp} / {$profileStore.maxHp}
					</p>
				</div>
				<div class="text-center">
					<p class="text-sm text-gray-500">Poin Tersedia</p>
					<p class="text-2xl font-bold text-blue-600">{$profileStore.statPoints}</p>
				</div>
			</div>

			<div class="space-y-3 pt-4">
				<h2 class="text-xl font-semibold mb-2">Atribut</h2>

				<div class="flex items-center justify-between">
					<span class="text-lg">Strength</span>
					<div class="flex items-center gap-4">
						<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.strength}</span>
						<button
							on:click={() => allocateStatPoint('strength')}
							disabled={$profileStore.statPoints <= 0}
							class="px-3 py-1 bg-green-500 text-white font-bold rounded hover:bg-green-600 disabled:bg-gray-300"
						>
							+
						</button>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-lg">Agility</span>
					<div class="flex items-center gap-4">
						<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.agility}</span>
						<button
							on:click={() => allocateStatPoint('agility')}
							disabled={$profileStore.statPoints <= 0}
							class="px-3 py-1 bg-green-500 text-white font-bold rounded hover:bg-green-600 disabled:bg-gray-300"
						>
							+
						</button>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-lg">Stamina</span>
					<div class="flex items-center gap-4">
						<span class="font-mono text-lg w-8 text-right">{$profileStore.stats.stamina}</span>
						<button
							on:click={() => allocateStatPoint('stamina')}
							disabled={$profileStore.statPoints <= 0}
							class="px-3 py-1 bg-green-500 text-white font-bold rounded hover:bg-green-600 disabled:bg-gray-300"
						>
							+
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<p>Memuat profil...</p>
	{/if}
	<div class="mt-8 text-center">
		<a href="/" class="text-blue-600 hover:underline">&larr; Kembali ke Halaman Utama</a>
	</div>
</main>