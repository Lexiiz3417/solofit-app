<script lang="ts">
	// 1. Import
	import { auth } from '$lib/firebase/client';
	// Perhatikan, fungsinya sekarang signInWithEmailAndPassword
	import { signInWithEmailAndPassword } from 'firebase/auth';

	// 2. Variabel
	let email = '';
	let password = '';
	let isLoading = false;
	let errorMessage = '';

	// 3. Fungsi Handler
	async function handleLogin() {
		if (!email || !password) {
			errorMessage = 'Email dan password tidak boleh kosong.';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			// 4. Panggil fungsi Firebase untuk login
			await signInWithEmailAndPassword(auth, email, password);
			alert('Login berhasil!');

			// Arahkan ke halaman utama setelah berhasil
			window.location.href = '/';

		} catch (error: any) {
			// 5. Tangani error
			console.error('Error login:', error);
			errorMessage = error.message;
			alert(`Error: ${error.message}`);

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

			{#if errorMessage}
				<p class="text-sm text-red-600">{errorMessage}</p>
			{/if}

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