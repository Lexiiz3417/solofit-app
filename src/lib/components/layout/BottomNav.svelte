<script lang="ts">
	import { page } from '$app/stores';
	import { LayoutDashboard, Swords, Library, Store, User } from 'lucide-svelte';
</script>

<footer class="md:hidden flex justify-around items-center p-2 border-t h-16 bg-background">
	<a
		href="/"
		class="flex flex-col items-center hover:text-primary"
		class:text-primary={$page.url.pathname === '/'}
		class:text-muted-foreground={$page.url.pathname !== '/'}
		title="Dashboard"
	>
		<LayoutDashboard class="h-6 w-6" />
		<span class="text-xs">Home</span>
	</a>
	<a
		href="/dungeon"
		class="flex flex-col items-center hover:text-primary"
		class:text-primary={$page.url.pathname === '/dungeon'}
		class:text-muted-foreground={$page.url.pathname !== '/dungeon'}
		title="Dungeon"
	>
		<Swords class="h-6 w-6" />
		<span class="text-xs">Dungeon</span>
	</a>
	<a
		href="/library"
		class="flex flex-col items-center hover:text-primary"
		class:text-primary={$page.url.pathname.startsWith('/library')}
		class:text-muted-foreground={!$page.url.pathname.startsWith('/library')}
		title="Library"
	>
		<Library class="h-6 w-6" />
		<span class="text-xs">Library</span>
	</a>
	<a
		href="/shop"
		class="flex flex-col items-center hover:text-primary"
		class:text-primary={$page.url.pathname === '/shop'}
		class:text-muted-foreground={$page.url.pathname !== '/shop'}
		title="Shop"
	>
		<Store class="h-6 w-6" />
		<span class="text-xs">Shop</span>
	</a>
	<a
		href="/profile"
		class="flex flex-col items-center hover:text-primary"
		class:text-primary={$page.url.pathname === '/profile'}
		class:text-muted-foreground={$page.url.pathname !== '/profile'}
		title="Profile"
	>
		<User class="h-6 w-6" />
		<span class="text-xs">Profile</span>
	</a>
</footer>