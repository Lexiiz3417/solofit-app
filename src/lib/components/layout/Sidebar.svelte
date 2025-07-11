<script lang="ts">
	import { page } from '$app/stores';
	import { LayoutDashboard, Swords, Library, Store, User, PanelLeftClose, PanelRightClose } from 'lucide-svelte';
	import { isSidebarOpen } from '$lib/stores';
	import { Button } from '$lib/components/ui/button';

	function toggleSidebar() {
		isSidebarOpen.update((currentValue) => !currentValue);
	}
</script>

<aside
	class="hidden md:flex md:flex-col border-r transition-all duration-300"
	class:w-64={$isSidebarOpen}
	class:w-20={!$isSidebarOpen}
>
	<div class="flex items-center p-4 border-b h-16">
		<a href="/" class="text-xl font-bold" class:opacity-0={!$isSidebarOpen} class:w-0={!$isSidebarOpen} class:transition-opacity={!$isSidebarOpen} >SoloFit</a>
	</div>

	<nav class="flex-1 p-2 space-y-1">
		<a
			href="/"
			class="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
			class:bg-muted={$page.url.pathname === '/'}
			class:text-primary={$page.url.pathname === '/'}
            class:justify-center={!$isSidebarOpen}
		>
			<LayoutDashboard class="h-5 w-5" />
			<span class:hidden={!$isSidebarOpen} class="transition-opacity">Dashboard</span>
		</a>
		<a
			href="/dungeon"
			class="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
			class:bg-muted={$page.url.pathname === '/dungeon'}
			class:text-primary={$page.url.pathname === '/dungeon'}
            class:justify-center={!$isSidebarOpen}
		>
			<Swords class="h-5 w-5" />
			<span class:hidden={!$isSidebarOpen}>Dungeon</span>
		</a>
		<a
			href="/library"
			class="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
			class:bg-muted={$page.url.pathname.startsWith('/library')}
			class:text-primary={$page.url.pathname.startsWith('/library')}
            class:justify-center={!$isSidebarOpen}
		>
			<Library class="h-5 w-5" />
			<span class:hidden={!$isSidebarOpen}>Library</span>
		</a>
		<a
			href="/shop"
			class="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
			class:bg-muted={$page.url.pathname === '/shop'}
			class:text-primary={$page.url.pathname === '/shop'}
            class:justify-center={!$isSidebarOpen}
		>
			<Store class="h-5 w-5" />
			<span class:hidden={!$isSidebarOpen}>Shop</span>
		</a>
		<a
			href="/profile"
			class="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
			class:bg-muted={$page.url.pathname === '/profile'}
			class:text-primary={$page.url.pathname === '/profile'}
            class:justify-center={!$isSidebarOpen}
		>
			<User class="h-5 w-5" />
			<span class:hidden={!$isSidebarOpen}>Profile</span>
		</a>
	</nav>

    <div class="mt-auto p-4 border-t">
        <Button onclick={toggleSidebar} variant="outline" class="w-full {$isSidebarOpen ? 'justify-start' : 'justify-center'}">
            {#if $isSidebarOpen}
                <PanelLeftClose class="h-5 w-5 mr-2"/>
                <span>Collapse</span>
            {:else}
                <PanelRightClose class="h-5 w-5"/>
            {/if}
        </Button>
    </div>
</aside>