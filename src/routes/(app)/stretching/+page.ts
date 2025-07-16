// src/routes/(app)/stretching/+page.ts
import { getStretchingRoutine } from '$lib/services/stretchingService';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const routine = await getStretchingRoutine();
	return {
		routine
	};
};