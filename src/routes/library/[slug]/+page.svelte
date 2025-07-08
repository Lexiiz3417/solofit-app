<script lang="ts">
    import type { PageData } from './$types';
    import { userStore } from '$lib/firebase/auth';
    import { db } from '$lib/firebase/client';
    import { doc, updateDoc, increment } from 'firebase/firestore';
    import { onMount, onDestroy } from 'svelte';
    import { toast } from 'svelte-sonner';
    import { ArrowLeft, Clock } from 'lucide-svelte';

    let { data } = $props<{ data: PageData }>();
    const { article } = data;

    let readingTimer: NodeJS.Timeout;
    let secondsRead = $state(0);

    // Fungsi yang dijalankan saat user meninggalkan halaman
    async function onLeavePage() {
        clearInterval(readingTimer); // Hentikan timer

        if (secondsRead < 10 || !$userStore) {
            // Jangan lakukan apa-apa kalo bacanya bentar banget atau user gak login
            return;
        }

        const minutesRead = Math.floor(secondsRead / 60);
        
        // --- LOGIKA PEMBERIAN EXP ---
        // Asumsi 1 menit baca = 5 intelligence EXP
        const expGained = minutesRead * 5;

        // Jangan kasih notif kalau EXP yang didapat 0
        if (expGained <= 0) return;

        try {
            // Update mastery intelligence di Firestore
            const userRef = doc(db, 'users', $userStore.uid);
            await updateDoc(userRef, {
                [`mastery.intelligence.exp`]: increment(expGained)
            });

            toast.success('Kamu menyelesaikan sesi membaca!', {
                description: `Kamu mendapatkan +${expGained} Intelligence EXP.`
            });

        } catch (err) {
            console.error("Gagal menyimpan progres membaca:", err);
            toast.error("Gagal menyimpan progres membaca.");
        }
    }

    onMount(() => {
        // Mulai timer saat halaman dibuka
        readingTimer = setInterval(() => {
            secondsRead += 1;
        }, 1000);

        // Listener untuk saat user menutup tab/browser
        window.addEventListener('beforeunload', onLeavePage);
    });

    onDestroy(() => {
        // Dijalankan saat user navigasi ke halaman lain
        onLeavePage();
        window.removeEventListener('beforeunload', onLeavePage);
    });

</script>

<main class="container mx-auto p-4 md:p-8 max-w-4xl">
    <a href="/library" class="inline-flex items-center gap-2 text-primary mb-6 hover:underline">
        <ArrowLeft class="size-4" />
        Kembali ke Perpustakaan
    </a>
    
    <article class="prose dark:prose-invert lg:prose-xl mx-auto">
        <img src={article.coverImage} alt="Cover {article.title}" class="rounded-lg mb-4" />
        
        <h1>{article.title}</h1>
        
        <div class="flex items-center gap-4 text-sm text-muted-foreground mb-8 border-y py-2">
            <span>Oleh: {article.sourceName}</span>
            <span>•</span>
            <span>{new Date(article.publishedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>•</span>
            <span class="flex items-center gap-1.5"><Clock class="size-4" /> {article.estimatedReadTime} menit baca</span>
        </div>

        {@html article.content}

        <div class="mt-12 text-center border-t pt-4">
            <p class="text-xs text-muted-foreground">
                Artikel ini bersumber dari <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">{article.sourceName}</a>.
            </p>
        </div>
    </article>
</main>