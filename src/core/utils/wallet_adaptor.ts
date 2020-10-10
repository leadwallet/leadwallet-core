import { Wallet } from "../interfaces";
import { COINS_IMAGE_URLS, ALL_COINS } from "../handlers/commons";

export class WalletAdaptor {
 static async convert(wallet: Wallet) : Promise<any> {
		const coinList: Array<any> = [];
		for (const coin of ALL_COINS) {
   const c = coin === "trx" ? "tron" : coin;
			coinList.push({name: c, ...wallet[c], image: (await COINS_IMAGE_URLS).get(coin)})
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
