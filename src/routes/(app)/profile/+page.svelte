<script lang="ts">
	import { user, userProfile } from '$lib/stores';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { PlusCircle } from 'lucide-svelte';
	import { updateUserProfile } from '$lib/services/userService';
	import { increment } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';

	// Tipe data untuk stat yang bisa dialokasikan
	type AllocatableStat = 'STR' | 'END' | 'AGI';

	let isAllocating = false; // Mencegah klik ganda

	// Fungsi untuk mengalokasikan poin
	async function handleAllocatePoint(stat: AllocatableStat) {
		if (!$user || !$userProfile || $userProfile.unallocatedStatPoints <= 0 || isAllocating) {
			return;
		}
		isAllocating = true;

		const success = await updateUserProfile($user.uid, {
			// Gunakan increment untuk operasi yang aman
			[`stats.${stat}`]: increment(1),
			unallocatedStatPoints: increment(-1)
		});

		if (success) {
			// Update store lokal untuk UI reaktif instan
			$userProfile.stats[stat] += 1;
			$userProfile.unallocatedStatPoints -= 1;
			toast.success(`+1 ${stat} berhasil ditambahkan!`);
		} else {
			toast.error(`Gagal mengalokasikan poin ke ${stat}.`);
		}
		isAllocating = false;
	}

	$: maxHp = $userProfile ? 100 + $userProfile.stats.END * 10 : 100;
</script>

<div class="flex flex-col gap-6">
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold">Hunter Profile</h1>
		{#if $userProfile && $userProfile.unallocatedStatPoints > 0}
			<div class="text-primary font-bold animate-pulse">
				{$userProfile.unallocatedStatPoints} Poin Stat Tersedia!
			</div>
		{/if}
	</div>

	{#if $userProfile}
		<div class="grid gap-6 md:grid-cols-3">
			<div class="md:col-span-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Character Statistics</Card.Title>
						<Card.Description
							>Statistik ini akan memengaruhi performamu dalam pertarungan.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						<Separator />
						<div class="grid grid-cols-3 gap-4">
							<div class="text-center">
								<p class="font-bold">STR</p>
								<div class="flex items-center justify-center gap-2">
									<p class="text-xl font-mono">{$userProfile.stats.STR}</p>
									{#if $userProfile.unallocatedStatPoints > 0}
										<Button
											onclick={() => handleAllocatePoint('STR')}
											variant="ghost"
											size="icon"
											class="h-6 w-6"
											disabled={isAllocating}
										>
											<PlusCircle class="h-5 w-5 text-green-500" />
										</Button>
									{/if}
								</div>
							</div>
							<div class="text-center">
								<p class="font-bold">END</p>
								<div class="flex items-center justify-center gap-2">
									<p class="text-xl font-mono">{$userProfile.stats.END}</p>
									{#if $userProfile.unallocatedStatPoints > 0}
										<Button
											onclick={() => handleAllocatePoint('END')}
											variant="ghost"
											size="icon"
											class="h-6 w-6"
											disabled={isAllocating}
										>
											<PlusCircle class="h-5 w-5 text-green-500" />
										</Button>
									{/if}
								</div>
							</div>
							<div class="text-center">
								<p class="font-bold">AGI</p>
								<div class="flex items-center justify-center gap-2">
									<p class="text-xl font-mono">{$userProfile.stats.AGI}</p>
									{#if $userProfile.unallocatedStatPoints > 0}
										<Button
											onclick={() => handleAllocatePoint('AGI')}
											variant="ghost"
											size="icon"
											class="h-6 w-6"
											disabled={isAllocating}
										>
											<PlusCircle class="h-5 w-5 text-green-500" />
										</Button>
									{/if}
								</div>
							</div>
							<div class="text-center"><p class="font-bold">INT</p><p class="text-xl font-mono">{$userProfile.stats.INT}</p></div>
							<div class="text-center"><p class="font-bold">LUK</p><p class="text-xl font-mono">{$userProfile.stats.LUK}</p></div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{:else}
		<p>Loading profile...</p>
	{/if}
</div>