<script lang="ts">
	// --- Dari Backend Engineer ---
	import { auth } from '$lib/firebase';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	// --- Sentuhan UI/UX ---
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Eye, EyeOff } from 'lucide-svelte'; // <-- Impor ikon mata

	let email = '';
	let password = '';
	let isLoading = false;
	let showPassword = false; // <-- State baru untuk toggle password

	async function handleLogin() {
	if (!email || !password) {
		toast.error('Email dan Password tidak boleh kosong!');
		return;
	}
	isLoading = true;

	toast.promise(signInWithEmailAndPassword(auth, email, password), {
		loading: 'Mencoba masuk...',
		success: (userCredential) => {
			// Tunda perpindahan halaman selama 1.5 detik
			setTimeout(() => {
				goto('/');
			}, 1500); 

			return `Selamat datang kembali, Hunter!`;
		},
		error: () => {
			return 'Email atau Password yang Anda masukkan salah.';
		},
		finally: () => {
			isLoading = false;
		}
	});
}
</script>

<div class="flex items-center justify-center min-h-screen p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Welcome Back, Hunter</Card.Title>
			<Card.Description>Enter your credentials to continue your journey.</Card.Description>
		</Card.Header>
		<form on:submit|preventDefault={handleLogin}>
			<Card.Content class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input bind:value={email} id="email" type="email" placeholder="hunter@example.com" required disabled={isLoading}/>
				</div>
				<div class="grid gap-2 relative">
					<Label for="password">Password</Label>
					<Input bind:value={password} id="password" type={showPassword ? 'text' : 'password'} required disabled={isLoading} />
					<Button onclick={() => (showPassword = !showPassword)} type="button" variant="ghost" size="icon" class="absolute bottom-1 right-1 h-7 w-7">
						{#if showPassword}
							<EyeOff class="h-4 w-4" />
						{:else}
							<Eye class="h-4 w-4" />
						{/if}
					</Button>
				</div>
			</Card.Content>
			<Card.Footer class="flex flex-col gap-4 pt-4">
				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Processing...
					{:else}
						Login
					{/if}
				</Button>
				<p class="text-center text-sm text-muted-foreground">
					Don't have an account?
					<a href="/register" class="underline underline-offset-4 hover:text-primary"> Register </a>
				</p>
			</Card.Footer>
		</form>
	</Card.Root>
</div>