import Tronweb from "tronweb";
import rp from "request-promise";
import { Environment } from "../../env";
import { options } from "./commons";

const tWeb = new Tronweb({
 fullHost: Environment.TRON[process.env.NODE_ENV]
});

const API = {
 production: "https://api.trongrid.io/v1",
 development: "https://api.shasta.trongrid.io/v1",
 staging: "https://api.shasta.trongrid.io/v1",
 test: "https://api.shasta.trongrid.io/v1"
};

const EXPLORER = API[process.env.NODE_ENV];

export class TRON {
 static async generateAddress(): Promise<{ payload: any; statusCode: number; }> {
  try {
   const account = await tWeb.createAccount();
  // console.log(account);
   return Promise.resolve({
    payload: {
     ...account.address,
     privateKey: account.privateKey
    },
    statusCode: 201
   });
  } catch (error) {
   return Promise.resolve({
    payload: error,
    statusCode: 500
   });
  }
 }

 static async getAddressDetails(address: string): Promise<{ payload: any; statusCode: number; }> {
  try {
   const balance = await tWeb.trx.getBalance(address);
  // console.log(balance);
   return Promise.resolve({
    payload: { balance: balance / (10 ** 6) },
    statusCode: 200
   });
  } catch (error) {
   console.error(error)
   return Promise.resolve({
    payload: error,
    statusCode: 500
   });
  }
 }

 static async sendToken(from: string, to: string, amount: number): Promise<{ payload: any; statusCode: number; }> {
  try {
   const payload = await tWeb.transactionBuilder.sendTrx(to, amount * (10 ** 6), from);
   // console.log(JSON.stringify(payload, null, 2));
   return Promise.resolve({
    payload,
    statusCode: 200
   });
  } catch (error) {
   console.error(error);
   return Promise.resolve({
    payload: error,
    statusCode: 500
   });
  }
 }

 static async signTransaction(transaction: any, pk: string): Promise<{ payload: any; statusCode: number; }> {
  try {
   const signedTransaction = await tWeb.trx.sign(transaction, pk);
   const receipt = await tWeb.trx.sendRawTransaction(signedTransaction);
   //console.log(JSON.stringify(receipt));
   return Promise.resolve({
    payload: receipt,
    statusCode: 200
   });
  } catch (error) {
   console.error(error);
   return Promise.resolve({
    payload: error,
    statusCode: 500
   });
  }
 }

 static async getTransactions(address: string): Promise<{ payload: any; statusCode: number; }> {
  try {
   const trxResponse = await rp.get(EXPLORER + "/accounts/" + address + "/transactions", { ...options });
   const trxs: Array<any> = trxResponse.body.data.map(
    (item: any) => ({
     ...item,
     raw_data: {
      ...item.raw_data,
      contract: item.raw_data.contract.map(
       (c: any) => ({
         value: tWeb.address.toHex(address) === c.parameter.value.to_address ? "+" + c.parameter.value.amount / (10 ** 6) : "-" + c.parameter.value.amount / (10 ** 6),
         from: c.parameter.value.owner_address,
         to: c.parameter.value.to_address
       })
      )
     }
    })
   );

   return Promise.resolve({
    statusCode: 200,
    payload: trxs
   });
  } catch (error) {
   return Promise.reject(
    new Error(error.message)
   );
  }
 }
}
