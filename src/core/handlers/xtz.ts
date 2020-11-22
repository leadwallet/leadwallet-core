import { KeyStoreUtils } from "conseiljs-softsigner";
import { TezosToolkit } from "@taquito/taquito";

const tezos = new TezosToolkit("");

export class XTZ {
 static async generateAddress(
  mnemonic: string,
  password: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const keystore = await KeyStoreUtils.generateIdentity(
    14,
    password,
    mnemonic
   );
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: keystore.publicKeyHash,
     privateKey: keystore.secretKey
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error));
  }
 }
}
