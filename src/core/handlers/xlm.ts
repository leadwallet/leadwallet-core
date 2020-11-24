import * as Stellar from "stellar-sdk";
import api from "node-fetch";

const environment = process.env.NODE_ENV;
const xlm = new Stellar.Server("");

export class XLM {
 static async generateAddress(): Promise<{ statusCode: number; payload: any }> {
  try {
   const keypair = Stellar.Keypair.random();
   if (environment !== "production") {
    const response = await api(
     `https://friendbot.stellar.org?addr=${encodeURIComponent(
      keypair.publicKey()
     )}`
    );
    const responseAsJson = await response.json();
    console.log("Successfully created test Stellar account\n", responseAsJson);
   }
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: keypair.publicKey(),
     privateKey: keypair.secret()
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
   const account = await xlm.loadAccount(address);
   const balance = account.balances
    .map(b => parseFloat(b.balance))
    .reduce((a, b) => a + b);

   return Promise.resolve({
    statusCode: 200,
    payload: { balance }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
