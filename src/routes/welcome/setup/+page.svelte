<script lang="ts">
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import { doc, updateDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	let usernameInput = $state('');
	let isLoading = $state(false);

	$effect(() => {
		if ($profileStore?.username && usernameInput === '') {
			usernameInput = $profileStore.username;
		}
	});

	async function handleSaveSetup() {
		if (!usernameInput.trim()) {
			toast.warning('Username tidak boleh kosong.');
			return;
		}
		if (!$userStore) {
			toast.error('Sesi tidak valid, silakan login ulang.');
			return;
		}

		isLoading = true;

		try {
			const userDocRef = doc(db, 'users', $userStore.uid);

			await updateDoc(userDocRef, {
				username: usernameInput.trim(),
				isSetupComplete: true
			});

			toast.success('Setup berhasil! Selamat datang!');
			goto('/', { replaceState: true });
		} catch (error: any) {
			console.error('Gagal menyimpan setup:', error);
			toast.error('Gagal menyimpan setup.', { description: error.message });
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen bg-gray-100">
	<div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
		<div class="text-center">
			<h1 class="text-2xl font-bold">Selamat Datang, Hunter!</h1>
			<p class="text-gray-600">Satu langkah lagi untuk memulai petualangan Anda.</p>
		</div>

		<div class="space-y-4">
			<div>
				<label for="username" class="block text-sm font-medium text-gray-700"
					>Pilih Username Anda</label
				>
				<input
					type="text"
					id="username"
					class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
					bind:value={usernameInput}
				/>
				<p class="text-xs text-gray-500 mt-1">Ini akan menjadi nama Anda di dalam game.</p>
			</div>
		</div>

		<div>
			<button
				onclick={handleSaveSetup}
				disabled={isLoading}
				class={cn(buttonVariants({ class: 'w-full' }))}
			>
				{isLoading ? 'Menyimpan...' : 'Simpan dan Mulai Petualangan'}
			</button>
		</div>
	</div>
</main>