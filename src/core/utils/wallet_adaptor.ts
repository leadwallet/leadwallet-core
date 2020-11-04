import { Wallet } from "../interfaces";
import { COINS_IMAGE_URLS, CURRENT_COINS, COINS_MAP } from "../handlers/commons";

import { CurrencyConverter } from "./currency_converter";
export class WalletAdaptor {
 static async convert(wallet: Wallet) : Promise<any> {
		const coinList: Array<any> = [];
		const contracts = wallet.eth.tokens.map((token: any) => (token.contract)).join();
		let currencyConverter = await CurrencyConverter.getInstance();
		const prices: Map<string,number> = currencyConverter.getAllPricesUSD();
		const tokenPrices: Array<any> = await currencyConverter.getTokenPriceInUSD(contracts);
		for (let index = 0; index < wallet.eth.tokens.length; index++) {
			wallet.eth.tokens[index]["rate_in_usd"] =  tokenPrices[index][wallet.eth.tokens[index]["contract"]];
		}
		for (const coin of CURRENT_COINS) {
			coinList.push({name: coin, rate_in_usd: prices.get(coin), coinFullName: COINS_MAP.get(coin)["name"], ...wallet[coin], image: COINS_IMAGE_URLS.get(coin)})
		}
		return Promise.resolve({
			privateKey: wallet.privateKey,
			publicKey: wallet.publicKey,
			balance: wallet.balance,
			hash: wallet.hash,
			coins: coinList
		});
	}
}
