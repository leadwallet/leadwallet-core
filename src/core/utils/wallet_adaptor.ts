import { Wallet } from "../interfaces";
import { COINS_IMAGE_URLS, CURRENT_COINS, COINS_MAP } from "../handlers/commons";

export class WalletAdaptor {
 static async convert(wallet: Wallet) : Promise<any> {
		const coinList: Array<any> = [];
		for (const coin of CURRENT_COINS) {
			coinList.push({name: coin, coinFullName: COINS_MAP.get(coin)["name"], ...wallet[coin], image: COINS_IMAGE_URLS.get(coin)})
		}
  return {
			privateKey: wallet.privateKey,
		 publicKey: wallet.publicKey,
			balance: wallet.balance,
			hash: wallet.hash,
			coins: coinList
  };
	}
}
