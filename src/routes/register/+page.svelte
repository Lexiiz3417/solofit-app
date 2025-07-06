<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { auth, db } from '$lib/firebase/client';
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card/index.js';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);

	async function handleRegister(event: SubmitEvent) { event.preventDefault();
		if (!email || !password) {
			toast.warning('Email dan password tidak boleh kosong.');
			return;
		}
		isLoading = true;
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;
			if (!user || !user.email) {
				throw new Error('User data or email is null after creation');
			}
			const userDocRef = doc(db, 'users', user.uid);
			await setDoc(userDocRef, {
				email: user.email,
				username: user.email.split('@')[0],
				isSetupComplete: false,
				level: 1,
				exp: 0,
				requiredExp: 100,
				statPoints: 0,
				stats: { strength: 10, agility: 10, stamina: 10 },
				hp: 100,
				maxHp: 100,
				mastery: {
					strength: { level: 0, exp: 0, requiredExp: 100 },
					stamina: { level: 0, exp: 0, requiredExp: 150 },
					agility: { level: 0, exp: 0, requiredExp: 120 }
				},
				goal: 'build_muscle', // Ini akan di-update di halaman setup
				fitnessLevel: 'beginner', // Ini juga
				commitmentDays: 3, // Ini juga
				createdAt: serverTimestamp()
			});
			toast.success('Registrasi Berhasil!', {
				description: 'Karakter Anda telah dibuat. Mengarahkan ke halaman setup...'
			});
			goto('/', { replaceState: true });
		} catch (error: any) {
			console.error('Error registrasi:', error.code);
			let friendlyMessage = 'Terjadi kesalahan, coba lagi ya.';
			if (error.code === 'auth/email-already-in-use') {
				friendlyMessage = 'Duh, email ini udah dipake Hunter lain. Coba pake email lain.';
			} else if (error.code === 'auth/weak-password') {
				friendlyMessage = 'Password-nya kurang kuat nih, coba buat minimal 6 karakter.';
			} else if (error.code === 'auth/invalid-email') {
				friendlyMessage = 'Format emailnya kayaknya salah deh, coba cek lagi.';
			}
			toast.error('Registrasi Gagal', { description: friendlyMessage });
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950">
	<Card class="w-full max-w-sm">
		<CardHeader class="text-center">
			<CardTitle class="text-2xl">Mulai Petualanganmu</CardTitle>
			<CardDescription>Buat akun untuk menjadi Hunter.</CardDescription>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleRegister} class="space-y-4">
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
						{isLoading ? 'Memproses...' : 'Daftar Sekarang'}
					</Button>
				</div>
			</form>
			<p class="mt-4 text-center text-sm">
				Sudah punya akun? <a href="/login" class="text-blue-600">Login di sini</a>
			</p>
		</CardContent>
	</Card>
</main>