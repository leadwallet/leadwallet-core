import rp from "request-promise";
import { Environment } from "../../env";

const options = {
 simple: false,
 json: true,
 resolveWithFullResponse: true,
 headers: {
  "Content-Type": "application/json",
  "X-API-Key": Environment.CRYPTO_API_KEY
 }
};

const COIN_NETWORK = {
 development: "ropsten",
 test: "rinkeby",
 production: "mainnet"
};

const ethPath = "/v1/bc/eth/" + COIN_NETWORK[process.env.NODE_ENV];
const ETHROOT = Environment.CRYPTO_API + ethPath;

export class ETH {
 static async createAddress(): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/address", { ...options });
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
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload
  });
 }

 static async broadcastTransaction() {}
}
