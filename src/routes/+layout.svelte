<script lang="ts">
	import '../app.pcss';
	import Header from '$lib/components/layout/Header.svelte'; // <--- TAMBAHKAN INI
  </script>
  
  <div class="flex h-screen bg-background text-foreground">
	<aside class="hidden md:flex md:flex-col md:w-64 border-r">
	  <div class="p-4 border-b">
		<h1 class="text-xl font-bold">SoloFit</h1>
	  </div>
	  <nav class="flex-1 p-4 space-y-2">
		<p class="text-sm text-muted-foreground">[Navigasi Desktop]</p>
	  </nav>
	</aside>
  
	<div class="flex flex-col flex-1">
	  <Header />
  
	  <main class="flex-1 p-4 overflow-y-auto">
		<slot />
	  </main>
	  <footer class="md:hidden flex justify-around items-center p-2 border-t h-16">
		  <p class="text-sm text-muted-foreground">[Nav Bawah 1]</p>
		  <p class="text-sm text-muted-foreground">[Nav Bawah 2]</p>
		  <p class="text-sm text-muted-foreground">[Nav Bawah 3]</p>
	  </footer>
	</div>
  </div>