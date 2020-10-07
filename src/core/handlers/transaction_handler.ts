import rp from "request-promise";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

export class TransactionService {
	static async getTransactions(ticker: string, address: string): Promise<{ payload: any; statusCode: number }> {
		const api = Environment.CRYPTO_API + "/v1/bc/" + ticker + "/" + COIN_NETWORK[ticker][process.env.NODE_ENV] + "/"
														+ address + "/transactions?index=0&limit=50";
		const response = await rp.get(api, { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload
  });
 }
}