<script lang="ts">
    // 1. Import 'toast' dari svelte-sonner
    import { toast } from 'svelte-sonner';

    import { db } from '$lib/firebase/client';
    import { userStore, profileStore } from '$lib/firebase/auth';
    import { doc, updateDoc, increment } from 'firebase/firestore';

    const dailyQuests = [
        { id: 'pushup', name: 'Push-up', target: '100x', exp: 10 },
        { id: 'situp', name: 'Sit-up', target: '100x', exp: 10 },
        { id: 'squat', name: 'Squat', target: '100x', exp: 10 },
        { id: 'run', name: 'Lari', target: '10km', exp: 40 }
    ];

    async function handleCompleteQuest(expReward: number, questName: string) {
        if (!$userStore || !$profileStore) {
            // 2. Ganti alert error dengan toast.error
            toast.error('Anda harus login untuk menyelesaikan quest.');
            return;
        }

        try {
            const userDocRef = doc(db, 'users', $userStore.uid);
            await updateDoc(userDocRef, {
                exp: increment(expReward)
            });

            // 3. Ganti alert sukses dengan toast.success
            toast.success(`${questName} Selesai!`, {
                description: `Kamu mendapatkan ${expReward} EXP.`
            });

            const currentExp = $profileStore.exp + expReward;
            const requiredExp = $profileStore.requiredExp;

            if (currentExp >= requiredExp) {
                const newLevel = $profileStore.level + 1;
                const newRequiredExp = Math.floor(requiredExp * 1.5);
                const remainingExp = currentExp - requiredExp;

                await updateDoc(userDocRef, {
                    level: newLevel,
                        exp: remainingExp,
                        requiredExp: newRequiredExp,
                        statPoints: increment(5) // <-- TAMBAHKAN BARIS INI (memberi 5 poin per level)
                    });

                // 4. Ganti alert level up dengan toast yang lebih spesial
                toast.success(`SELAMAT! ANDA NAIK KE LEVEL ${newLevel}!`, {
                    description: 'Kerja bagus, teruslah berlatih!',
                    duration: 5000 // Tampilkan selama 5 detik
                });
            }

        } catch (error: any) {
            console.error("Error menyelesaikan quest: ", error);
            toast.error("Gagal menyelesaikan quest", {
                description: error.message
            });
        }
    }
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
                on:click={() => handleCompleteQuest(quest.exp, quest.name)}
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