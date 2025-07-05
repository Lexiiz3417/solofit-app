<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { auth, db } from '$lib/firebase/client';
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
	import { goto } from '$app/navigation'; // <-- 1. TAMBAHKAN IMPORT INI

	let email = '';
	let password = '';
	let isLoading = false;

	async function handleRegister() {
		if (!email || !password) {
			toast.warning('Email dan password tidak boleh kosong.');
			return;
		}
		isLoading = true;
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			
			const user = userCredential.user;
			if (!user || !user.email) {
				toast.error('Gagal mendapatkan data pengguna setelah registrasi.');
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
				stats: {
					strength: 10,
					agility: 10,
					stamina: 10
				},
				hp: 100,
				maxHp: 100,
				createdAt: serverTimestamp(),
		mastery: {
				strength: { level: 0, exp: 0, requiredExp: 100 },
				stamina: { level: 0, exp: 0, requiredExp: 150 },
				agility: { level: 0, exp: 0, requiredExp: 120 }
				}
			});

			toast.success('Registrasi Berhasil!', {
				description: 'Karakter Anda telah dibuat. Mengarahkan ke halaman setup...'
			});
            
            // 2. GANTI BARIS INI
			goto('/', { replaceState: true }); 

		} catch (error: any) {
			console.error('Error registrasi:', error);
			toast.error('Registrasi Gagal', {
				description: error.message
			});
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen bg-gray-100">
	<div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
		<h1 class="text-2xl font-bold text-center">Buat Akun Baru</h1>

		<form class="space-y-6" on:submit|preventDefault={handleRegister}>
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
					placeholder="Minimal 6 karakter"
				/>
			</div>
			<div>
				<button
					type="submit"
					class="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
					disabled={isLoading}
				>
					{isLoading ? 'Memproses...' : 'Daftar'}
				</button>
			</div>
		</form>
	</div>
</main>