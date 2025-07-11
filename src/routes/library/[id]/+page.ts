import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Kita copy-paste mock data di sini agar file ini mandiri.
// Nanti, semua ini akan diganti dengan satu panggilan ke database Firebase.
const articles = [
	{
		id: 'dasar-kalistenik',
		title: 'Dasar-Dasar Latihan Kalistenik',
		content: {
			hook: 'Kalistenik sering dianggap sebagai latihan beban tubuh yang sederhana, tetapi apakah Anda tahu bahwa postur adalah kunci absolut untuk membuka potensi penuhnya?',
			body: 'Dalam kalistenik, setiap gerakan, dari push-up hingga pull-up, sangat bergantung pada keselarasan tubuh. Fondasi utamanya adalah "hollow body position", di mana Anda mengencangkan perut dan meratakan punggung bawah. Ini menciptakan inti tubuh yang solid, memungkinkan transfer energi yang efisien dan mengurangi risiko cedera. Gerakan dasar yang wajib dikuasai meliputi push-up (untuk dada dan trisep), pull-up (punggung dan bisep), dan squat (kaki dan glutes). Kuasai bentuk sempurna dari ketiganya sebelum beralih ke variasi yang lebih sulit.',
			takeaway: 'Fokus pada bentuk sempurna dan aktivasi inti tubuh adalah fondasi sejati dari semua kekuatan kalistenik.'
		},
		keyword: 'hollow body',
		int_exp_reward: 10
	},
	{
		id: 'pentingnya-pemanasan',
		title: 'Pentingnya Pemanasan Sebelum Latihan',
		content: {
			hook: 'Banyak orang melewatkan pemanasan untuk menghemat waktu. Ironisnya, tindakan ini justru dapat "mencuri" waktu Anda di masa depan melalui cedera.',
			body: 'Pemanasan, atau "warm-up", secara harfiah meningkatkan suhu otot dan aliran darah. Ini membuat otot lebih elastis dan siap untuk kontraksi yang kuat. Pemanasan yang efektif terdiri dari dua bagian: pemanasan kardio ringan (seperti jogging di tempat selama 5 menit) untuk meningkatkan detak jantung, diikuti oleh "dynamic stretching" (peregangan dinamis) seperti arm circles atau leg swings. Peregangan dinamis mempersiapkan sendi dan otot untuk rentang gerak yang akan digunakan selama latihan inti, tidak seperti peregangan statis yang lebih cocok untuk pendinginan.',
			takeaway: 'Pemanasan bukan hanya tentang mencegah cedera, tetapi juga tentang mempersiapkan tubuh untuk performa puncak.'
		},
		keyword: 'dynamic stretching',
		int_exp_reward: 5
	}
];

export const load: PageLoad = ({ params }) => {
	const article = articles.find((article) => article.id === params.id);

	if (!article) {
		throw error(404, 'Artikel tidak ditemukan');
	}

	return {
		article
	};
};