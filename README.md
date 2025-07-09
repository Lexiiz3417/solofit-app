Peta Konsep & Game Design Document (GDD) - Proyek Skripsi Kebugaran RPG
Dokumen ini merangkum semua konsep, mekanika, dan alur permainan untuk proyek aplikasi kebugaran gamifikasi. Dokumen ini berfungsi sebagai "Source of Truth" atau panduan utama pengembangan.

1. Visi & Filosofi Utama
Judul Proyek: Sistem Pakar Gamifikasi untuk Rekomendasi Latihan Kebugaran.

Masalah Utama: Rendahnya motivasi dan retensi pengguna pada aplikasi kebugaran konvensional karena rasa bosan, progresi yang tidak terasa nyata, dan kurangnya panduan yang memotivasi.

Solusi yang Ditawarkan: Sebuah aplikasi web responsif yang menerapkan mekanisme gamifikasi mendalam terinspirasi dari RPG, bertindak sebagai sistem pakar sederhana untuk memberikan pengalaman latihan yang terasa personal, memotivasi, dan punya progres yang jelas.

Filosofi Desain: "Semi-Hard Grind" yang adil, fleksibel untuk gaya hidup pengguna, mendukung kesehatan (dengan adanya hari istirahat), dan memberikan rasa pencapaian yang signifikan.

Tech Stack:

Framework: SvelteKit.

UI: shadcn-svelte & Tailwind CSS.

Backend & DB: Firebase (Auth & Firestore).

2. Sistem Karakter & Progresi
2.1. Statistik Karakter
STR (Strength): Mempengaruhi Base Damage dalam pertarungan.

END (Endurance): Mempengaruhi Max HP dan Defense (pengurangan damage).

AGI (Agility): Mempengaruhi Evasion Chance (peluang menghindar).

INT (Intelligence): Stat spesial yang hanya bisa ditingkatkan melalui aktivitas di "Library".

LUK (Luck): Mempengaruhi Crit Chance dan kemungkinan mendapat hadiah lebih baik.

2.2. Sistem Progresi Ganda
Level Utama (Makro):

Didapat dari EXP Utama (dari Quest, Dungeon, dll).

Setiap naik level memberikan +1 Poin Stat yang bisa dialokasikan secara bebas HANYA ke STR, END, atau AGI.

Mastery Stat (Mikro):

Setiap stat (STR, END, AGI, INT) memiliki bar EXP Mastery sendiri.

Melakukan aktivitas relevan (misal: push-up memberi STR_EXP, membaca memberi INT_EXP) akan mengisi bar ini.

Saat bar Mastery penuh, stat tersebut naik +1 secara permanen.

3. Alur Inti Harian (Core Gameplay Loop)
3.1. Jadwal Latihan Fleksibel
Pengguna bisa mengatur jadwal latihan inti mereka sendiri (3-6 hari per minggu).

Hari yang tidak dipilih menjadi Active Rest Day.

3.2. Workout Day (Hari Latihan)
Quest Wajib: Mencapai target minimum 80 EP dari total 100 EP harian.

Progres Fleksibel: Pengguna bisa "mencicil" repetisi. Progres (misal: 12/20 push-up) tersimpan dan bisa dilanjutkan di hari yang sama.

Sisa EP: EP yang digunakan di atas 80 menjadi currency untuk "Pasar Quest". Sisa EP hangus setiap hari.

Reward Quest Wajib: EXP Utama dan 1x Dungeon Key.

3.3. Active Rest Day (Hari Istirahat)
Quest Wajib: Menyelesaikan checklist 2 tugas ringan untuk menjaga streak:

Menyelesaikan 1 sesi peregangan.

Menyelesaikan 1 reading quest di Library.

4. Sistem Pendukung Motivasi
4.1. Penalty System
Diberikan jika pengguna GAGAL menyelesaikan Quest Wajib apapun (baik di Workout Day maupun Rest Day).

Efek Berlapis:

Streak harian kembali ke 0.

Pengurangan sumber daya (misal: -50 Gold).

Debuff "Malas" (Max EP esok hari berkurang 15%).

4.2. Streak Reward System
Diberikan setiap kali pengguna mencapai streak kelipatan 10 hari.

Pengguna dihadapkan "Papan Pilihan Hadiah" dan hanya bisa memilih satu dari:

Bonus EXP Utama.

+1 Poin Stat Langka (bisa dialokasikan ke STR/END/AGI).

Sejumlah besar Gold.

Peti Harta Karun (item consumable acak).

4.3. Achievement System
Menggantikan item kosmetik. Ditampilkan di profil pengguna lengkap dengan tanggal didapat.

Kategori: Firsts (pencapaian pertama), Milestones (progresi level/stat), dan Consistency (konsistensi & grinding).

5. Fitur & Mekanisme Sekunder
5.1. Dungeon
Akses: Menggunakan 1x Dungeon Key.

Struktur: Memiliki "Floor" adaptif berdasarkan level utama pengguna (misal: Level 1-10 di Floor 1).

Monster: Muncul secara acak, namun levelnya dibatasi sesuai aturan Floor.

Mekanisme: Pertarungan turn-based dengan battle log berbasis teks.

Formula Pertarungan:

Max HP = 100 + (END * 10)

Base Damage = STR + Random(-2, +2)

Damage Diterima = Base Damage Penyerang - (END Target / 2)

Crit Chance (%) = 5 + (AGI * 0.5) + (LUK * 0.25) (Damage *1.5)

Evasion Chance (%) = (AGI Target * 0.3) (Maksimal 35%)

5.2. Ekonomi & Inventory
Pasar Quest: Tempat membelanjakan "Sisa EP" untuk membeli quest opsional yang berhadiah EXP Mastery spesifik dan sedikit EXP Utama.

Shop: Tempat membelanjakan "Gold" untuk membeli item consumable.

Inventory: Fokus pada item sekali pakai (consumables) seperti Health Potion, Energy Potion, dan Dungeon Key.

5.3. Library
Tujuan: Sarana meningkatkan stat INT dan aktivitas di Active Rest Day.

Konten: Rangkuman jurnal ilmiah dengan struktur Hook -> Body -> Takeaway.

Mekanisme: Menggunakan "Validasi Kata Kunci" untuk verifikasi membaca dan mendapatkan INT_EXP.

6. Prinsip UI/UX
Responsif: Desain dengan pendekatan "Mobile-First" agar nyaman di semua perangkat.

Tema: Mendukung mode Terang dan Gelap.

Konsistensi: Menggunakan "Komponen Notifikasi Universal" terpusat untuk semua notifikasi/pop-up agar desain seragam.
