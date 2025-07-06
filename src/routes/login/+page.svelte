<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { auth } from '$lib/firebase/client';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card/index.js';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);

	async function handleLogin(event: SubmitEvent) { event.preventDefault();
		if (!email || !password) {
			toast.warning('Email dan password tidak boleh kosong.');
			return;
		}
		isLoading = true;
		try {
			await signInWithEmailAndPassword(auth, email, password);
			toast.success('Login Berhasil!');
			goto('/', { replaceState: true });
		} catch (error: any) {
			console.error('Error login:', error.code);
			let friendlyMessage = 'Terjadi kesalahan tidak diketahui. Coba lagi nanti.';
			if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
				friendlyMessage = 'Email atau password yang kamu masukkan salah, Hunter.';
			} else if (error.code === 'auth/too-many-requests') {
				friendlyMessage = 'Terlalu banyak percobaan gagal. Coba lagi beberapa saat.';
			}
			toast.error('Login Gagal', {
				description: friendlyMessage
			});
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950">
		<Card class="w-full max-w-sm">
		<CardHeader class="text-center">
			<CardTitle class="text-2xl">Selamat Datang Kembali!</CardTitle>
			<CardDescription>Login untuk melanjutkan petualanganmu.</CardDescription>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleLogin} class="space-y-4">
				<div class="space-y-1">
					<Label for="email">Email</Label>
					<Input type="email" id="email" placeholder="email@contoh.com" bind:value={email} />
				</div>
				<div class="space-y-1">
					<Label for="password">Password</Label>
					<Input type="password" id="password" bind:value={password} />
				</div>
				<div class="pt-4">
					<Button type="submit" class="w-full" disabled={isLoading}>
						{isLoading ? 'Memproses...' : 'Login'}
					</Button>
				</div>
			</form>
			<p class="mt-4 text-center text-sm">
				Belum punya akun? <a href="/register" class="text-blue-600">Daftar di sini</a>
			</p>
		</CardContent>
	</Card>
</main>