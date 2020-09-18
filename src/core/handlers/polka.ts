// import { Keyring, ApiPromise, WsProvider } from "@polkadot/api";
// import { Environment } from "../../env";

// const url = Environment.POLKA_URL[process.env.NODE_ENV];

// export class POLKA {
//  static async createAddress(recoveryPhrase: string, walletHash: string): Promise<{ payload: any; }> {
//   const keyring = new Keyring();
//   const pair = keyring.addFromMnemonic(recoveryPhrase, {
//    walletHash
//   });
//   const generatedPair = keyring.getPair(pair.address);
//   return Promise.resolve({
//    payload: {
//     address: generatedPair.address
//    }
//   });
//  }

//  static async getAddressDetails(address: string): Promise<{ payload: any; }> {
//   const provider = new WsProvider(url);
//   const api = await ApiPromise.create({ provider });
//   const account = await api.query.system.account(address);
//   return Promise.resolve({
//    payload: {
//     balance: account.data.free
//    }
//   });
//  }
// }
