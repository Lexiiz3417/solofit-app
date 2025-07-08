<script lang="ts">
	// FIX: Impor userStore buat dapetin data user yang lagi login
	import { profileStore, userStore } from '$lib/firebase/auth';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '$lib/components/ui/card';
	import { doc, updateDoc, increment } from 'firebase/firestore';
	// FIX: Kita cuma butuh `db` dari sini, `auth` object didapet dari `userStore`
	import { db } from '$lib/firebase/client';
	import { KeyRound, Coins } from 'lucide-svelte';
	import { Toaster, toast } from 'svelte-sonner';

	// Biaya untuk satu dungeon key
	const DUNGEON_KEY_PRICE = 100;

	let isLoading = false;

	// Fungsi untuk membeli dungeon key
	async function buyDungeonKey() {
		// FIX: Cek user dari $userStore, bukan $auth
		if (!$userStore) {
			toast.error('Kamu harus login untuk melakukan pembelian.');
			return;
		}

		if (!$profileStore || $profileStore.gold < DUNGEON_KEY_PRICE) {
			toast.error('Gold kamu tidak cukup!');
			return;
		}

		isLoading = true;
		try {
			// FIX: Pake UID dari $userStore
			const userRef = doc(db, 'users', $userStore.uid);
			await updateDoc(userRef, {
				gold: increment(-DUNGEON_KEY_PRICE),
				dungeonKeys: increment(1)
			});
			toast.success('Pembelian berhasil!', {
				description: 'Satu Dungeon Key telah ditambahkan ke inventory kamu.'
			});
		} catch (error) {
			console.error('Error purchasing dungeon key:', error);
			toast.error('Terjadi kesalahan saat melakukan pembelian.');
		} finally {
			isLoading = false;
		}
	}
    async function buyHealthPotion() {
    const POTION_PRICE = 50;
    if (!$userStore) {
        toast.error('Kamu harus login untuk melakukan pembelian.');
        return;
    }
    if (!$profileStore || $profileStore.gold < POTION_PRICE) {
        toast.error('Gold kamu tidak cukup!');
        return;
    }

    isLoading = true;
    try {
        const userRef = doc(db, 'users', $userStore.uid);
        await updateDoc(userRef, {
            gold: increment(-POTION_PRICE),
            healthPotions: increment(1)
        });
        toast.success('Pembelian berhasil!', {
            description: 'Satu Health Potion telah ditambahkan ke inventory.'
        });
    } catch (error) {
        toast.error('Terjadi kesalahan saat melakukan pembelian.');
    } finally {
        isLoading = false;
    }
}
</script>

<div class="container mx-auto p-4 md:p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Toko Item</h1>
		{#if $profileStore}
			<div class="flex items-center gap-4 rounded-lg bg-secondary px-4 py-2">
				<div class="flex items-center gap-2">
					<Coins class="h-5 w-5 text-yellow-500" />
					<span class="font-semibold text-lg">{$profileStore.gold}</span>
				</div>
				<div class="flex items-center gap-2">
					<KeyRound class="h-5 w-5 text-primary" />
					<span class="font-semibold text-lg">{$profileStore.dungeonKeys}</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-lg font-medium">Dungeon Key</CardTitle>
				<KeyRound class="h-6 w-6 text-primary" />
			</CardHeader>
			<CardContent>
				<CardDescription>
					Buka gerbang ke dungeon tersembunyi dan hadapi monster untuk mendapatkan EXP dan item langka!
				</CardDescription>
			</CardContent>
			<CardFooter>
				<Button onclick={buyDungeonKey} disabled={isLoading} class="w-full">
					<Coins class="mr-2 h-4 w-4" />
					Beli (100 Gold)
					{#if isLoading}
						<svg class="animate-spin ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					{/if}
				</Button>
			</CardFooter>
		</Card>
        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-lg font-medium">Health Potion</CardTitle>
                <FlaskConical class="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
                <CardDescription>
                    Pulihkan 50% dari Max HP secara instan. Penting untuk petualangan panjang di dungeon!
                </CardDescription>
            </CardContent>
            <CardFooter>
                <Button onclick={buyHealthPotion} disabled={isLoading} class="w-full">
                    <Coins class="mr-2 h-4 w-4" />
                    Beli (50 Gold)
                    </Button>
            </CardFooter>
        </Card>

		</div>
</div>