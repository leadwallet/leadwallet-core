import { Environment } from "../../env";
import rp from "request-promise";

const COINGECKO_COINS_ROOT = "https://api.coingecko.com/api/v3/coins";
export const options = {
    simple: false,
    json: true,
    resolveWithFullResponse: true,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": Environment.CRYPTO_API_KEY
    }
};
// ALL_COINS is the list of supported coins as of now
export const ALL_COINS: Array<String> = ["btc","ltc","eth","dash","doge","tron","one"]
export const CRYPTO_API_COINS: Array<String> = ["btc","ltc","eth","dash","doge"]
export const COIN_NETWORK = {
    btc : {
        development: "testnet",
        production: "mainnet",
        test: "testnet",
        staging: "testnet"
    },
    ltc : {
        development: "testnet",
        production: "mainnet",
        test: "testnet",
        staging: "testnet"
    },
    dash : {
        development: "testnet",
        production: "mainnet",
        test: "testnet",
        staging: "testnet"
    },
    doge : {
        development: "testnet",
        production: "mainnet",
        test: "testnet",
        staging: "testnet"
    },
    eth : {
        development: "ropsten",
        production: "mainnet",
        test: "ropsten",
        staging: "ropsten"
    }
};

async function getCoins(): Promise<any> {
	const response = rp.get(COINGECKO_COINS_ROOT + "/list",{
		headers: {
			"Content-Type": "application/json"
		}});
		let coinsMap = new Map();
		const coinsList = response.body.payload;
		for (const coin of coinsList) {
			coinsMap.set(coin['symbol'],coin);
		}
		return Promise.resolve(coinsMap);
}

export const COINS_MAP = await getCoins();

async function getCoinsImageUrls(coins :Array<String>): Promise<Map<String,any>> {
	let coinsImageUrls: Map<String,any> = new Map();
	for (const coin of coins) {
		const response = await rp.get(COINGECKO_COINS_ROOT + "/" + COINS_MAP.get(coin)['id'] 
		+ "?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false",{
			headers: {
				"Content-Type": "application/json"
			}	
		});
		const imageUrls = response.body.payload.images;
		coinsImageUrls.set(coin, imageUrls);
	}
	return Promise.resolve(coinsImageUrls);
}

export const COINS_IMAGE_URLS = await getCoinsImageUrls(ALL_COINS)

