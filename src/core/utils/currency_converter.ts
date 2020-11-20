import rp from "request-promise";
import { CustomError } from "../../custom";
import {
 SYMBOL_ID_MAPPING,
 ID_SYMBOL_MAPPING,
 COINS_MAP,
 CURRENT_COINS,
 ALL_COINS
} from "../handlers/commons";

const coinsList: string = Array.from(ID_SYMBOL_MAPPING.keys()).join(",");
const COINGECKO_SIMPLE_PRICE_ROOT =
 "https://api.coingecko.com/api/v3/simple/price";
const COINGECKO_TOKEN_PRICE_ROOT =
 "https://api.coingecko.com/api/v3/simple/token_price";
/*
	This class uses COINGECKO API to get the latest price in USD
	of all the supported coins in leadwallet. It keeps refreshing
	the prices every minute.
*/

export class CurrencyConverter {
 private static instance: CurrencyConverter;
 private currencyMap: Map<string, number>;
 private erc20TokensMap: Map<string, number>;
 private constructor() {}

 public static async getInstance(): Promise<CurrencyConverter> {
  if (!CurrencyConverter.instance) {
   CurrencyConverter.instance = new CurrencyConverter();
   CurrencyConverter.instance.currencyMap = new Map<string, number>();
   CurrencyConverter.instance.erc20TokensMap = new Map<string, number>();
   CurrencyConverter.instance.erc20TokensMap.set(
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
    1
   );
   await CurrencyConverter.refreshCurrencyMap();
   await CurrencyConverter.refreshERC20TokensMap();
   setInterval(async () => {
    CurrencyConverter.refreshCurrencyMap();
   }, 60000);
   setInterval(async () => {
    CurrencyConverter.refreshERC20TokensMap();
   }, 60000);
  }
  return Promise.resolve(CurrencyConverter.instance);
 }
 private static async refreshERC20TokensMap() {
  const contracts = Array.from(
   CurrencyConverter.instance.erc20TokensMap.keys()
  ).join();
  const response = await rp.get(
   COINGECKO_TOKEN_PRICE_ROOT +
    "/ethereum?contract_addresses=" +
    contracts +
    "&vs_currencies=usd",
   {
    json: true,
    resolveWithFullResponse: true,
    headers: {
     Accept: "application/json"
    }
   }
  );
  // console.log(response.body)
  if (response.statusCode >= 400) {
   console.error("Couldn't get all tokens price");
   console.error(response);
  } else {
   const values = response.body;
   for (const contract of contracts.split(",")) {
    console.log(values[contract]["usd"]);
    CurrencyConverter.instance.erc20TokensMap.set(
     contract,
     values[contract]["usd"]
    );
   }
  }
 }

 private static async refreshCurrencyMap() {
  const response = await rp.get(
   COINGECKO_SIMPLE_PRICE_ROOT + "?ids=" + coinsList + "&vs_currencies=USD",
   {
    headers: {
     "Content-Type": "application/json"
    }
   }
  );
  const priceData = JSON.parse(response);
  for (const symbol of CURRENT_COINS) {
   CurrencyConverter.instance.currencyMap.set(
    symbol,
    priceData[SYMBOL_ID_MAPPING.get(symbol)]["usd"]
   );
  }
 }

 public getAllPricesUSD(): Map<string, number> {
  return CurrencyConverter.instance.currencyMap;
 }

 public getPriceInUSD(id: string): number {
  return CurrencyConverter.instance.currencyMap.has(id)
   ? CurrencyConverter.instance.currencyMap.get(id)
   : 0;
 }
 // TODO
 public async getTokenPriceInUSD(contracts: string): Promise<Array<any>> {
  let responseValues = [];
  let newContracts = [];
  for (const contract of contracts.split(",")) {
   if (CurrencyConverter.instance.erc20TokensMap.has(contract)) {
    const value = {};
    value[contract] = CurrencyConverter.instance.erc20TokensMap.get(contract);
    responseValues.push(value);
   } else {
    newContracts.push(contract);
   }
  }
  if (newContracts.length > 0) {
   const response = await rp.get(
    COINGECKO_TOKEN_PRICE_ROOT +
     "/ethereum?contract_addresses=" +
     newContracts.join() +
     "&vs_currencies=usd",
    {
     simple: false,
     json: true,
     resolveWithFullResponse: true,
     headers: {
      Accept: "application/json"
     }
    }
   );
   if (response.statusCode >= 400) {
    console.error(response);
    throw new CustomError(
     response.statusCode,
     "Couldn't get usd conversion for " + newContracts
    );
   }
   const values = response.body;
   for (const contract of newContracts) {
    if (values[contract]) {
     const value = {};
     console.log(contract);
     console.log(values);
     value[contract] = values[contract]["usd"];
     CurrencyConverter.instance.erc20TokensMap.set(
      contract,
      values[contract]["usd"]
     );
     responseValues.push(value);
    }
   }
  }
  return Promise.resolve(responseValues);
 }
}
