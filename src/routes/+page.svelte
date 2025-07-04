<script lang="ts">
	import { toast } from 'svelte-sonner'; // <-- IMPORT
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { auth } from '$lib/firebase/client';
	import { signOut } from 'firebase/auth';

	async function handleLogout() {
		try {
			await signOut(auth);
			toast.success('Anda telah berhasil logout.'); // <-- TAMBAHKAN NOTIFIKASI
		} catch (error: any) {
			toast.error('Gagal logout', { description: error.message });
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen">
	<div class="text-center p-4 bg-white rounded-lg shadow-xl">
		<h1 class="text-4xl font-bold mb-4">Solo Leveling Fitness</h1>
		<p class="text-xl mb-8 text-gray-600">Naikkan levelmu di dunia nyata.</p>

		{#if $userStore === undefined}
			<p class="text-lg">Loading...</p>
		{:else if $userStore === null}
			<div>
				<p class="mb-4">Silakan login atau registrasi untuk memulai.</p>
				<div class="flex justify-center gap-4">
					<a href="/login" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</a>
					<a href="/register" class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Register</a>
				</div>
			</div>
		{:else}
			<div>
				<p class="mb-4">
					Selamat datang kembali, <strong>{$userStore.email}</strong>!
				</p>

				{#if $profileStore}
					<div class="my-6 p-4 border rounded-md">
						<h2 class="text-2xl font-semibold">Character Status</h2>
						<p class="text-lg">Level: <span class="font-mono font-bold">{$profileStore.level}</span></p>
						<p class="text-lg">
							EXP: <span class="font-mono font-bold">{$profileStore.exp} / {$profileStore.requiredExp}</span>
						</p>
					</div>
				{:else}
					<p>Memuat data karakter...</p>
				{/if}

				<button on:click={handleLogout} class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
					Logout
				</button>
			</div>
		{/if}
	</div>
</main>