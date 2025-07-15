<script lang="ts">
    import '../../app.css';
    import { ModeWatcher } from 'mode-watcher';
    import { Toaster } from '$lib/components/ui/sonner';
    import ThemeToggle from '$lib/components/interactive/ThemeToggle.svelte';
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />

<div class="absolute top-4 right-4">
    <ThemeToggle />
</div>

<main>
    <slot />
</main>