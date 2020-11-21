import { BncClient, Transaction } from "@binance-chain/javascript-sdk";
import {
 SendMsg,
 SignInputOutput,
 StdSignMsg
} from "@binance-chain/javascript-sdk/lib/types";
import { CustomError } from "../../custom";
import { Environment } from "../../env";

const environment = process.env.NODE_ENV;
const client = new BncClient(Environment.BNB[environment]);

export class BNB {
 static async generateAddress(
  mnemonic: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const c = await client.initChain();
   const account = c.createAccountWithKeystore(mnemonic);
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: account.address,
     privateKey: account.privateKey
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
   const c = await client.initChain();
   const i = await c.getBalance(address);
   console.log(JSON.stringify(i));
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: parseFloat(i[0]?.free || "0")
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async sendToken(
  address: string,
  to: string,
  value: number,
  memo: string,
  pk: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const c = await client.initChain();
   const account = await c.getAccount(address);

   if (!account || (account && account.status >= 400))
    throw new CustomError(account?.status || 500, "Could not retrieve account");

   const outputs: SignInputOutput[] = [
    { address: to, coins: [{ denom: "BNB", amount: value }] },
    { address, coins: [{ denom: "BNB", amount: value }] }
   ];
   const baseMsg = new SendMsg(address, outputs);
   const data: StdSignMsg = {
    chainId: c.chainId,
    accountNumber: account.result?.account_number,
    sequence: account.result?.sequence,
    source: 1,
    memo,
    baseMsg
   };
   const tx = new Transaction(data);
   const txBytes = tx.sign(pk).serialize();
   const res = await c.sendRawTransaction(txBytes);

   if (res.status >= 400)
    throw new CustomError(res.status, "Could not send raw transaction");

   return Promise.resolve({
    statusCode: res.status,
    payload: {
     hash: res.result[0]?.hash
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
