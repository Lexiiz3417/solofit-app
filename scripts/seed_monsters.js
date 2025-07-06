// Menggunakan sintaksis import ES Module yang modern
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Mengimpor kunci layanan dan data monster
import serviceAccount from '../serviceAccountKey.json' with { type: 'json' };
import monstersData from './monsters.json' with { type: 'json' };

// Inisialisasi aplikasi Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const monstersCollection = db.collection('monsters');

// Fungsi utama untuk proses seeding
async function seedMonsters() {
  console.log('🔥 Memulai proses seeding untuk monster...');

  // 1. Hapus semua monster lama agar data bersih
  console.log('🧹 Menghapus monster lama...');
  const snapshot = await monstersCollection.get();
  if (snapshot.size > 0) {
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('✅ Monster lama berhasil dihapus.');
  } else {
    console.log('ℹ️ Tidak ada monster lama untuk dihapus.');
  }

  // 2. Tambahkan monster baru dari file JSON
  console.log('🌱 Menanam bibit monster baru...');
  for (const monster of monstersData) {
    // Kita tidak perlu ID spesifik, biarkan Firestore yang buat
    await monstersCollection.add(monster);
    console.log(`   -> Menambahkan monster: ${monster.name}`);
  }

  console.log('🎉 Seeding monster selesai! Dungeon siap diisi!');
}

// Jalankan fungsi seeding
seedMonsters();
