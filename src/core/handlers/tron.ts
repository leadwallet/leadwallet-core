import Tronweb from "tronweb";
import { Environment } from "../../env";

const tWeb = new Tronweb({
 fullHost: Environment.TRON[process.env.NODE_ENV]
});

export class TRON {
 static async generateAddress(): Promise<{ payload: any; statusCode: number; }> {
  const account = await tWeb.createAccount();
  // console.log(account);
  return Promise.resolve({
   payload: {
    ...account.address,
    privateKey: account.privateKey
   },
   statusCode: 201
  });
 }

 static async getAddressDetails(address: string): Promise<{ payload: any; statusCode: number; }> {
  const balance = await tWeb.trx.getBalance(address);
  // console.log(balance);
  return Promise.resolve({
   payload: { balance },
   statusCode: 200
  });
 }

 static async sendToken(from: string, to: string, amount: number): Promise<{ payload: any; statusCode: number; }> {
  const payload = await tWeb.transactionBuilder.sendTrx(to, amount, from);
  // console.log(JSON.stringify(payload, null, 2));
  return Promise.resolve({
   payload,
   statusCode: 200
  });
 }

 static async signTransaction(transaction: any, pk: string): Promise<{ payload: any; statusCode: number; }> {
  const payload = await tWeb.trx.sign(transaction, pk);
  // console.log(JSON.stringify(payload));
  return Promise.resolve({
   payload,
   statusCode: 200
  });
 }
}
