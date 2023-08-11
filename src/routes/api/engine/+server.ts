import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import AVVE_ABI from '$lib/abis/aavelendingv3.json';
import { ethers } from 'ethers';

import WebSocket from 'ws';
import path from 'path';
import fs from 'fs';

import { Transaction } from '$lib/server/database';

// let engineStared = false;

export const GET: RequestHandler = async (event) => {
	// const chain = event.url.searchParams.get('chain');

	// if (engineStared) {
	// 	return json({
	// 		EngineAlreadyStarted: true
	// 	});
	// }

	// let provider = '';
	// switch (chain) {
	// 	case 'eth':
	// 		provider = env.ETH_MAINNET_RPC;
	// 		break;
	// 	case 'bnb':
	// 		provider = env.BNB_MAINNET_RPC;
	// 		break;
	// 	case 'matic':
	// 		provider = env.MATIC_MAIINET_RPC;
	// 		break;
	// 	case 'avax':
	// 		provider = env.AVAX_MAINNET_RPC;
	// 		break;
	// 	default:
	// 		return json({ error: 'invalid provider' });
	// }

	const wssProvider = env.POLYGON_MAINNET_RPC_WSS!;

	//  this one just pulls
	// const httpProvider = env.POLYGON_MAINNET_RPC_HTTPS;
	// const ethersHttpProvider = new ethers.providers.JsonRpcProvider(httpProvider);
	// const signer = ethersProvider.getSigner();
	// const AAVEPoolAddress = '0x794a61358D6845594F94dc1DB02A252b5b4814aD';
	// const aavePoolContract = new ethers.Contract(AAVEPoolAddress, AVVE_ABI, ethersHttpProvider);

	const ws = new WebSocket(wssProvider);

	const protocols = JSON.parse(
		fs.readFileSync(path.resolve(process.cwd(), 'protocols.json'), 'utf-8')
	);

	ws.on('open', async function open() {
		for (const protocol of protocols) {
			const topic = ethers.utils.id(protocol.sig); // Hash the signature

			const payload = {
				jsonrpc: '2.0',
				id: protocol.network,
				method: 'eth_subscribe',
				params: [
					'logs',
					{
						address: protocol.address,
						topics: [topic]
					}
				]
			};

			ws.send(JSON.stringify(payload));
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a bit
		}
	});

	// listen for messages
	ws.on('message', async function incoming(data) {
		const payload = JSON.parse(data.toString());
		// engineStared = true; // basic lock

		// check if there is payload.params.result
		if (payload['params']) {
			if (payload['params']['result']) {
				const iface = new ethers.utils.Interface(AVVE_ABI);
				const decoded = iface.parseLog(payload.params.result);
				// console.log(log.args);

				try {
					const tx = await Transaction.upsert({
						txHash: payload.params.result.transactionHash,
						txData: decoded
					});
					console.log(tx);
				} catch (err) {
					console.log(err);
				}
			}
		}
	});

	// const currentBlock = await ethersProvider.getBlockNumber();
	// const transactions = (await ethersProvider.getBlock(currentBlock)).transactions;

	return json({
		EngineStarted: true
		// transactions: transactions.slice(0, 10)
	});
};
