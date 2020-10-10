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
export const ALL_COINS: Array<string> = ["btc","ltc","eth","dash","doge","trx","one"]
export const CRYPTO_API_COINS: Array<string> = ["btc","ltc","eth","dash","doge"]
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
	const response = await rp.get(COINGECKO_COINS_ROOT + "/list",{
  resolveWithFullResponse: true,
  json: true,
		headers: {
			"Content-Type": "application/json"
		}});
  let coinsMap = new Map();
  // console.log(response.body);
  const coinsList = Object.keys(response.body)
   .map(k => response.body[k]);
		for (const coin of coinsList) {
   // if (ALL_COINS.includes(coin.symbol)) {
   //  console.log(coin.symbol)
   // }
			coinsMap.set(coin['symbol'],coin);
		}
		return Promise.resolve(coinsMap);
}

export const COINS_MAP = getCoins();

async function getCoinsImageUrls(coins :Array<String>): Promise<Map<String,any>> {
	let coinsImageUrls: Map<String,any> = new Map();
	for (const coin of coins) {
		const response = await rp.get(COINGECKO_COINS_ROOT + "/" + (await COINS_MAP).get(coin)['id'] 
		+ "?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false",{
   resolveWithFullResponse: true,
   json: true,
			headers: {
				"Content-Type": "application/json"
			}	
  });
  // console.log(response.body);
  const imageUrls = response.body.image.small;
  // console.log(imageUrls);
		coinsImageUrls.set(coin, imageUrls);
	}
	return Promise.resolve(coinsImageUrls);
}

export const COINS_IMAGE_URLS = getCoinsImageUrls(ALL_COINS);

async function createSymbolToIdMapping() {
	let symbolIdMap = new Map();
	let idSymbolMap = new Map();
	for (const coin of ALL_COINS) {
  // console.log("--------", (await COINS_MAP).get(coin));
		symbolIdMap.set(coin, (await COINS_MAP).get(coin)['id']);
		idSymbolMap.set((await COINS_MAP).get(coin)['id'],coin);
	}
	return [symbolIdMap,idSymbolMap];
}

export const m = createSymbolToIdMapping();
