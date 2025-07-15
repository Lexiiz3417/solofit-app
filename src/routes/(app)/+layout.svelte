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
    import { user, userProfile } from '$lib/stores'; // <-- Tambah userProfile
    import { goto } from '$app/navigation';
    import { getUserProfile } from '$lib/services/userService'; // <-- Impor fungsi get profile

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                $user = firebaseUser;
                // Ambil profil dari Firestore dan simpan ke store
                const profile = await getUserProfile(firebaseUser.uid);
                $userProfile = profile;
            } else {
                $user = null;
                $userProfile = null; // Kosongkan juga profil store
                // goto('/login');
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