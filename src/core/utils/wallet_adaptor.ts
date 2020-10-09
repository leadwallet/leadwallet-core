import { Wallet } from "../interfaces";

export class WalletAdaptor {
 static convert(wallet: Wallet) : any {
  return {
			privateKey: wallet.privateKey,
		 publicKey: wallet.publicKey,
			balance: wallet.balance,
			hash: wallet.hash,
			coins: [{name: "btc", ...wallet.btc},{name: "eth", ...wallet.eth},{name: "ltc", ...wallet.ltc},
			{name: "dash", ...wallet.dash},{name: "doge", ...wallet.doge},{name: "tron", ...wallet.tron}, {name: "hmy", ...wallet.hmy}]
  };
	}
}
