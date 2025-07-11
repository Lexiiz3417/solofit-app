<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
</script>

<ModeWatcher />
<Toaster />
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