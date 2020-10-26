import rp from "request-promise";
import { Environment } from "../../env";
import { CRYPTO_API_COINS, options, COIN_NETWORK } from "./commons";
import { CustomError } from "../../custom";

export class TransactionFeeService {
    public static async getTransactionFee(ticker : string, fromAddress: string, toAddress: string, value: number) : Promise<any> {
        if(CRYPTO_API_COINS.includes(ticker)) {
            if(ticker === "eth") {
				const ethFee: any = await TransactionFeeService.getETHFee(fromAddress,toAddress,value);
                return Promise.resolve(ethFee);
            } else {
				const nonEthFee: any = await TransactionFeeService.getNonETHFee(ticker,fromAddress,toAddress,value);
                return Promise.resolve(nonEthFee);
            }
        } else {
			// Currently tron incurs 0 transaction fee
			// this could change with inclusion of other crypto currency
            return Promise.resolve({
				"min_fee": 0,
				"avg_fee": 0,
				"max_fee": 0,
                "slow_fee": 0,
                "standard_fee": 0,
                "fast_fee": 0,
                "unit": ticker
            });
        }
        
	}
	
	private static async getNonETHFee(ticker: string, fromAddress: string, toAddress: string, value: number): Promise<any> {
		const TX_FEE_API: string = Environment.CRYPTO_API + "/v1/bc/" + ticker + "/" + COIN_NETWORK[ticker][process.env.NODE_ENV] +"/txs/fee";
		const TX_SIZE_API: string = Environment.CRYPTO_API + "/v1/bc/" + ticker + "/" + COIN_NETWORK[ticker][process.env.NODE_ENV] +"/txs/size";
		const [feeResponse,sizeResponse] = await Promise.all([
			rp.get(TX_FEE_API, {...options}),
			rp.post(TX_SIZE_API, {...options, body: {
				"inputs": [{
					"address": fromAddress,
					"value": value
				}],
				"outputs": [{
					"address": toAddress,
					"value": value
				}],
				"fee":  {
					"address" : fromAddress,
					"value": 0.005 * value // 0.5 % of the value for the sake of API request It is not the actual fee
				}
			}})
		]);
		if(feeResponse.statusCode >= 400 || sizeResponse.statusCode >= 400) {
			console.log("Couldn't get txn fee/size");
			console.log(feeResponse.body);
			console.log(sizeResponse.body);
			throw new CustomError(500, "Couldn't get txn fee/size");
		}
		const sizeInBytes: number = sizeResponse.body.payload.tx_size_bytes;
		return Promise.resolve({
			"min_fee": parseFloat(feeResponse.body.payload.min_fee_per_byte)*sizeInBytes,
			"avg_fee": parseFloat(feeResponse.body.payload.average_fee_per_byte)*sizeInBytes,
			"max_fee": parseFloat(feeResponse.body.payload.max_fee_per_byte)*sizeInBytes,
			"slow_fee": parseFloat(feeResponse.body.payload.slow_fee_per_byte)*sizeInBytes,
			"standard_fee": parseFloat(feeResponse.body.payload.standard_fee_per_byte)*sizeInBytes,
			"fast_fee": parseFloat(feeResponse.body.payload.fast_fee_per_byte)*sizeInBytes,
			"unit": ticker
		});
	}

	private static async getETHFee(fromAddress: string, toAddress: string, value: number): Promise<any> {
		const GAS_PRICE_API: string = Environment.CRYPTO_API + "/v1/bc/eth/" + COIN_NETWORK["eth"][process.env.NODE_ENV] +"/txs/fee";
		const GAS_LIMIT_API: string = Environment.CRYPTO_API + "/v1/bc/eth/" + COIN_NETWORK["eth"][process.env.NODE_ENV] +"/txs/gas";
		const [gasPriceResponse,gasLimitResponse] = await Promise.all([
			rp.get(GAS_PRICE_API, {...options}),
			rp.post(GAS_LIMIT_API, {...options, body: {"fromAddress": fromAddress, "toAddress": toAddress, "value": value}})
		]);
		if(gasPriceResponse.statusCode >= 400 || gasLimitResponse.statusCode>= 400) {
			console.log("Couldn't get gas price/limit");
			console.log(gasPriceResponse);
			console.log(gasLimitResponse);
			throw new CustomError(500, "Couldn't get gas price/limit")
		}
		return Promise.resolve({
			"min_gas_price" : parseFloat(gasPriceResponse.body.payload.min),
			"average_gas_price" : parseFloat(gasPriceResponse.body.payload.average),
			"max_gas_price": parseFloat(gasPriceResponse.body.payload.max),
			"slow_gas_price" : parseFloat(gasPriceResponse.body.payload.slow),
			"standard_gas_price" : parseFloat(gasPriceResponse.body.payload.standard),
			"fast_gas_price": parseFloat(gasPriceResponse.body.payload.fast),
			"gasLimit" : parseFloat(gasLimitResponse.body.payload.gasLimit),
			"unit" : gasPriceResponse.body.payload.unit
		});
	}
}