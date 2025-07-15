<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { BookOpen } from 'lucide-svelte';

	// Nanti data ini akan kita ambil dari Firebase, untuk sekarang kita taruh di sini dulu.
	const articles = [
		{
			id: 'dasar-kalistenik',
			title: 'Dasar-Dasar Latihan Kalistenik',
			description: 'Pahami pondasi utama dari kalistenik, mulai dari postur hingga gerakan dasar yang wajib dikuasai.',
			int_exp_reward: 10
		},
		{
			id: 'pentingnya-pemanasan',
			title: 'Pentingnya Pemanasan Sebelum Latihan',
			description: 'Mengapa pemanasan tidak boleh dilewatkan? Pelajari manfaat dan cara melakukan pemanasan yang efektif.',
			int_exp_reward: 5
		},
		{
			id: 'nutrisi-untuk-otot',
			title: 'Nutrisi Penting untuk Pertumbuhan Otot',
			description: 'Latihan keras saja tidak cukup. Kenali makro dan mikro nutrisi yang dibutuhkan tubuhmu untuk pulih dan berkembang.',
			int_exp_reward: 15
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-2xl font-bold">Library</h1>
		<p class="text-muted-foreground">Baca untuk menambah wawasan dan dapatkan INT EXP.</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each articles as article (article.id)}
			<Card.Root class="flex flex-col">
				<Card.Header>
					<Card.Title>{article.title}</Card.Title>
					<Card.Description>{article.description}</Card.Description>
				</Card.Header>
				<Card.Content class="flex-grow">
                    </Card.Content>
				<Card.Footer class="flex justify-between items-center">
					<div class="text-sm font-semibold text-primary">+{article.int_exp_reward} INT EXP</div>
					<a href="/library/{article.id}">
						<Button>
							<BookOpen class="mr-2 h-4 w-4" />
							Mulai Baca
						</Button>
					</a>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</div>