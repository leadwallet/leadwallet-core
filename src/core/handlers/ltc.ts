import rp from "request-promise";
import litecore from "litecore-lib";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const ltcPath = "/v1/bc/ltc/" + COIN_NETWORK["ltc"][process.env.NODE_ENV];
const LTCROOT = Environment.CRYPTO_API + ltcPath;

export class LTC {
 static async createAddress(): Promise<{ payload: any; statusCode: number }> {
  const response = await rp.post(LTCROOT + "/address", { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async getAddressDetails(address: string): Promise<{ payload: any; statusCode: number}> {
  const response = await rp.get(LTCROOT + "/address/" + address, { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async sendToken(
  inputs: { address: string; value: number; }[],
  outputs: { address: string; value: number; }[],
  fee: { value: number; }
 ): Promise<{ payload: any; statusCode: number }> {
  const response = await rp.post(LTCROOT + "/txs/create", {
   ...options,
   body: { inputs, outputs, fee }
  });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async signTransaction(hex: string, wifs: Array<string>): Promise<{ payload: any; statusCode: number; }> {
  const response = await rp.post(LTCROOT + "/txs/sign", {
   ...options,
   body: { hex, wifs }
  });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async broadcastTransaction(hex: string): Promise<{ payload: any; statusCode: number; }> {
  const response = await rp.post(LTCROOT + "/txs/send", {
   ...options,
   body: { hex }
  });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload
  });
 }
}
