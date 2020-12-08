import { Zilliqa } from "@zilliqa-js/zilliqa";
import {
 toBech32Address,
 getAddressFromPrivateKey,
 fromBech32Address
} from "@zilliqa-js/crypto";
import { bytes, units, Long } from "@zilliqa-js/util";
import BN from "bn.js";
import hasher from "crypto-js";
import createRandomString from "crypto-random-string";
import rp from "request-promise";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const environment = process.env.NODE_ENV;

const testnet = "https://dev-api.zilliqa.com";
const mainnet = "https://api.zilliqa.com";

const apis = {
 development: testnet,
 production: mainnet,
 test: testnet,
 staging: testnet
};

const zil = new Zilliqa(apis[environment]);
const txQuery =
 Environment.CRYPTO_API + "/v1/bc/zil/" + COIN_NETWORK["zil"][environment];

export class ZIL {
 static async generateAddress(): Promise<{ statusCode: number; payload: any }> {
  try {
   const random = createRandomString({ length: 15 });
   const privateKey = hasher.SHA256(random).toString();
   const address = toBech32Address(getAddressFromPrivateKey(privateKey));
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address,
     privateKey
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async getAddressDetails(
  address: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const z = await zil.blockchain.getBalance(address);
   // console.log(z);
   const balance = parseFloat(z.result?.balance.toString() || "0") / 10 ** 12;
   return Promise.resolve({
    statusCode: 200,
    payload: { balance }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async sendToken(
  pk: string,
  to: string,
  value: number
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const minGasPrice = await zil.blockchain.getMinimumGasPrice();
   const chainId = await zil.network.GetNetworkId();
   const version = bytes.pack(parseInt(chainId.result), 1);
   let gas = units.toQa("2000", units.Units.Li);
   const isSufficient = gas.gte(new BN(minGasPrice.result));

   if (!isSufficient) gas = units.toQa(minGasPrice.result, units.Units.Li);

   zil.wallet.addByPrivateKey(pk);

   console.log("ZILLIQA TX VERSION ===== " + version);

   const tx = await zil.blockchain.createTransaction(
    zil.transactions.new(
     {
      version,
      toAddr: fromBech32Address(to),
      amount: new BN(units.toQa(value.toString(), units.Units.Zil)),
      gasPrice: gas,
      gasLimit: Long.fromNumber(1)
     },
     false
    )
   );

   return Promise.resolve({
    statusCode: 200,
    payload: {
     hash: "0x" + tx.hash
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async getTransactions(
  address: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const res = await rp.get(
    txQuery + "/address/" + address + "/transactions?index=0&limit=50",
    { ...options }
   );

   if (res.statusCode >= 400) throw new Error(res.body.meta.error.message);

   const mappedTxs = res.body.payload
    ? res.body.payload.map((tx: any) => ({
       from: tx.from,
       to: tx.to,
       nonce: tx.nonce,
       amount:
        tx.from.toLowerCase() === address.toLowerCase()
         ? "-" + parseFloat(tx.value)
         : "+" + parseFloat(tx.value),
       hash: tx.hash,
       date: tx.datetime,
       status: tx.confirmations > 0 ? "Confirmed" : "Pending"
      }))
    : [];

   return Promise.resolve({
    statusCode: 200,
    payload: mappedTxs
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
