import { Environment } from "../../env";
import syncReq from "sync-request";
const COINGECKO_COINS_ROOT = "https://api.coingecko.com/api/v3/coins";
export const options = {
    simple: true,
    json: true,
    resolveWithFullResponse: true,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": Environment.CRYPTO_API_KEY
    }
};

// ALL_COINS is the list of top coins to be supported
export const ALL_COINS = ["abbc", "ada", "algo", "ant", "ar", "atom", "avax", "bal",
	"band", "bat", "bcd", "bch", "bnb", "bsv", "btc", "btg", "btt", "busd", "cel", 
	"celo", "ckb", "comp", "cro", "cvt", "dai", "dash", "dcr", "dgb", "doge", "dot", 
	"dx", "egld", "enj", "eos", "etc", "eth", "ewt", "ftt", "hbar", "hedg", "ht", "husd", 
	"hyn", "icx", "knc", "ksm", "lend", "leo", "link", "lrc", "lsk", "ltc", "luna", 
	"mana", "miota", "mkr", "nano", "neo", "nxm", "ocean", "okb", "omg", "ont", "oxt", 
	"pax", "pma", "qnt", "qtum", "ren", "rep", "rev", "rvn", "sc", "snx", "sol", "storj", 
	"stx", "sushi", "sxp", "theta", "tmtg", "trx", "tusd", "uma", "uni", "usdc", "usdt", 
	"vet", "waves", "wbtc", "xem", "xlm", "xmr", "xrp", "xtz", "yfi", "zb", "zec", "zil", "zrx"]
// CURRENT_COINS is the list of supported coins as of now
export const CURRENT_COINS: Array<string> = ["btc","ltc","eth","dash","doge","trx"]
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

function getCoins(): Map<string,any> {
	const response = syncReq('GET',COINGECKO_COINS_ROOT + "/list",{
		headers: {
			"Content-Type": "application/json"
		}
	}).getBody("utf-8");
	let coinsMap = new Map<string,any>();
	const coinsList = JSON.parse(response) as Array<any>;
	for (const coin of coinsList) {
		coinsMap.set(coin["symbol"],coin);
	}
	return coinsMap;
}

export const COINS_MAP: Map<string,any> = getCoins();

function getCoinsImageUrls(coins :Array<string>): Map<string,any> {
	let coinsImageUrls: Map<string,any> = new Map();
	for (const coin of coins) {
		const response = syncReq('GET',COINGECKO_COINS_ROOT + "/" + COINS_MAP.get(coin)["id"] 
		+ "?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false",{
			headers: {
				"Content-Type": "application/json"
			}	
		}).getBody("utf-8");
		const imageUrls = JSON.parse(response)["image"];
		coinsImageUrls.set(coin, imageUrls);
	}
	return coinsImageUrls;
}

export const COINS_IMAGE_URLS: Map<string,any> = getCoinsImageUrls(CURRENT_COINS);

function createSymbolToIdMapping() {
	let symbolIdMap = new Map<string,string>();
	let idSymbolMap = new Map<string,string>();
	for (const coin of CURRENT_COINS) {
		symbolIdMap.set(coin,COINS_MAP.get(coin)["id"]);
		idSymbolMap.set(COINS_MAP.get(coin)["id"],coin);
	}
	return [symbolIdMap,idSymbolMap];
}

export const [SYMBOL_ID_MAPPING, ID_SYMBOL_MAPPING] = createSymbolToIdMapping();

export function getExplorerLink(type: string, txHash: string) : string {
    return type == "trx"
      ? Environment.TRON_EXPLORER[process.env.NODE_ENV] + "/" + txHash
      : Environment.BLOCK_EXPLORER + "/" + type + "/" + COIN_NETWORK[type][process.env.NODE_ENV] + "/tx/" + txHash;
}