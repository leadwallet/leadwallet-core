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

const ethPath = "/v1/bc/eth/mainnet";
const ETHROOT = Environment.CRYPTO_API + ethPath;

export class ETH {
 static async createAddress(phrase: string, id: string): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/account", {
   ...options,
   body: {
    password: phrase,
    id
   }
  });
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
}
