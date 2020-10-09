import { Harmony } from "@harmony-js/core";
import { Environment } from "../../env";

const hmy = new Harmony(
 Environment.HARMONY[process.env.NODE_ENV]
);

export class HMY {
 static async createAddress(password: string): Promise<{ statusCode: number; payload: any; }> {
  const account = await hmy.wallet.createAccount(password);
  return Promise.resolve({
   statusCode: 201,
   payload: {
    address: account.bech32Address,
    balance: parseFloat(account.balance)
   }
  });
 }

 static async getAddressDetails(address: string): Promise<{ statusCode: number; payload: any; }> {
  const account = hmy.wallet.getAccount(address);
  return Promise.resolve({
   statusCode: 200,
   payload: {
    address: account.address,
    balance: parseFloat(account.balance)
   }
  });
 }

 static async sendToken(
  from: string,
  to: string, 
  value: number,
  gasLimit: string,
  shardID: number = 0,
  toShardID: number = 0
 ): Promise<{ statusCode: number; payload: any; }> {
  const tx = hmy.transactions.newTx({
   from, to, value, gasLimit, shardID, toShardID, gasPrice: new hmy.utils.Unit("100").asGwei().toWei()
  });
  return Promise.resolve({
   statusCode: 200,
   payload: tx
  });
 }

 static async signTransaction(tx: any): Promise<{ statusCode: number; payload: any; }> {
  const txn = await hmy.wallet.signTransaction(tx);
  return Promise.resolve({
   statusCode: 200,
   payload: txn
  });
 }
}
