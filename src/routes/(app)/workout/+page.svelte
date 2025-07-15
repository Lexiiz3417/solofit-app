<script lang="ts">
	// --- IMPORTS ---
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	// FIX: Hapus impor 'MasteryStat' karena sudah tidak diekspor
	import { processWorkoutResult, type WorkoutExercise, type WorkoutResult } from '$lib/game/progression';
	import { saveWorkoutResult, getUserProfile } from '$lib/services/userService';
	import { user, userProfile } from '$lib/stores';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { CircleCheck, Award } from 'lucide-svelte';

	// FIX: Definisikan tipe untuk mock data kita secara lokal agar cocok
	interface MockExercise {
		id: string;
		name: string;
		sets: number;
		reps: number;
		epPerRep: number;
		masteryStat: 'STR' | 'END' | 'AGI'; 
		masteryExpPerRep: number;
		completedSets: (number | string)[];
	}

	// Terapkan tipe tersebut ke workoutPlan
	const workoutPlan: MockExercise[] = [
		{ id: 'ex1', name: 'Push-up', sets: 3, reps: 10, epPerRep: 1, masteryStat: 'STR', masteryExpPerRep: 1, completedSets: Array(3).fill('') },
		{ id: 'ex2', name: 'Bodyweight Squat', sets: 3, reps: 15, epPerRep: 0.8, masteryStat: 'END', masteryExpPerRep: 1, completedSets: Array(3).fill('') },
		{ id: 'ex3', name: 'Plank', sets: 3, reps: 30, epPerRep: 0.5, masteryStat: 'END', masteryExpPerRep: 0.5, completedSets: Array(3).fill('') }
	];

	// --- STATE MANAGEMENT ---
	let isLoading = false;
	let showRewardModal = false;
	let showLevelUpModal = false;
	let summary: WorkoutResult | null = null;

	async function finishWorkout() {
		if (!$user || !$userProfile) {
			toast.error('Sesi atau profil tidak valid. Silakan login ulang.');
			return;
		}
		isLoading = true;

		// Tipe data di sini sekarang aman karena workoutPlan sudah memiliki tipe yang benar
		const workoutData: WorkoutExercise[] = workoutPlan.map((ex) => ({
			id: ex.id,
			repsCompleted: ex.completedSets.reduce((acc, current) => acc + (Number(current) || 0), 0),
			epPerRep: ex.epPerRep,
			masteryStat: ex.masteryStat,
			masteryExpPerRep: ex.masteryExpPerRep
		}));

		const result = processWorkoutResult($userProfile, workoutData);
		summary = result;
		
        // Logika pengecekan tetap sama
		if (result.expGained > 0 || result.totalEpUsed >= 80) {
			const saveSuccess = await saveWorkoutResult($user.uid, result);
			if (saveSuccess) {
				showRewardModal = true;
			} else {
				toast.error('Gagal menyimpan progres ke server.');
			}
		} else {
			toast.error('Quest Gagal', {
				description: `Target minimal 80 EP tidak tercapai. EP yang kamu gunakan baru ${Math.round(
					result.totalEpUsed
				)}.`
			});
		}
		isLoading = false;
	}

	function handleRewardModalClose() {
		showRewardModal = false;
		if (summary?.leveledUp) {
			showLevelUpModal = true;
		} else {
			refreshProfileAndGoHome();
		}
	}

	async function refreshProfileAndGoHome() {
		if ($user) {
			const updatedProfile = await getUserProfile($user.uid);
			$userProfile = updatedProfile;
		}
		goto('/dashboard');
	}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-2xl font-bold">Workout of the Day</h1>
		<p class="text-muted-foreground">Selesaikan latihan untuk mendapatkan EP dan EXP.</p>
	</div>

	<div class="space-y-4">
		{#each workoutPlan as exercise, i (exercise.id)}
			<Card.Root>
				<Card.Header>
					<Card.Title>{exercise.name}</Card.Title>
					<Card.Description>Target: {exercise.sets} set x {exercise.reps} repetisi</Card.Description>
				</Card.Header>
				<Card.Content class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each { length: exercise.sets } as _, setIndex}
						<div class="grid gap-1.5">
							<Label for="ex-{i}-set-{setIndex}">Set {setIndex + 1}</Label>
							<Input
								bind:value={exercise.completedSets[setIndex]}
								type="number"
								id="ex-{i}-set-{setIndex}"
								placeholder="Reps"
							/>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="flex justify-end">
		<Button onclick={finishWorkout} size="lg" disabled={isLoading}>
			{#if isLoading}
				<svg
					class="animate-spin -ml-1 mr-3 h-5 w-5"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				Processing...
			{:else}
				Selesaikan Latihan
			{/if}
		</Button>
	</div>
</div>

<AlertDialog.Root bind:open={showRewardModal}>
	<AlertDialog.Content>
		<AlertDialog.Header class="items-center text-center">
			<CircleCheck class="w-16 h-16 text-green-500 mb-2" />
			<AlertDialog.Title class="text-2xl">Workout Complete!</AlertDialog.Title>
			<AlertDialog.Description>
				Kerja bagus, Hunter! Kamu telah menyelesaikan misimu hari ini.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<div class="my-4 space-y-2 border-t border-b py-4">
			<p class="flex justify-between">
				<span>Total EP digunakan:</span>
				<span class="font-bold">{summary?.totalEpUsed}</span>
			</p>
			<p class="flex justify-between">
				<span>💰 Quest Points:</span>
				<span class="font-bold text-blue-500">+{summary?.questPointsGained}</span>
			</p>
			<hr class="border-dashed" />
			<p class="flex justify-between">
				<span>✨ EXP Reward:</span>
				<span class="font-bold text-green-500">+{summary?.expGained}</span>
			</p>
			<p class="flex justify-between">
				<span>💰 Gold Reward:</span>
				<span class="font-bold text-yellow-500">+{summary?.goldGained}</span>
			</p>
			{#if summary && summary.keysGained > 0}
				<p class="flex justify-between">
					<span>🔑 Dungeon Key:</span>
					<span class="font-bold text-sky-500">+{summary.keysGained}</span>
				</p>
			{/if}
			{#if summary && summary.masteryExpGained && Object.values(summary.masteryExpGained).some(v => v > 0)}
				<hr class="border-dashed" />
				<p class="text-sm font-bold text-muted-foreground pt-2">Mastery EXP Gained:</p>
				<div class="pl-2">
					{#each Object.entries(summary.masteryExpGained) as [key, value]}
						{#if value > 0}
							<p class="flex justify-between text-sm">
								<span>💪 {key.replace('masteryExp_', '')}:</span>
								<span class="font-semibold text-green-500">+{value}</span>
							</p>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
		<AlertDialog.Footer>
			<Button onclick={handleRewardModalClose} class="w-full">OK</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={showLevelUpModal}>
	<AlertDialog.Content>
		<AlertDialog.Header class="items-center text-center">
			<Award class="w-16 h-16 text-yellow-400 mb-2 animate-pulse" />
			<AlertDialog.Title
				class="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
			>
				LEVEL UP!
			</AlertDialog.Title>
			<AlertDialog.Description>
				Kerja kerasmu membuahkan hasil luar biasa! Kamu menjadi lebih kuat.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<div class="my-4 space-y-2 border-t border-b py-4">
			<p class="flex justify-between text-lg">
				<span>Level Baru:</span>
				<span class="font-bold">{summary?.oldLevel} -> {summary?.newLevel}</span>
			</p>
			<hr class="border-dashed" />
			<p class="flex justify-between">
				<span>✨ Poin Stat Baru:</span>
				<span class="font-bold text-green-500">+{summary?.unallocatedStatPointsGained} Poin</span>
			</p>
			<p class="text-xs text-muted-foreground pt-2">
				Gunakan Poin Stat di halaman Profil untuk meningkatkan STR, END, atau AGI.
			</p>
		</div>
		<AlertDialog.Footer>
			<Button onclick={refreshProfileAndGoHome} class="w-full">Luar Biasa!</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>