<script lang="ts">
	// --- IMPORTS ---
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { user, userProfile, currentDayType, dailyQuestCompleted, remainingEp as remainingEpStore } from '$lib/stores';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { getDailyProgress, completeRestDayQuest } from '$lib/services/dailyProgressService';
	import { getWorkoutPlan, type Exercise } from '$lib/services/exerciseService';
	import { CheckCircle2 } from 'lucide-svelte';

	// --- STATE MANAGEMENT ---
	let isPageLoading = true;
	let isSubmittingRestQuest = false;

	// --- REACTIVE STATEMENTS ---
	let totalEpUsed = 0;
	let remainingEp = 100;
	let stretchingDone = false;
	let readingDone = false;

	// --- LOGIC ---
	async function loadDailyData(uid: string) {
		isPageLoading = true;
		try {
			const [progressData, planData] = await Promise.all([
				getDailyProgress(uid),
				getWorkoutPlan()
			]);

			// Update store global berdasarkan data dari DB
			$dailyQuestCompleted = progressData.questCompleted;

			// Hitung EP yang sudah digunakan
			totalEpUsed = Object.entries(progressData.progress).reduce((acc, [exerciseId, reps]) => {
				const exercise = planData.find((ex) => ex.id === exerciseId);
				return acc + (reps * (exercise?.epCostPerUnit || 0));
			}, 0);
			remainingEp = 100 - totalEpUsed;
			$remainingEpStore = remainingEp;
			
			// Update status checklist
			stretchingDone = progressData.tasksCompleted?.stretching || false;
			readingDone = progressData.tasksCompleted?.reading || false;

		} catch (error: any) {
			toast.error('Gagal memuat data misi harian.', { description: error.message });
		} finally {
			isPageLoading = false;
		}
	}

	$: if ($user && isPageLoading) {
		loadDailyData($user.uid);
	}

	async function handleFinishRestDay() {
		if (!$user) { return; }
		isSubmittingRestQuest = true;
		const success = await completeRestDayQuest($user.uid);
		if (success) {
			toast.success('Quest Istirahat Selesai!');
			$dailyQuestCompleted = true; // Langsung update UI
			if ($userProfile) $userProfile.streak += 1; // Optimistic update streak
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
	<Card.Root>
		<Card.Header class="text-center">
			<div class="flex justify-center mb-4">
				<CheckCircle2 class="w-16 h-16 text-green-500" />
			</div>
			<Card.Title class="text-xl font-semibold">Misi Harian Telah Selesai!</Card.Title>
			<Card.Description>
				Kerja bagus, Hunter. Kamu telah menyelesaikan tugasmu hari ini.
			</Card.Description>
		</Card.Header>
		{#if remainingEp > 0}
			<Card.Content class="pt-4">
				<div class="border-t pt-4 text-center space-y-2">
					<p class="text-sm font-bold text-primary">BONUS ROUND!</p>
					<p class="text-xs text-muted-foreground">
						Kamu masih punya <span class="font-bold">{remainingEp.toFixed(0)} EP</span>. Gunakan untuk mendapatkan Quest Points!
					</p>
				</div>
			</Card.Content>
			<Card.Footer>
				<a href="/workout" class="w-full">
					<Button class="w-full" variant="outline">Latihan Tambahan</Button>
				</a>
			</Card.Footer>
		{/if}
	</Card.Root>
{:else if isPageLoading}{/if}
</div>

<div class="absolute bottom-20 right-4 flex gap-2 md:bottom-4">
	<Button size="sm" variant="outline" onclick={() => ($currentDayType = 'workout')}>
		Set Workout Day
	</Button>
	<Button size="sm" variant="outline" onclick={() => ($currentDayType = 'rest')}>
		Set Rest Day
	</Button>
</div>