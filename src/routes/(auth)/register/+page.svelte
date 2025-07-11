<script lang="ts">
	import { auth } from '$lib/firebase';
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let email = '';
	let password = '';
	let isLoading = false; // State untuk menonaktifkan tombol saat loading

	async function handleRegister() {
		if (!email || !password) {
			toast.error('Email dan Password tidak boleh kosong!');
			return;
		}
		isLoading = true; // Mulai loading

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			toast.success(`Hunter ${userCredential.user.email} berhasil direkrut!`, {
				description: 'Mengarahkan ke dashboard...'
			});
			await goto('/'); // Kita arahkan ke root, yang mana adalah dashboard
		} catch (error: any) {
			// Error handling dengan pesan yang lebih ramah
			const message = error.code.includes('auth/email-already-in-use')
				? 'Email ini sudah terdaftar. Silakan login.'
				: 'Terjadi kesalahan saat pendaftaran.';
			toast.error(message, { description: error.message });
		} finally {
			isLoading = false; // Selesai loading
		}
	}
</script>

<div class="flex items-center justify-center min-h-screen p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Create an account</Card.Title>
			<Card.Description>Enter your email below to create your account.</Card.Description>
		</Card.Header>
		<form on:submit|preventDefault={handleRegister}>
			<Card.Content class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input bind:value={email} id="email" type="email" placeholder="hunter@example.com" required disabled={isLoading} />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input bind:value={password} id="password" type="password" required disabled={isLoading} />
				</div>
			</Card.Content>
			<Card.Footer class="flex flex-col gap-4">
				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Processing...
					{:else}
						Register
					{/if}
				</Button>
				<p class="text-center text-sm text-muted-foreground">
					Already have an account?
					<a href="/login" class="underline underline-offset-4 hover:text-primary"> Login </a>
				</p>
			</Card.Footer>
		</form>
	</Card.Root>
</div>