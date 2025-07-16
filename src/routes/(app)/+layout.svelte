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
	import { user, userProfile } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { getUserProfile } from '$lib/services/userService';

	onMount(() => {
		// Listener ini akan selalu memantau status login
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				// Jika ada pengguna, isi store kita
				const profile = await getUserProfile(firebaseUser.uid);
				user.set(firebaseUser);
				userProfile.set(profile);
			} else {
				// Jika tidak ada, kosongkan store dan tendang ke halaman login
				user.set(null);
				userProfile.set(null);
				goto('/login');
			}
		});

		// Membersihkan listener saat komponen tidak lagi digunakan
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