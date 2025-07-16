<script lang="ts">
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	// --- AWAL BAGIAN YANG DIGANTI ---
	import { updateDailyTaskStatus } from '$lib/services/dailyProgressService';
	import { user } from '$lib/stores';
	// --- AKHIR BAGIAN YANG DIGANTI ---

	export let data: PageData;
	const { article } = data;

	let userInput = '';

	async function handleClaimReward() {
		// --- AWAL BAGIAN YANG DIGANTI ---
		if (!$user) {
			toast.error('Sesi pengguna tidak valid.');
			return;
		}
		// --- AKHIR BAGIAN YANG DIGANTI ---

		if (userInput.toLowerCase().trim() === article.keyword.toLowerCase()) {
			toast.success(`Benar! Kamu mendapatkan +${article.int_exp_reward} INT EXP.`);
			
			// --- TAMBAHAN BARU: Catat penyelesaian tugas 'reading' ---
			await updateDailyTaskStatus($user.uid, 'reading', true);

			// TODO: Tambahkan logika untuk update stat INT di Firebase
		} else {
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