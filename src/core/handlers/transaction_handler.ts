import rp from "request-promise";
import { CustomError } from "../../custom";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";
export const BLOCK_EXPLORER_URL = "https://blockexplorer.one";
export const TEST_TRONSCAN_URL = "https://shasta.tronscan.org/#/transaction";
export const PROD_TRONSCAN_URL = "https://tronscan.org/#/transaction";
export class TransactionService {
	static async getTransactions(ticker: string, address: string): Promise<{ payload: any; statusCode: number }> {
		const api = Environment.CRYPTO_API + "/v1/bc/" + ticker + "/" + COIN_NETWORK[ticker][process.env.NODE_ENV] + "/address/"
														+ address + "/basic/transactions?index=0&limit=50";
        const response = await rp.get(api, { ...options });
        if (response.statusCode >= 400) {
            console.error(response.body)
            throw new CustomError(response.statusCode, response.body.meta.error.message);
        }
        return Promise.resolve({
            statusCode: response.statusCode,
            payload: response.body.payload
        });
    }
    static async getERC20Transactions(address: string): Promise<{ payload: any; statusCode: number }> {
        const api = Environment.CRYPTO_API + "/v1/bc/eth/" + COIN_NETWORK["eth"][process.env.NODE_ENV] + "/tokens/address/"
														+ address + "/transfers?limit=50";
        const response = await rp.get(api, { ...options });
        if (response.statusCode >= 400) {
            console.error(response.body)
            throw new CustomError(response.statusCode, response.body.meta.error.message);
        }
        return Promise.resolve({
            statusCode: response.statusCode,
            payload: response.body.payload
        });
    }
}