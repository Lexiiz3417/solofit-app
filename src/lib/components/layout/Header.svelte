<script lang="ts">
    import { Shield, Star, Zap, Coins } from 'lucide-svelte';
    import ThemeToggle from '$lib/components/interactive/ThemeToggle.svelte';
    import { userProfile } from '$lib/stores'; 
    import { remainingEp } from '$lib/stores';
</script>

<header class="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
    {#if $userProfile}
        <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Shield size={24} />
            </div>
            <div>
                <p class="text-xs text-muted-foreground">{$userProfile.title || '[No Title]'}</p>
                <h1 class="text-md font-bold leading-none">{$userProfile.nickname}</h1>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <ThemeToggle />
            <div class="hidden md:flex items-center gap-4 rounded-md border p-2">
                <div class="flex items-center gap-2" title="Level Utama">
                    <Star class="h-5 w-5 text-yellow-400" />
                    <span class="font-bold">Lv. {$userProfile.level}</span>
                </div>
                <div class="h-6 border-l"></div>
                <div class="flex items-center gap-2" title="Gold">
                    <Coins class="h-5 w-5 text-yellow-500" />
                    <span class="font-semibold">{$userProfile.gold}</span>
                </div>
                <div class="flex items-center gap-2" title="Energy Points (EP)">
                    <Zap class="h-5 w-5 text-sky-400" />
                    <span class="font-semibold">{$remainingEp}/100</span>
                </div>
            </div>
        </div>
    {:else}
        <div class="animate-pulse h-6 w-48 bg-muted rounded-md"></div>
        <div class="animate-pulse h-8 w-32 bg-muted rounded-md"></div>
    {/if}
</header>