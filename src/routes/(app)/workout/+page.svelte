<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Progress } from '$lib/components/ui/progress';
	import { processWorkoutResult, type WorkoutResult } from '$lib/game/progression';
	import { saveWorkoutResult, getUserProfile, type UserProfile } from '$lib/services/userService';
	import { getWorkoutPlan, type Exercise } from '$lib/services/exerciseService';
	import { user, userProfile } from '$lib/stores';
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
	let isPageLoading = true;
	let showRewardModal = false;
	let showLevelUpModal = false;
	let summary: WorkoutResult | null = null;

	onMount(async () => {
		const plan = await getWorkoutPlan();
		// TODO: Nanti ambil dailyProgress dari backend
		const dailyProgress: { [key: string]: number } = {}; 

		workoutLog = plan.map((ex) => ({
			exercise: ex,
			repsCompleted: dailyProgress[ex.id] || 0,
			repsToAdd: '',
			targetReps: 50 // Target bohongan untuk progress bar
		}));
		isPageLoading = false;
	});

	function handleAddProgress(exerciseIndex: number) {
		const log = workoutLog[exerciseIndex];
		const reps = parseInt(log.repsToAdd);

		if (isNaN(reps) || reps <= 0) {
			toast.error('Masukkan jumlah progres yang valid.');
			return;
		}

		// TODO: Panggil fungsi `addWorkoutProgress` dari backend di sini
		log.repsCompleted += reps;
		log.repsToAdd = '';
		toast.success(`+${reps} ${log.exercise.unit} untuk ${log.exercise.name} berhasil ditambahkan!`);

		// FIX: "Colek" Svelte agar sadar ada perubahan pada array
		workoutLog = [...workoutLog];
	}

	async function finishWorkout() {
		if (!$user || !$userProfile) {
			toast.error('Sesi tidak valid.');
			return;
		}
		isLoading = true;

		const workoutData = workoutLog.map((log) => ({
			id: log.exercise.id,
			repsCompleted: log.repsCompleted,
			epPerRep: log.exercise.epCostPerUnit,
			masteryStat: log.exercise.masteryStat,
			masteryExpPerRep: log.exercise.masteryExpPerUnit
		}));

		const result = processWorkoutResult($userProfile, workoutData);
		summary = result;

		if (result.totalEpUsed >= 80) {
			const saveSuccess = await saveWorkoutResult($user.uid, result);
			if (saveSuccess) {
				showRewardModal = true;
			} else {
				toast.error('Gagal menyimpan progres ke server.');
			}
		} else {
			toast.error('Quest Gagal', {
				description: `Target minimal 80 EP tidak tercapai.`
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
			if (updatedProfile) {
				$userProfile = updatedProfile;
			}
		}
		goto('/dashboard');
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
							<div class="flex justify-between items-center">
								<p class="text-sm text-muted-foreground">
									Progres Hari Ini: <span class="font-bold text-foreground">{log.repsCompleted}</span> / {log.targetReps}
									<span class="capitalize">{log.exercise.unit}</span>
								</p>
							</div>
							<Progress value={(log.repsCompleted / log.targetReps) * 100} />
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
								/>
								<Button onclick={() => handleAddProgress(i)}>
									<Plus class="mr-2 h-4 w-4" /> Tambah
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<div class="flex justify-end mt-4">
			<Button onclick={finishWorkout} size="lg" disabled={isLoading}>
				{#if isLoading} Processing... {:else} Selesaikan & Hitung Reward {/if}
			</Button>
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