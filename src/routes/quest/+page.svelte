<script lang="ts">
	// Untuk saat ini, fungsi ini hanya akan menampilkan pesan di console browser.
	// Di langkah berikutnya, kita akan isi dengan logika untuk update Firestore.
	function handleCompleteQuest(questName: string) {
		console.log(`Mencoba menyelesaikan quest: ${questName}`);
		alert(`Anda menyelesaikan quest: ${questName}! (EXP belum ditambahkan)`);
	}

	const dailyQuests = [
		{ id: 'pushup', name: 'Push-up', target: '100x', exp: 10 },
		{ id: 'situp', name: 'Sit-up', target: '100x', exp: 10 },
		{ id: 'squat', name: 'Squat', target: '100x', exp: 10 },
		{ id: 'run', name: 'Lari', target: '10km', exp: 40 }
	];
</script>

<main class="p-8 max-w-2xl mx-auto">
	<h1 class="text-3xl font-bold mb-6">Misi Harian</h1>

	<div class="space-y-4">
		{#each dailyQuests as quest}
			<div class="bg-white p-4 rounded-lg shadow flex items-center justify-between">
				<div>
					<h2 class="text-xl font-semibold">{quest.name}</h2>
					<p class="text-gray-600">Target: {quest.target}</p>
					<p class="text-sm text-green-600">Reward: {quest.exp} EXP</p>
				</div>
				<button
					on:click={() => handleCompleteQuest(quest.id)}
					class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
				>
					Selesaikan
				</button>
			</div>
		{/each}
	</div>

	<div class="mt-8 text-center">
		<a href="/" class="text-blue-600 hover:underline">&larr; Kembali ke Halaman Utama</a>
	</div>
</main>