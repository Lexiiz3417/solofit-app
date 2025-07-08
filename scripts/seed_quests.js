// scripts/seed_quests.js

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import questsData from './quests.json' with { type: 'json' };

// --- PERUBAHAN DIMULAI DI SINI ---

// Fungsi untuk inisialisasi Firebase Admin
async function initializeFirebase() {
	try {
		// 1. Coba dulu pake serviceAccountKey.json kalo ada
		const serviceAccount = await import('../serviceAccountKey.json', {
			assert: { type: 'json' }
		});
		initializeApp({
			credential: cert(serviceAccount.default)
		});
		console.log('🔑 Berhasil inisialisasi menggunakan serviceAccountKey.json.');
	} catch (error) {
		// 2. Kalo gagal (file nggak ada), pake Application Default Credentials
		console.log(
			'⚠️  serviceAccountKey.json tidak ditemukan, mencoba menggunakan kredensial default...'
		);
		// Inisialisasi dengan Project ID biar nggak bingung
		initializeApp({
			projectId: 'skripsi-gamifikasi-dev'
		});
		console.log('🔑 Berhasil inisialisasi menggunakan kredensial default.');
	}
}

await initializeFirebase();

// --- PERUBAHAN SELESAI ---

const db = getFirestore();
const questsCollection = db.collection('quests');

// Fungsi utama untuk "menanam bibit"
async function seedDatabase() {
	console.log('🔥 Memulai proses seeding untuk quest...');

	// Hapus semua quest lama (opsional, tapi bagus biar bersih)
	console.log('🧹 Menghapus quest lama...');
	const snapshot = await questsCollection.get();
	if (snapshot.size > 0) {
		const batch = db.batch();
		snapshot.docs.forEach((doc) => {
			batch.delete(doc.ref);
		});
		await batch.commit();
		console.log('✅ Quest lama berhasil dihapus.');
	} else {
		console.log('ℹ️ Tidak ada quest lama untuk dihapus.');
	}

	// Tambahkan quest baru dari file JSON
	console.log('🌱 Menanam bibit quest baru...');
	for (const quest of questsData) {
		await questsCollection.add(quest);
		console.log(`   -> Menambahkan quest: ${quest.name}`);
	}

	console.log('🎉 Seeding selesai! Bank Quest sudah penuh!');
}

// Jalankan mantranya!
seedDatabase();