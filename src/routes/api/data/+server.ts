import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { Transaction } from '$lib/server/database';

export const GET: RequestHandler = async (event) => {
	const data = await Transaction.findAll({ limit: 30 });

	return json({
		data
	});
};
