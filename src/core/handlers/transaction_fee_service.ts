import rp from "request-promise";
import { Environment } from "../../env";
import { CRYPTO_API_COINS, options, COIN_NETWORK } from "./commons";
import { CustomError } from "../../custom";

export class TransactionFeeService {
 public static async getERCTransactionFee(
  fromAddress: string,
  toAddress: string,
  contract: string,
  value: number
 ): Promise<any> {
  const CONTRACT_GAS_PRICE_API: string =
   Environment.CRYPTO_API +
   "/v1/bc/eth/" +
   COIN_NETWORK["eth"][process.env.NODE_ENV] +
   "/contracts/gas-price";
  const TOKENS_GAS_LIMIT_API: string =
   Environment.CRYPTO_API +
   "/v1/bc/eth/" +
   COIN_NETWORK["eth"][process.env.NODE_ENV] +
   "/tokens/transfer/gas-limit";
  const [gasPriceResponse, gasLimitResponse] = await Promise.all([
   rp.get(CONTRACT_GAS_PRICE_API, { ...options }),
   rp.post(TOKENS_GAS_LIMIT_API, {
    ...options,
    body: { fromAddress, toAddress, contract, tokenAmount: value }
   })
  ]);
  const gasPrice: number = 25000000000;
  let gasPriceFlag: boolean = false;
  if (gasPriceResponse.statusCode >= 400) {
   console.error("Couldn't get gas price going ahead with 25000000000 wei");
   console.error(gasPriceResponse.body);
  } else {
   gasPriceFlag = true;
  }
  let gasLimit: number = 70000;
  if (gasLimitResponse.statusCode >= 400) {
   console.error("Couldn't get gas limit going ahead with 70000");
   console.error(gasLimitResponse.body);
  } else {
   gasLimit = parseFloat(gasLimitResponse.body.payload.gasLimit);
  }
  return Promise.resolve({
   //GasPrices converted to wei to be used in transferERC20 token api
   slow_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.slow) * 10 ** 9
    : gasPrice,
   standard_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.standard) * 10 ** 9
    : gasPrice,
   fast_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.fast) * 10 ** 9
    : gasPrice,
   gasLimit: gasLimit,
   unit: "wei"
  });
 }
 public static async getTransactionFee(
  ticker: string,
  fromAddress: string,
  toAddress: string,
  value: number
 ): Promise<any> {
  if (CRYPTO_API_COINS.includes(ticker)) {
   if (ticker === "eth") {
    const ethFee: any = await TransactionFeeService.getETHFee(
     fromAddress,
     toAddress,
     value
    );
    return Promise.resolve(ethFee);
   } else {
    const nonEthFee: any = await TransactionFeeService.getNonETHFee(
     ticker,
     fromAddress,
     toAddress,
     value
    );
    return Promise.resolve(nonEthFee);
   }
  } else {
   // Currently tron incurs 0 transaction fee
   // this could change with inclusion of other crypto currency
   return Promise.resolve({
    min_fee: 0,
    avg_fee: 0,
    max_fee: 0,
    slow_fee: 0,
    standard_fee: 0,
    fast_fee: 0,
    unit: ticker
   });
  }
 }

 private static async getNonETHFee(
  ticker: string,
  fromAddress: string,
  toAddress: string,
  value: number
 ): Promise<any> {
  const TX_FEE_API: string =
   Environment.CRYPTO_API +
   "/v1/bc/" +
   ticker +
   "/" +
   COIN_NETWORK[ticker][process.env.NODE_ENV] +
   "/txs/fee";
  const TX_SIZE_API: string =
   Environment.CRYPTO_API +
   "/v1/bc/" +
   ticker +
   "/" +
   COIN_NETWORK[ticker][process.env.NODE_ENV] +
   "/txs/size";
  const [feeResponse, sizeResponse] = await Promise.all([
   rp.get(TX_FEE_API, { ...options }),
   rp.post(TX_SIZE_API, {
    ...options,
    body: {
     inputs: [
      {
       address: fromAddress,
       value: value
      }
     ],
     outputs: [
      {
       address: toAddress,
       value: value
      }
     ],
     fee: {
      address: fromAddress,
      value: 0.005 * value // 0.5 % of the value for the sake of API request It is not the actual fee
     }
    }
   })
  ]);
  if (feeResponse.statusCode >= 400 || sizeResponse.statusCode >= 400) {
   console.log("Couldn't get txn fee/size");
   console.log(feeResponse.body);
   console.log(sizeResponse.body);
   throw new CustomError(
    500,
    feeResponse.body.meta?.error.message ||
     sizeResponse.body.meta?.error.message ||
     "Couldn't get txn fee/size"
   );
  }
  const sizeInBytes: number = sizeResponse.body.payload.tx_size_bytes;
  return Promise.resolve({
   min_fee: parseFloat(feeResponse.body.payload.min),
   avg_fee: parseFloat(feeResponse.body.payload.average),
   max_fee: parseFloat(feeResponse.body.payload.max),
   slow_fee:
    ticker === "doge"
     ? parseFloat(feeResponse.body.payload.slow_fee_per_byte) * sizeInBytes * 2
     : (parseFloat(feeResponse.body.payload.slow_fee_per_byte) * sizeInBytes) /
       2,
   standard_fee:
    ticker === "doge"
     ? parseFloat(feeResponse.body.payload.standard_fee_per_byte) *
       sizeInBytes *
       2
     : (parseFloat(feeResponse.body.payload.standard_fee_per_byte) *
        sizeInBytes) /
       2,
   fast_fee:
    ticker === "doge"
     ? parseFloat(feeResponse.body.payload.fast_fee_per_byte) * sizeInBytes * 2
     : (parseFloat(feeResponse.body.payload.fast_fee_per_byte) * sizeInBytes) /
       2,
   unit: ticker,
   size: sizeResponse.body.payload.tx_size_bytes
  });
 }

 private static async getETHFee(
  fromAddress: string,
  toAddress: string,
  value: number
 ): Promise<any> {
  const GAS_PRICE_API: string =
   Environment.CRYPTO_API +
   "/v1/bc/eth/" +
   COIN_NETWORK["eth"][process.env.NODE_ENV] +
   "/txs/fee";
  const GAS_LIMIT_API: string =
   Environment.CRYPTO_API +
   "/v1/bc/eth/" +
   COIN_NETWORK["eth"][process.env.NODE_ENV] +
   "/txs/gas";
  const [gasPriceResponse, gasLimitResponse] = await Promise.all([
   rp.get(GAS_PRICE_API, { ...options }),
   rp.post(GAS_LIMIT_API, {
    ...options,
    body: { fromAddress, toAddress, value }
   })
  ]);
  const gasPrice: number = 21000000000;
  let gasPriceFlag: boolean = false;
  if (gasPriceResponse.statusCode >= 400) {
   console.error("Couldn't get gas price going ahead with 21000000000 wei");
   console.error(gasPriceResponse.body);
  } else {
   gasPriceFlag = true;
  }
  let gasLimit: number = 21000;
  if (gasLimitResponse.statusCode >= 400) {
   console.error("Couldn't get gas limit going ahead with 21000");
   console.error(gasLimitResponse.body);
  } else {
   gasLimit = parseFloat(gasLimitResponse.body.payload.gasLimit);
  }
  return Promise.resolve({
   //GasPrices converted to wei to be used in send token api
   min_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.min) * 10 ** 9
    : gasPrice,
   average_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.average) * 10 ** 9
    : gasPrice,
   max_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.max) * 10 ** 9
    : gasPrice,
   slow_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.slow) * 10 ** 9
    : gasPrice,
   standard_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.standard) * 10 ** 9
    : gasPrice,
   fast_gas_price: gasPriceFlag
    ? parseFloat(gasPriceResponse.body.payload.fast) * 10 ** 9
    : gasPrice,
   gasLimit: gasLimit,
   unit: "wei"
  });
 }
}
