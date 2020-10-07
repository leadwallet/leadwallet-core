import rp from "request-promise";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const ethPath = "/v1/bc/eth/" + COIN_NETWORK["eth"][process.env.NODE_ENV];
const ETHROOT = Environment.CRYPTO_API + ethPath;

export class ETH {
 static async createAddress(body: any): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/account", { ...options, body });
  // console.log(JSON.stringify(response));
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload
  });
 }

 static async getAddressDetails(address: string): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.get(ETHROOT + "/address/" + address, { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload
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
   payload: response.body.payload
  });
 }

 static async broadcastTransaction() {}
}
