<script lang="ts">
    import type { PageData } from './$types';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { BookOpen } from 'lucide-svelte';

    let { data } = $props<{ data: PageData }>();
</script>

<main class="container mx-auto p-4 md:p-8">
    <div class="flex items-center gap-4 mb-8">
        <BookOpen class="size-9 text-primary" />
        <div>
            <h1 class="text-3xl font-bold">Perpustakaan Pengetahuan</h1>
            <p class="text-muted-foreground">Tingkatkan stat 'Intelligence' dengan membaca!</p>
        </div>
    </div>

    {#if data.articles.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each data.articles as article (article.id)}
                <a href={`/library/${article.slug}`}>
                    <Card class="h-full flex flex-col hover:border-primary transition-colors">
                        <CardHeader>
                            <img src={article.coverImage} alt="Cover {article.title}" class="rounded-t-lg aspect-video object-cover mb-4" />
                            <CardTitle>{article.title}</CardTitle>
                            <CardDescription class="text-xs">
                                Oleh: {article.sourceName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="flex-1">
                            <p class="text-sm text-muted-foreground">
                                {article.summary}
                            </p>
                        </CardContent>
                    </Card>
                </a>
            {/each}
        </div>
    {:else}
        <div class="text-center py-20">
            <p class="text-muted-foreground">Perpustakaan sedang kosong. Coba lagi nanti!</p>
        </div>
    {/if}
</main>