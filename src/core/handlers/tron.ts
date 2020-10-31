import Tronweb from "tronweb";
import { Environment } from "../../env";

const tWeb = new Tronweb({
 fullHost: Environment.TRON[process.env.NODE_ENV]
});

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
    payload: { balance },
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
   const payload = await tWeb.transactionBuilder.sendTrx(to, amount, from);
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
}
