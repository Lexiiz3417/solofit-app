<script lang="ts">
	// --- IMPORTS ---
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Progress } from '$lib/components/ui/progress';
	import { processWorkoutResult, type WorkoutResult } from '$lib/game/progression';
	import { saveWorkoutResult, getUserProfile, type UserProfile } from '$lib/services/userService';
	import { getWorkoutPlan, type Exercise } from '$lib/services/exerciseService';
	import { getDailyProgress, addWorkoutProgress } from '$lib/services/dailyProgressService';
	import { user, userProfile, dailyQuestCompleted, remainingEp as remainingEpStore } from '$lib/stores';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { CircleCheck, Award, Plus } from 'lucide-svelte';
	import { onMount } from 'svelte';

	// --- STATE MANAGEMENT ---
	let workoutLog: {
		exercise: Exercise;
		repsCompleted: number;
		repsToAdd: string;
		targetReps: number;
	}[] = [];

	let isLoading = false;
	let isAddingProgress = false;
	let isPageLoading = true;
	let showRewardModal = false;
	let showLevelUpModal = false;
	let summary: WorkoutResult | null = null;
	let totalEpUsed = 0;

	// --- REACTIVE STATEMENTS ---
	$: $remainingEpStore = 100 - totalEpUsed;

	// --- LOGIC ---
	$: if ($user && isPageLoading) {
		loadWorkoutData($user.uid);
	}

	async function loadWorkoutData(uid: string) {
		isPageLoading = true;
		try {
			const [planData, progressData] = await Promise.all([getWorkoutPlan(), getDailyProgress(uid)]);

			totalEpUsed = Object.entries(progressData.progress).reduce((acc, [exerciseId, reps]) => {
				const exercise = planData.find((ex) => ex.id === exerciseId);
				return acc + reps * (exercise?.epCostPerUnit || 0);
			}, 0);

			workoutLog = planData.map((ex) => ({
				exercise: ex,
				repsCompleted: progressData.progress[ex.id] || 0,
				repsToAdd: '',
				targetReps: 50
			}));
		} catch (error: any) {
			toast.error('Gagal memuat data latihan.', { description: error.message });
		} finally {
			isPageLoading = false;
		}
	}

	async function handleAddProgress(log: (typeof workoutLog)[0]) {
		if (!$user) return;
		const reps = parseInt(log.repsToAdd);
		if (isNaN(reps) || reps <= 0) {
			toast.error('Masukkan jumlah progres yang valid.');
			return;
		}

		const epCost = reps * log.exercise.epCostPerUnit;
		if (epCost > $remainingEpStore) {
			toast.error('EP tidak cukup!');
			return;
		}

		isAddingProgress = true;
		const success = await addWorkoutProgress($user.uid, log.exercise.id, reps);
		if (success) {
			const epSebelumDitambah = totalEpUsed;
			log.repsCompleted += reps;
			totalEpUsed += epCost;
			log.repsToAdd = '';
			toast.success(`+${reps} ${log.exercise.unit} dicatat!`);
			workoutLog = [...workoutLog];

			if (totalEpUsed >= 80 && epSebelumDitambah < 80) {
				finishAndSaveWorkout();
			}
		} else {
			toast.error('Gagal mencatat progres.');
		}
		isAddingProgress = false;
	}

	async function finishAndSaveWorkout() {
		if (!$user || !$userProfile) return;
		isLoading = true;
		const workoutData = workoutLog.map((log) => ({
			id: log.exercise.id,
			repsCompleted: log.repsCompleted,
			epPerRep: log.exercise.epCostPerUnit,
			masteryStat: log.exercise.masteryStat,
			masteryExpPerUnit: log.exercise.masteryExpPerUnit
		}));
		const result = processWorkoutResult($userProfile, workoutData);
		summary = result;
		await saveWorkoutResult($user.uid, result);
		isLoading = false; // Hentikan loading sebelum tampilkan modal
		showRewardModal = true;
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
			if (updatedProfile) {
				$userProfile = updatedProfile;
			}
		}
		$dailyQuestCompleted = true;
		goto('/');
	}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-2xl font-bold">Workout Log</h1>
		<p class="text-muted-foreground">Catat dan cicil progres latihanmu di sini.</p>
	</div>

	{#if isPageLoading}
		<p>Memuat rencana latihan...</p>
	{:else}
		<div class="space-y-6">
			{#each workoutLog as log, i (log.exercise.id)}
				<Card.Root>
					<Card.Header>
						<Card.Title>{log.exercise.name}</Card.Title>
						<Card.Description>{log.exercise.description}</Card.Description>
					</Card.Header>
					<Card.Content class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
						<div class="space-y-2">
							<p class="text-sm text-muted-foreground">
								Progres Hari Ini: <span class="font-bold text-foreground"
									>{log.repsCompleted}</span
								> / {log.targetReps}
								<span class="capitalize">{log.exercise.unit}</span>
							</p>
							<Progress value={(log.repsCompleted / log.targetReps) * 100} class="mt-2" />
						</div>
						<div class="space-y-1.5">
							<Label for={`add-reps-${i}`}>Tambah Progres</Label>
							<div class="flex items-center space-x-2">
								<Input
									bind:value={log.repsToAdd}
									type="number"
									id={`add-reps-${i}`}
									placeholder="e.g., 10"
									class="max-w-[120px]"
									disabled={isAddingProgress}
								/>
								<Button onclick={() => handleAddProgress(log)} disabled={isAddingProgress}>
									<Plus class="mr-2 h-4 w-4" /> Tambah
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
		{/if}
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
			{#if summary && summary.masteryExpGained && Object.values(summary.masteryExpGained).some((v) => v > 0)}
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