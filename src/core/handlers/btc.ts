import rp from "request-promise";
import { Environment } from "../../env";

const options = {
 json: true,
 resolveWithFullResponse: true,
 headers: {
  "Content-Type": "application/json",
  "X-API-Key": Environment.CRYPTO_API_KEY
 }
};

const btcPath = "/v1/bc/btc/mainnet"
const BTCROOT = Environment.CRYPTO_API + btcPath;

export class BTC {
 static async createAddress(): Promise<{ payload: any; statusCode: number }> {
  const response = await rp.post(BTCROOT + "/address", { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload
  });
 }

 static async getAddressDetails(address: string): Promise<{ payload: any; statusCode: number }> {
  const response = await rp.get(BTCROOT + "/address" + address, { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload
  });
 }
}
