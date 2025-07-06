// PERBAIKAN: Gunakan 'import' modern, bukan 'require'
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// PERBAIKAN: Cara baru untuk impor JSON di ES Modules
import serviceAccount from '../serviceAccountKey.json' with { type: 'json' };
import questsData from './quests.json' with { type: 'json' };

// Sambungkan ke Firebase
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const questsCollection = db.collection('quests');

// Fungsi utama untuk "menanam bibit"
async function seedDatabase() {
  console.log('🔥 Memulai proses seeding...');

  // Hapus semua quest lama (opsional, tapi bagus biar bersih)
  console.log('🧹 Menghapus quest lama...');
  const snapshot = await questsCollection.get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log('✅ Quest lama berhasil dihapus.');

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