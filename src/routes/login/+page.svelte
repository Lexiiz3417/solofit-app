<script lang="ts">
	import { toast } from 'svelte-sonner'; // <-- IMPORT
	import { auth } from '$lib/firebase/client';
	import { signInWithEmailAndPassword } from 'firebase/auth';

	let email = '';
	let password = '';
	let isLoading = false;

	async function handleLogin() {
		if (!email || !password) {
			toast.warning('Email dan password tidak boleh kosong.'); // <-- GANTI ALERT
			return;
		}

		isLoading = true;

		try {
			await signInWithEmailAndPassword(auth, email, password);
			toast.success('Login Berhasil!'); // <-- GANTI ALERT
			window.location.href = '/';
		} catch (error: any) {
			console.error('Error login:', error);
			toast.error('Login Gagal', { // <-- GANTI ALERT
				description: error.message
			});
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen bg-gray-100">
	<div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
		<h1 class="text-2xl font-bold text-center">Login ke Akun Anda</h1>

		<form class="space-y-6" on:submit|preventDefault={handleLogin}>
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Alamat Email</label>
				<input
					type="email"
					id="email"
					class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
					bind:value={email}
					placeholder="email@contoh.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
				<input
					type="password"
					id="password"
					class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
					bind:value={password}
				/>
			</div>

			<div>
				<button
					type="submit"
					class="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
					disabled={isLoading}
				>
					{isLoading ? 'Memproses...' : 'Login'}
				</button>
			</div>
		</form>
	</div>
</main>