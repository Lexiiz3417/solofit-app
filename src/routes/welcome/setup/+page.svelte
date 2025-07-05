<script lang="ts">
	import { userStore, profileStore } from '$lib/firebase/auth';
	import { db } from '$lib/firebase/client';
	import { doc, updateDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
    import { ShieldAlert } from 'lucide-svelte';

	let usernameInput = $state('');
	let fitnessGoal = $state('build_muscle');
	let fitnessLevel = $state('beginner');
	let commitmentDays = $state(3);
	let equipment = $state<string[]>([]); // <-- VARIABEL PERALATAN KEMBALI
	let isLoading = $state(false);
	let isDialogOpen = $state(false);

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
			toast.error('Sesi tidak valid, login ulang gih.');
			return;
		}
		isLoading = true;
		try {
			const userDocRef = doc(db, 'users', $userStore.uid);
			await updateDoc(userDocRef, {
				username: usernameInput.trim(),
				isSetupComplete: true,
				goal: fitnessGoal,
				fitnessLevel: fitnessLevel,
				commitmentDays: commitmentDays,
				equipment: equipment // <-- SIMPAN DATA PERALATAN
			});
			toast.success('Kontrak Diterima!', {
				description: 'Selamat datang di awal perjalananmu, Hunter!'
			});
			goto('/', { replaceState: true });
		} catch (error: any) {
			console.error('Gagal menyimpan setup:', error);
			toast.error('Gagal menyimpan setup.', { description: error.message });
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="flex items-center justify-center min-h-screen bg-gray-100 py-12">
	<Dialog bind:open={isDialogOpen}>
		<div class="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
			<div class="text-center">
				<h1 class="text-3xl font-bold">Pengaturan Karakter</h1>
				<p class="text-gray-600">Personalisasikan perjalanan kebugaranmu.</p>
			</div>

			<div class="space-y-6">
                <div>
					<label for="username" class="block text-sm font-medium text-gray-700">1. Username</label>
					<input type="text" id="username" class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" bind:value={usernameInput} />
				</div>
                <div>
					<h3 class="block text-sm font-medium text-gray-700">2. Tujuan Utama Kamu</h3>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
						<label class="p-4 border-2 rounded-lg cursor-pointer transition-all" class:border-blue-600={fitnessGoal === 'build_muscle'} class:bg-blue-50={fitnessGoal === 'build_muscle'}>
							<input type="radio" name="goal" value="build_muscle" bind:group={fitnessGoal} class="hidden" />
							<span class="font-semibold block text-center">Kekuatan</span>
						</label>
						<label class="p-4 border-2 rounded-lg cursor-pointer transition-all" class:border-blue-600={fitnessGoal === 'endurance'} class:bg-blue-50={fitnessGoal === 'endurance'}>
							<input type="radio" name="goal" value="endurance" bind:group={fitnessGoal} class="hidden" />
							<span class="font-semibold block text-center">Daya Tahan</span>
						</label>
						<label class="p-4 border-2 rounded-lg cursor-pointer transition-all" class:border-blue-600={fitnessGoal === 'agility'} class:bg-blue-50={fitnessGoal === 'agility'}>
							<input type="radio" name="goal" value="agility" bind:group={fitnessGoal} class="hidden" />
							<span class="font-semibold block text-center">Kelincahan</span>
						</label>
					</div>
				</div>
                <div>
					<h3 class="block text-sm font-medium text-gray-700">3. Tingkat Kebugaran Kamu Saat Ini</h3>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
						<label class="p-4 border-2 rounded-lg cursor-pointer transition-all" class:border-blue-600={fitnessLevel === 'beginner'} class:bg-blue-50={fitnessLevel === 'beginner'}>
							<input type="radio" name="level" value="beginner" bind:group={fitnessLevel} class="hidden" />
							<span class="font-semibold block text-center">Pemula</span>
						</label>
						<label class="p-4 border-2 rounded-lg cursor-pointer transition-all" class:border-blue-600={fitnessLevel === 'intermediate'} class:bg-blue-50={fitnessLevel === 'intermediate'}>
							<input type="radio" name="level" value="intermediate" bind:group={fitnessLevel} class="hidden" />
							<span class="font-semibold block text-center">Menengah</span>
						</label>
						<label class="p-4 border-2 rounded-lg cursor-pointer transition-all" class:border-blue-600={fitnessLevel === 'advanced'} class:bg-blue-50={fitnessLevel === 'advanced'}>
							<input type="radio" name="level" value="advanced" bind:group={fitnessLevel} class="hidden" />
							<span class="font-semibold block text-center">Mahir</span>
						</label>
					</div>
				</div>
                <div>
					<label for="commitment" class="block text-sm font-medium text-gray-700">4. Komitmen Latihan per Minggu</label>
					<select id="commitment" bind:value={commitmentDays} class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm">
						<option value={3}>3 Hari</option>
						<option value={4}>4 Hari</option>
						<option value={5}>5 Hari</option>
						<option value={6}>6 Hari</option>
					</select>
				</div>
			</div>

			<div>
				<button onclick={() => (isDialogOpen = true)} disabled={isLoading} class={cn(buttonVariants({ class: 'w-full' }))}>
					{isLoading ? 'Menyimpan...' : 'Simpan dan Mulai Petualangan'}
				</button>
			</div>
		</div>

		<DialogContent>
			<DialogHeader>
				<DialogTitle class="flex items-center justify-center gap-2">
					<ShieldAlert class="size-5 text-yellow-500" />
					<span>[ PERINGATAN SISTEM ]</span>
				</DialogTitle>
				<DialogDescription class="pt-4 space-y-2 text-md text-slate-700">
					<p>Kamu akan memulai perjalanan yang menuntut disiplin, keringat, dan komitmen.</p>
					<p>Tidak ada jalan untuk kembali ke dirimu yang lama.</p>
					<p class="font-bold text-lg mt-4 text-slate-800">
						Apakah kamu menerima kontrak ini dan siap meninggalkan sisi lemahmu?
					</p>
				</DialogDescription>
			</DialogHeader>
			<DialogFooter class="gap-2 sm:justify-end">
				<Button onclick={() => (isDialogOpen = false)} variant="secondary">Tidak, Aku Ingin Tetap Pecundang</Button>
				<Button onclick={handleSaveSetup} disabled={isLoading}>Ya, Aku Siap!</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</main>