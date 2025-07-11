<script lang="ts">
	import { Shield, Star, Zap, Coins } from 'lucide-svelte';
	import ThemeToggle from '$lib/components/interactive/ThemeToggle.svelte';
</script>

<header class="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
	<div class="flex items-center gap-3">
		<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
			<Shield size={24} />
		</div>
		<div>
			<p class="text-xs text-muted-foreground">[The Ironclad]</p>
			<h1 class="text-md font-bold leading-none">Yat The Hunter</h1>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<ThemeToggle />

		<div class="hidden md:flex items-center gap-4 rounded-md border p-2">
			<div class="flex items-center gap-2" title="Level Utama">
				<Star class="h-5 w-5 text-yellow-400" />
				<span class="font-bold">Lv. 1</span>
			</div>
			<div class="h-6 border-l"></div>
			<div class="flex items-center gap-2" title="Gold">
				<Coins class="h-5 w-5 text-yellow-500" />
				<span class="font-semibold">500</span>
			</div>
			<div class="flex items-center gap-2" title="Energy Points (EP)">
				<Zap class="h-5 w-5 text-sky-400" />
				<span class="font-semibold">80/100</span>
			</div>
		</div>
	</div>
</header>