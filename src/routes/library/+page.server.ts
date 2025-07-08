// src/routes/library/+page.server.ts
import { db } from '$lib/firebase/server';
import type { PageServerLoad } from './$types';
import type { Article } from '$lib/types';
// FIX: Kita tidak mengimpor fungsi-fungsi client SDK

export const load: PageServerLoad = async () => {
	try {
		// --- PERBAIKAN: Gunakan metode dari Admin SDK ---
		const articlesCollection = db.collection('articles');
		const q = await articlesCollection.orderBy('publishedDate', 'desc').get();
		// ----------------------------------------------

		const articles = q.docs.map((doc) => {
            const data = doc.data() as Omit<Article, 'publishedDate'> & { publishedDate: import('firebase-admin').firestore.Timestamp };
			return {
				...data,
				publishedDate: data.publishedDate.toDate().toISOString(),
				id: doc.id // id tetap diambil dari doc.id
			};
		});

		return { articles };
	} catch (error) {
		console.error("Gagal mengambil data artikel:", error);
		return { articles: [] };
	}
};