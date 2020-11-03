import rp from "request-promise";
import { CustomError } from "../../custom";
import { SYMBOL_ID_MAPPING, ID_SYMBOL_MAPPING, COINS_MAP, CURRENT_COINS, ALL_COINS } from "../handlers/commons";

const coinsList: string = Array.from(ID_SYMBOL_MAPPING.keys()).join(",");
const COINGECKO_SIMPLE_PRICE_ROOT = "https://api.coingecko.com/api/v3/simple/price";
const COINGECKO_TOKEN_PRICE_ROOT = "https://api.coingecko.com/api/v3/simple/token_price";
/*
	This class uses COINGECKO API to get the latest price in USD
	of all the supported coins in leadwallet. It keeps refreshing
	the prices every minute.
*/

export class CurrencyConverter {
	private static instance: CurrencyConverter;
	private currencyMap: Map<string,number>;

	private constructor() {}

	public static async getInstance(): Promise<CurrencyConverter> {
		if(!CurrencyConverter.instance) {
			CurrencyConverter.instance = new CurrencyConverter();
			CurrencyConverter.instance.currencyMap = new Map<string,number>();
			await CurrencyConverter.refreshCurrencyMap();
			setInterval(async() => {CurrencyConverter.refreshCurrencyMap()},60000);
		}
		return Promise.resolve(CurrencyConverter.instance);
	}

	public static async refreshCurrencyMap() {
		const response = await rp.get(COINGECKO_SIMPLE_PRICE_ROOT+"?ids="+coinsList+"&vs_currencies=USD",{
			headers: {
				"Content-Type": "application/json"
			}
		});
		const priceData = JSON.parse(response);
		for (const symbol of CURRENT_COINS) {
			CurrencyConverter.instance.currencyMap.set(symbol,priceData[SYMBOL_ID_MAPPING.get(symbol)]["usd"]);
		}
	}
	
	public getAllPricesUSD() : Map<string,number> {
		return CurrencyConverter.instance.currencyMap;
	}

	public getPriceInUSD(id: string) : number {
		return CurrencyConverter.instance.currencyMap.has(id) ? CurrencyConverter.instance.currencyMap.get(id) : 0;
	}
	// TODO
	public async getTokenPriceInUSD(contract: string) : Promise<number> {
		const response = await rp.get(COINGECKO_TOKEN_PRICE_ROOT+"/ethereum?contract_addresses="+contract + "&vs_currencies=usd",{
			headers: {
				"Accept": "application/json"
			}
		});
		if(response.statusCode >= 400) {
			console.error(response);
			throw new CustomError(response.statusCode, "Couldn't get usd conversion for " + contract);
		}
		const value = JSON.parse(response)[contract]['usd'];
		return Promise.resolve(value);
	}
}