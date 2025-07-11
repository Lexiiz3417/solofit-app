<script lang="ts">
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner'; // <-- Import toast

	export let data: PageData;
	const { article } = data;

	let userInput = ''; // <-- Variabel untuk menampung input pengguna

	function handleClaimReward() {
		// Kita bandingkan jawaban pengguna (dibuat huruf kecil) dengan kata kunci
		if (userInput.toLowerCase().trim() === article.keyword.toLowerCase()) {
			// Jika benar, tampilkan notifikasi sukses
			toast.success(`Benar! Kamu mendapatkan +${article.int_exp_reward} INT EXP.`);
			// TODO: Tambahkan logika untuk update stat INT di Firebase
		} else {
			// Jika salah, tampilkan notifikasi error
			toast.error('Kata kunci salah. Coba baca lagi artikelnya dengan teliti!');
		}
	}
</script>

<div class="max-w-4xl mx-auto">
	<a href="/library" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
		<ArrowLeft size={16} />
		Kembali ke Library
	</a>

	<article class="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert">
		<h1>{article.title}</h1>
		<p class="lead font-semibold">{article.content.hook}</p>
		<p>{article.content.body}</p>
		<blockquote class="font-medium">{article.content.takeaway}</blockquote>
	</article>

	<hr class="my-8" />

	<Card.Root>
		<Card.Header>
			<Card.Title>Validasi Pemahaman</Card.Title>
			<Card.Description>
				Untuk mendapatkan <span class="font-bold text-primary">+{article.int_exp_reward} INT EXP</span>,
				masukkan kata kunci yang kamu temukan dari artikel di atas.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex w-full max-w-sm items-center space-x-2">
				<Input type="text" placeholder="Masukkan kata kunci..." bind:value={userInput} />
				<Button onclick={handleClaimReward}>Klaim Reward</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>