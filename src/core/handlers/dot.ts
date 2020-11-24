import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import cryptoRandom from "crypto-random-string";

const environment = process.env.NODE_ENV;

const formats = {
 development: 42,
 production: 0,
 test: 42,
 staging: 42
};

const ss58Format = formats[environment];
const provider = new WsProvider("wss://rpc.polkadot.io");
const promise = () => ApiPromise.create({ provider });

export class DOT {
 static async generateAddress(
  name: string,
  seed: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const keyring = new Keyring({ type: "sr25519", ss58Format });
   const randomString = cryptoRandom({ length: 20 });
   const firstPath = environment === "production" ? seed : "";
   const pair = keyring.createFromUri(firstPath + "//" + randomString, {
    name
   });
   const key = pair.toJson(randomString);
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: pair.address,
     key,
     password: randomString
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
   const api = await promise();
   const account = await api.query.system.account(address);
   const { data: balance } = account;
   // console.log("dots: " + balance.free.toNumber());
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: balance.free.toNumber()
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async sendToken(
  from: string,
  to: string,
  value: number
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const api = await promise();
   const keyring = new Keyring({ type: "sr25519", ss58Format });
   const pair = keyring.addFromAddress(from);
   const txHash = await api.tx.balances.transfer(to, value).signAndSend(pair);
   return Promise.resolve({
    statusCode: 200,
    payload: {
     hash: txHash.toString()
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 // static async getTransactions(address: string) {
 //  try {
 //   const api = await promise();
 //   api.tx.
 //   const account = await api.query.system.account(address);
 //  } catch (error) {}
 // }
}