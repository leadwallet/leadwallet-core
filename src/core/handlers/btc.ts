import * as bitcoin from "bitcoinjs-lib";
import rp from "request-promise";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const btcPath = "/v1/bc/btc/" + COIN_NETWORK["btc"][process.env.NODE_ENV];
const BTCROOT = Environment.CRYPTO_API + btcPath;

const network = bitcoin.networks[COIN_NETWORK.btc[process.env.NODE_ENV]];

export class BTC {
 static async createAddress(): Promise<{ payload: any; statusCode: number }> {
  try {
   const keypair = bitcoin.ECPair.makeRandom();
   const { address } = bitcoin.payments.p2wpkh({
    pubkey: keypair.publicKey,
    network
   });
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address,
     wif: keypair.toWIF(),
     privateKey: keypair.privateKey.toString("hex")
    }
   })
  } catch (error) {
   return Promise.reject(
    new Error(error.message)
   );
  }
 }

 static async getAddressDetails(address: string): Promise<{ payload: any; statusCode: number; }> {
  try {
   // const response = await rp.get("https://blockchain.info/rawaddr/" + address, { ...options });
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: address,
     balance: 0.00
    }
   });
  } catch (error) {
   return Promise.reject(
    new Error(error.message)
   );
  }
 }

 static async sendToken(
  inputs: { address: string; value: number; }[], 
  outputs: { address: string; value: number; }[],
  fee: { address: string; value: number; },
  data?: string
 ): Promise<{ payload: any; statusCode: number; }> {
  const response = await rp.post(BTCROOT + "/txs/create", {
   ...options,
   body: {
    inputs, outputs, fee, data
   }
  });
  // console.log(response.body);
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async signTransaction(
  hex: string, 
  wifs: Array<string>
 ): Promise<{ payload: any; statusCode: number }> {
  const response = await rp.post(BTCROOT + "/txs/sign", {
   ...options,
   body: { hex, wifs }
  });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async broadcastTransaction(hex: string): Promise<{ payload: any; statusCode: number }> {
  const response = await rp.post(BTCROOT + "/txs/send", {
   ...options,
   body: { hex }
  });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }
}
