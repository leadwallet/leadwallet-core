import * as dashcore from "@dashevo/dashcore-lib";
import rp from "request-promise";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const environment = process.env.NODE_ENV;

const networks = {
 development: "testnet",
 production: "livenet"
};

const dashPath = "/v1/bc/dash/" + COIN_NETWORK["dash"][environment];
const DASHROOT = Environment.CRYPTO_API + dashPath;
const NOWNODES = "https://dash.nownodes.io";
const network = networks[environment] || "testnet";

export class DASH {
 static async createAddress(): Promise<{ payload: any; statusCode: number }> {
  try {
   const pk = dashcore.PrivateKey.fromRandom(network);
   const address = pk.toAddress(network).toString();
   const wif = pk.toWIF();
   const payload = { address, wif };

   return Promise.resolve({
    statusCode: 200,
    payload
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async getAddressDetails(
  address: string
 ): Promise<{ payload: any; statusCode: number }> {
  try {
   const response = await rp.get(NOWNODES + `/api/v2/address/${address}`, {
    ...options
   });

   if (response.statusCode >= 400)
    throw new Error(response.body.error);

   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: parseFloat(response.body.balance) / 10 ** 8
    }
   });
  } catch (error) {
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: 0
    }
   });
  }
 }

 static async sendToken(
  inputs: { address: string; value: number }[],
  outputs: { address: string; value: number }[],
  fee: { value: number }
 ): Promise<{ payload: any; statusCode: number }> {
  try {
   const response = await rp.post(DASHROOT + "/txs/create", {
    ...options,
    body: {
     inputs: inputs.map(i => ({
      ...i,
      value: parseFloat(Number(i.value).toFixed(8))
     })),
     outputs: outputs.map(o => ({
      ...o,
      value: parseFloat(Number(o.value).toFixed(8))
     })),
     fee
    }
   });

   if (response.statusCode >= 400)
    throw new Error(response.body.meta.error.message);

   return Promise.resolve({
    statusCode: 200,
    payload: response.body.payload
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async signTransaction(
  hex: string,
  wifs: Array<string>
 ): Promise<{ payload: any; statusCode: number }> {
  try {
   const response = await rp.post(DASHROOT + "/txs/sign", {
    ...options,
    body: { hex, wifs }
   });

   if (response.statusCode >= 400)
    throw new Error(response.body.meta.error.message);

   return Promise.resolve({
    statusCode: 200,
    payload: response.body.payload
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async broadcastTransaction(
  hex: string
 ): Promise<{ payload: any; statusCode: number }> {
  try {
   const response = await rp.post(DASHROOT + "/txs/send", {
    ...options,
    body: { hex }
   });

   if (response.statusCode >= 400)
    throw new Error(response.body.meta.error.message);

   return Promise.resolve({
    statusCode: 200,
    payload: response.body.payload
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
