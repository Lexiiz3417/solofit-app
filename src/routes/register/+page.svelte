<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { auth, db } from '$lib/firebase/client';
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import type { InitialUserData } from '$lib/types';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state(''); // <-- TAMBAHAN: State untuk konfirmasi password
	let isLoading = $state(false);

	async function handleRegister(event: SubmitEvent) {
		event.preventDefault();
		if (!email || !password || !confirmPassword) {
			toast.warning('Semua field harus diisi.');
			return;
		}
        
        // --- PERBAIKAN: Validasi password ---
		if (password !== confirmPassword) {
			toast.error('Password dan konfirmasi password tidak cocok!');
			return;
		}
        // ------------------------------------

		isLoading = true;
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// Data awal user, username diambil dari email untuk sementara
			const initialData: InitialUserData = {
				email: user.email!,
				username: user.email!.split('@')[0], // Username sementara
				isSetupComplete: false,
				level: 1,
				exp: 0,
				requiredExp: 100,
				statPoints: 5,
				stats: {
					strength: 5,
					agility: 5,
					stamina: 5,
					intelligence: 5
				},
				hp: 100,
				maxHp: 100,
				mastery: {
					strength: { level: 1, exp: 0, requiredExp: 100 },
					stamina: { level: 1, exp: 0, requiredExp: 100 },
					agility: { level: 1, exp: 0, requiredExp: 100 },
					intelligence: { level: 1, exp: 0, requiredExp: 100 }
				},
				goal: 'build_muscle',
				fitnessLevel: 'beginner',
				commitmentDays: 3,
				createdAt: serverTimestamp(),
				gold: 100,
				dungeonKeys: 3,
				healthPotions: 0
			};

			const userDocRef = doc(db, 'users', user.uid);
			await setDoc(userDocRef, initialData);

			toast.success('Registrasi Berhasil!', {
				description: 'Karakter Anda telah dibuat. Mengarahkan ke halaman setup...'
			});

			goto('/', { replaceState: true }); // Arahkan ke /setup atau / setelah login
		} catch (error: any) {
			console.error('Error registrasi:', error.code);
			let friendlyMessage = 'Terjadi kesalahan, coba lagi ya.';
			if (error.code === 'auth/email-already-in-use') {
				friendlyMessage = 'Duh, email ini udah dipake Hunter lain.';
			} else if (error.code === 'auth/weak-password') {
				friendlyMessage = 'Password-nya kurang kuat nih, minimal 6 karakter.';
			}
			toast.error('Registrasi Gagal', { description: friendlyMessage });
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen p-4 bg-background">
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
				<div class="space-y-1">
					<Label for="confirm-password">Konfirmasi Password</Label>
					<Input type="password" id="confirm-password" bind:value={confirmPassword} />
				</div>
				<div class="pt-2">
					<Button type="submit" class="w-full" disabled={isLoading}>
						{isLoading ? 'Memproses...' : 'Daftar Sekarang'}
					</Button>
				</div>
			</form>
			<p class="mt-4 text-center text-sm text-muted-foreground">
				Sudah punya akun? <a href="/login" class="text-primary hover:underline">Login di sini</a>
			</p>
		</CardContent>
	</Card>
</main>