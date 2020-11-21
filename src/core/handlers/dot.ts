import { ApiPromise, Keyring } from "@polkadot/api";
import cryptoRandom from "crypto-random-string";

const environment = process.env.NODE_ENV;

const formats = {
 development: 42,
 production: 0,
 test: 42,
 staging: 42
};

const ss58Format = formats[environment];
const promise = () => ApiPromise.create();

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
}
