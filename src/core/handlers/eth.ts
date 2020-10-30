import rp from "request-promise";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const ethPath = "/v1/bc/eth/" + COIN_NETWORK["eth"][process.env.NODE_ENV];
const ETHROOT = Environment.CRYPTO_API + ethPath;

export class ETH {
 static async createAddress(): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/address", { ...options });
  // console.log(JSON.stringify(response.body));
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async getAddressDetails(address: string): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.get(ETHROOT + "/address/" + address, { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async sendToken(
  body: { fromAddress: string; toAddress: string; gasPrice: number; gasLimit: number; value: number; password: string; nonce?: number; }
 ): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/txs/new", {
   ...options, body
  });
  // console.log(JSON.stringify(response));
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async transferERC20(
  fromAddress: string, 
  toAddress: string,
  contract: string,
  privateKey: string,
  gasPrice: number,
  gasLimit: number
 ): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/token/transfer", {
   ...options,
   body: {
    fromAddress, toAddress, privateKey, gasPrice, gasLimit, contract
   }
  });

  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async getERC20Tokens(address: string): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.get(ETHROOT + "/tokens/address/" + address, { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 // static async broadcastTransaction() {}
}
