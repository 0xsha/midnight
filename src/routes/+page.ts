import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	const res = await fetch(`/api/data`);
	const data = await res.json();

	return {
		data
	};
}) satisfies PageLoad;
