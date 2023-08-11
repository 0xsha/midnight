import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
	//const chains = [env.ETH_MAINNET_RPC, env.AVAX_MAINNET_RPC , ]

	return json({
		// return current verion
		version: '1.0.0-alpha'
	});
};
