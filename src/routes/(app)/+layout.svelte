<script lang="ts">
	import '../../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { user, userProfile, dailyProgress as dailyProgressStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { getUserProfile } from '$lib/services/userService';
	import { checkAndApplyDailyPenalty } from '$lib/services/penaltyService';
	import { getDailyProgress } from '$lib/services/dailyProgressService';
	import { toast } from 'svelte-sonner';

	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				user.set(firebaseUser);
				let profile = await getUserProfile(firebaseUser.uid);
				if (profile) {
					const penaltyResult = await checkAndApplyDailyPenalty(profile);
					if (penaltyResult) {
						profile = await getUserProfile(firebaseUser.uid);
						toast.error('Penalty Received!', {
							description: penaltyResult.message,
							duration: 10000
						});
					}
					userProfile.set(profile);
					// Ambil juga progres harian saat login
					const dailyProgress = await getDailyProgress(firebaseUser.uid);
					dailyProgressStore.set(dailyProgress);
				}
			} else {
				user.set(null);
				userProfile.set(null);
				dailyProgressStore.set(null);
				goto('/login');
			}
		});
		return () => unsubscribe();
	});
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />
<div class="flex h-screen bg-background text-foreground">
	<Sidebar />
	<div class="flex flex-col flex-1">
		<Header />
		<main class="flex-1 p-4 overflow-y-auto">
			<slot />
		</main>
		<BottomNav />
	</div>
</div>