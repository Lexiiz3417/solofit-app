<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { auth } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { user, userProfile } from '$lib/stores';
	import { toast } from 'svelte-sonner';
	import { updateUserProfile } from '$lib/services/userService'; // <-- Impor fungsi update

	// Ambil nickname awal dari store untuk ditampilkan di input field
	let nickname = $userProfile?.nickname || '';
	let isLoadingProfileUpdate = false;

	async function handleUpdateProfile() {
		if (!nickname.trim()) {
			toast.error('Nickname tidak boleh kosong.');
			return;
		}
		if (!$user) {
			toast.error('Sesi tidak ditemukan, silakan login ulang.');
			return;
		}

		isLoadingProfileUpdate = true;

		// Panggil fungsi dari userService untuk update ke Firestore
		const success = await updateUserProfile($user.uid, { nickname: nickname });

		if (success) {
			toast.success(`Nickname berhasil diubah menjadi: ${nickname}`);

			// **BAGIAN PENTING**: Update juga store lokal kita
			// agar UI (seperti header) langsung berubah tanpa perlu refresh.
			if ($userProfile) {
				$userProfile.nickname = nickname;
			}
		} else {
			toast.error('Gagal menyimpan perubahan.');
		}
		isLoadingProfileUpdate = false;
	}

	async function handleLogout() {
		toast.promise(signOut(auth), {
			loading: 'Logging out...',
			success: () => {
				$user = null;
				$userProfile = null;
				setTimeout(() => {
					goto('/login');
				}, 1500);
				return 'Anda berhasil logout.';
			},
			error: (err) => {
				if (err instanceof Error) {
					return `Gagal logout: ${err.message}`;
				}
				return 'Terjadi kesalahan yang tidak diketahui.';
			}
		});
	}
</script>

<div class="flex flex-col gap-8">
	<h1 class="text-2xl font-bold">Pengaturan</h1>

	<Card.Root>
		<Card.Header>
			<Card.Title>Profil Hunter</Card.Title>
			<Card.Description>
				Ubah nama panggilanmu di sini. Nama ini akan menggantikan panggilan default "Hunter".
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-2 max-w-sm">
				<Label for="nickname">Nickname</Label>
				<Input bind:value={nickname} id="nickname" placeholder="Hunter Keren" disabled={isLoadingProfileUpdate} />
			</div>
		</Card.Content>
		<Card.Footer>
			<Button onclick={handleUpdateProfile} disabled={isLoadingProfileUpdate}>
				{#if isLoadingProfileUpdate}
					<svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Menyimpan...
				{:else}
					Simpan Perubahan
				{/if}
			</Button>
		</Card.Footer>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Akun</Card.Title>
			<Card.Description>
				Keluar dari sesimu saat ini. Kamu akan dikembalikan ke halaman login.
			</Card.Description>
		</Card.Header>
		<Card.Footer>
			<Button onclick={handleLogout} variant="destructive"> Logout </Button>
		</Card.Footer>
	</Card.Root>
</div>