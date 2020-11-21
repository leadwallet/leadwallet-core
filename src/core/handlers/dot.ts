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
const provider = new WsProvider("");
const promise = () => ApiPromise.create({ provider });

export class DOT {
 static async generateAddress(
  name: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const keyring = new Keyring({ type: "sr25519", ss58Format });
   const randomString = cryptoRandom({ length: 20 });
   const possibleSeeds = {
    development: "//Alice",
    production: randomString,
    test: "//Alice",
    staging: "//Alice"
   };
   const pair = keyring.createFromUri(possibleSeeds[environment], { name });
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: pair.address,
     seed: possibleSeeds[environment]
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
