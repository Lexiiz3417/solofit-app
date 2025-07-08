// src/routes/library/[slug]/+page.server.ts
import { db } from '$lib/firebase/server';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Article } from '$lib/types';
// FIX: Kita tidak mengimpor 'doc' atau 'getDoc' dari client SDK lagi

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;

	// --- PERBAIKAN: Gunakan metode dari Admin SDK ---
	const docRef = db.collection('articles').doc(slug);
	const docSnap = await docRef.get();
	// ---------------------------------------------

	if (!docSnap.exists) {
		error(404, 'Artikel tidak ditemukan');
	}

	// Ambil data, pastikan kita nge-cast ke tipe Timestamp dari admin SDK
    const articleData = docSnap.data() as Omit<Article, 'publishedDate'> & { publishedDate: import('firebase-admin').firestore.Timestamp };

	return {
		article: {
			...articleData,
			// Ubah Timestamp jadi string ISO, ini sudah benar
			publishedDate: articleData.publishedDate.toDate().toISOString()
		}
	};
};