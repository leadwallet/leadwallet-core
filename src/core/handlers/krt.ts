// import { LCDClient, Coin, MnemonicKey } from "@terra-money/terra.js";

// const terra = new LCDClient({
//  URL: "",
//  chainID: ""
// });

// export class KRT {
//  static async generateAddress(): Promise<{ statusCode: number; payload: any }> {
//   try {
//    const mnemonic = new MnemonicKey();
//    const wallet = terra.wallet(mnemonic);
//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      address: wallet.key.accAddress,
//      privateKey: wallet.key.accPubKey
//     }
//    });
//   } catch (error) {
//    return Promise.reject(new Error(error.message));
//   }
//  }
// }
