<script lang="ts">
	// --- IMPORTS ---
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { user, userProfile, currentDayType, dailyQuestCompleted } from '$lib/stores';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { getDailyProgress, completeRestDayQuest } from '$lib/services/dailyProgressService';
	import { getWorkoutPlan } from '$lib/services/exerciseService';
	import { CheckCircle2 } from 'lucide-svelte';

	// --- STATE MANAGEMENT ---
	let isPageLoading = true;
	let stretchingDone = false;
	let readingDone = false;
	let isSubmittingRestQuest = false;
	let totalEpUsed = 0;

	// --- REACTIVE STATEMENTS ---
	$: remainingEp = 100 - totalEpUsed;

	// --- LOGIC ---
	$: if ($user && isPageLoading) {
		loadDailyData($user.uid);
	}

	async function loadDailyData(uid: string) {
		isPageLoading = true;
		try {
			const [progressData, planData] = await Promise.all([
				getDailyProgress(uid),
				getWorkoutPlan()
			]);

			dailyQuestCompleted.set(progressData.questCompleted);

			totalEpUsed = Object.entries(progressData.progress).reduce((acc, [exerciseId, reps]) => {
				const exercise = planData.find((ex) => ex.id === exerciseId);
				return acc + reps * (exercise?.epCostPerUnit || 0);
			}, 0);

			stretchingDone = progressData.tasksCompleted?.stretching || false;
			readingDone = progressData.tasksCompleted?.reading || false;
		} catch (error: any) {
			toast.error('Gagal memuat data misi harian.', { description: error.message });
		} finally {
			isPageLoading = false;
		}
	}

	async function handleFinishRestDay() {
		if (!$user) return;
		isSubmittingRestQuest = true;
		const success = await completeRestDayQuest($user.uid);
		if (success) {
			toast.success('Quest Istirahat Selesai!');
			dailyQuestCompleted.set(true);
			if ($userProfile) $userProfile.streak += 1;
		} else {
			toast.error('Gagal menyelesaikan quest.');
		}
		isSubmittingRestQuest = false;
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold">Today's Mission</h1>
		{#if $userProfile}
			<div class="flex items-center gap-2 text-lg">
				<span class="text-orange-400">🔥</span>
				<span class="font-bold">{$userProfile.streak} Day Streak</span>
			</div>
		{/if}
	</div>

	{#if $dailyQuestCompleted}
		<Card.Root class="text-center p-8">
			<Card.Content class="flex flex-col items-center gap-4">
				<CheckCircle2 class="w-16 h-16 text-green-500" />
				<h2 class="text-xl font-semibold">Misi Harian Telah Selesai!</h2>
				<p class="text-muted-foreground">
					Kerja bagus, Hunter. Kembali lagi besok untuk tantangan berikutnya!
				</p>
			</Card.Content>
		</Card.Root>
	{:else if isPageLoading}
		<p>Memuat misi harian...</p>
	{:else if $currentDayType === 'workout'}
		<Card.Root>
			<Card.Header>
				<Card.Title>Workout Day Quest</Card.Title>
				<Card.Description>
					Gunakan minimal <strong>80 EP</strong> untuk menyelesaikan quest hari ini.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div>
					<div class="flex justify-between mb-1">
						<span class="text-sm font-medium text-primary">Sisa Energy Points (EP)</span>
						<span class="text-sm font-medium">{remainingEp.toFixed(0)} / 100</span>
					</div>
					<Progress value={totalEpUsed} />
				</div>
			</Card.Content>
			<Card.Footer>
				<a href="/workout" class="w-full">
					<Button class="w-full">Mulai Latihan</Button>
				</a>
			</Card.Footer>
		</Card.Root>
	{:else if $currentDayType === 'rest'}
		<Card.Root>
			<Card.Header>
				<Card.Title>Active Rest Day Quest</Card.Title>
				<Card.Description>
					Jaga *streak*-mu dengan menyelesaikan 2 tugas ringan di bawah ini.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex items-center space-x-3">
					<Checkbox id="stretch" checked={stretchingDone} disabled />
					<a href="/stretching" class="flex-1">
						<Label for="stretch" class="text-base hover:underline cursor-pointer">Selesaikan 1 Sesi Peregangan</Label>
					</a>
				</div>
				<div class="flex items-center space-x-3">
					<Checkbox id="read" checked={readingDone} disabled />
					<a href="/library" class="flex-1">
						<Label for="read" class="text-base hover:underline cursor-pointer">Selesaikan 1 Reading Quest</Label>
					</a>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button 
					onclick={handleFinishRestDay} 
					class="w-full" 
					disabled={!stretchingDone || !readingDone || isSubmittingRestQuest}
				>
					{#if isSubmittingRestQuest} Processing... {:else} Selesaikan Quest Istirahat {/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>

<div class="absolute bottom-20 right-4 flex gap-2 md:bottom-4">
	<Button size="sm" variant="outline" onclick={() => ($currentDayType = 'workout')}>
		Set Workout Day
	</Button>
	<Button size="sm" variant="outline" onclick={() => ($currentDayType = 'rest')}>
		Set Rest Day
	</Button>
</div>