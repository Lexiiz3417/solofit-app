// /src/routes/api/seed-exercises/+server.ts

import { json } from '@sveltejs/kit';
import { seedExercises } from '$lib/services/adminService';

export async function GET() {
    console.log('Menerima permintaan GET ke /api/seed-exercises');
    
    // Panggil fungsi seeding
    const result = await seedExercises();

    // Kembalikan hasil sebagai respons JSON
    if (result.success) {
        return json({ message: result.message }, { status: 200 });
    } else {
        return json({ message: result.message }, { status: 500 });
    }
}