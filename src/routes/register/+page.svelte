<script lang="ts">
  // 1. Import hal-hal baru yang kita butuhkan dari Firestore
  import { auth, db } from '$lib/firebase/client'; // db sekarang kita import
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // import fungsi untuk menulis data

  let email = '';
  let password = '';
  let isLoading = false;
  let errorMessage = '';

  async function handleRegister() {
    if (!email || !password) {
      errorMessage = 'Email dan password tidak boleh kosong.';
      return;
    }

    isLoading = true;
    errorMessage = '';

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registrasi Auth berhasil!', userCredential.user);

      // --- INI BAGIAN BARUNYA ---
      // 2. Siapkan data karakter awal untuk disimpan
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid); // Membuat referensi ke dokumen user

      await setDoc(userDocRef, {
        email: user.email,
        level: 1,
        exp: 0,
        requiredExp: 100,
        stats: {
          strength: 10,
          agility: 10,
          stamina: 10
        },
        createdAt: serverTimestamp() // Tandai waktu pembuatan dengan timestamp dari server
      });
      // --- AKHIR BAGIAN BARU ---

      alert('Registrasi dan pembuatan karakter berhasil!');
      window.location.href = '/';

    } catch (error: any) {
      console.error('Error registrasi:', error);
      errorMessage = error.message;
      alert(`Error: ${error.message}`);
      
    } finally {
      isLoading = false;
    }
  }
</script>
  
  <main class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center">Buat Akun Baru</h1>
  
      <form class="space-y-6" on:submit|preventDefault={handleRegister}>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Alamat Email</label>
          <input
            type="email"
            id="email"
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            bind:value={email}
            placeholder="email@contoh.com"
          />
        </div>
  
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            bind:value={password}
            placeholder="Minimal 6 karakter"
          />
        </div>
        
        {#if errorMessage}
          <p class="text-sm text-red-600">{errorMessage}</p>
        {/if}
  
        <div>
          <button
            type="submit"
            class="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Daftar'}
          </button>
        </div>
      </form>
    </div>
  </main>