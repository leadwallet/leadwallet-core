import rp from "request-promise";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const dogePath = "/v1/bc/doge/" + COIN_NETWORK["doge"][process.env.NODE_ENV];
const DOGEROOT = Environment.CRYPTO_API + dogePath;

export class DOGE {
 static async createAddress(): Promise<{ payload: any; statusCode: number }> {
  try {
   const response = await rp.post(DOGEROOT + "/address", { ...options });

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

 static async getAddressDetails(
  address: string
 ): Promise<{ payload: any; statusCode: number }> {
  try {
   const response = await rp.get(DOGEROOT + "/address/" + address, {
    ...options
   });

   if (response.statusCode >= 400)
    throw new Error(response.body.meta.error.message);

   return Promise.resolve({
    statusCode: 200,
    payload: response.body.payload
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
   const response = await rp.post(DOGEROOT + "/txs/create", {
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

   // console.log(response.body);

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
   const response = await rp.post(DOGEROOT + "/txs/sign", {
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
   const response = await rp.post(DOGEROOT + "/txs/send", {
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
