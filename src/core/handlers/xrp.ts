import { RippleAPI } from "ripple-lib";
import { Environment } from "../../env";

const environment = process.env.NODE_ENV;
// const test = environment === "development" || environment === "test";

const api = new RippleAPI({
 server: Environment.XRP[environment]
});

export class XRP {
 static async generateAddress(): Promise<{
  statusCode: number;
  payload: any;
 }> {
  try {
   await api.connect();

   const o = api.generateAddress();

   // console.log(o.xAddress);

   await api.disconnect();

   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: o.address,
     secret: o.secret
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
   await api.connect();

   const info = await api.getAccountInfo(address);
   const balance = parseFloat(info.xrpBalance);

   await api.disconnect();

   return Promise.resolve({
    statusCode: 200,
    payload: { balance }
   });
  } catch (error) {
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: 0
    }
   });
  }
 }

 static async sendToken(
  from: string,
  to: string,
  value: number,
  secret: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   await api.connect();

   const payment = {
    source: {
     address: from,
     amount: {
      value: value.toString(),
      currency: "XRP"
     }
    },
    destination: {
     address: to,
     minAmount: {
      value: value.toString(),
      currency: "XRP"
     }
    }
   };
   const tx = await api.preparePayment(from, payment);
   const signedTx = api.sign(tx.txJSON, secret);
   const submittedTx: any = await api.submit(signedTx.signedTransaction);

   console.log(submittedTx);

   await api.disconnect();

   return Promise.resolve({
    statusCode: 200,
    payload: {
     hash: submittedTx.tx_json.hash,
     hex: submittedTx.tx_json.TxnSignature
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
   await api.connect();

   const txs = await api.getTransactions(address);
   const mappedTxs = txs.map((t: any) => ({
    from: t.specification.source?.address,
    to: t.specification.destination?.address,
    amount:
     t.specification.source?.address === address
      ? "-" + t.outcome.deliveredAmount.value
      : "+" + t.outcome.deliveredAmount.value,
    status: t.outcome.result
     .replace(/tes\w*/, "Confirmed")
     .replace(/(tef|tel|ter|tec|tem)\w*/, "Failed"),
    hash: t.id,
    date: t.outcome.timestamp
   }));

   await api.disconnect();

   return Promise.resolve({
    statusCode: 200,
    payload: mappedTxs
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
