import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { mnemonicToMiniSecret, mnemonicGenerate } from "@polkadot/util-crypto";
import rp from "request-promise";
// import cryptoRandom from "crypto-random-string";

const environment = process.env.NODE_ENV;

const urls = {
 development: "wss://westend-rpc.polkadot.io",
 production: "wss://rpc.polkadot.io",
 test: "wss://westend-rpc.polkadot.io",
 staging: "wss://westend-rpc.polkadot.io"
};

const txScans = {
 development: "https://westend.subscan.io",
 production: "https://polkadot.subscan.io",
 test: "https://westend.subscan.io",
 staging: "https://westend.subscan.io"
};

const formats = {
 development: 42,
 production: 0,
 test: 42,
 staging: 42
};

const ss58Format: number = formats[environment];
const txScan: string = txScans[environment];
const provider = new WsProvider(urls[environment]);
const promise = () => ApiPromise.create({ provider });

export class DOT {
 static async generateAddress(
  name: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const keyring = new Keyring({ type: "sr25519", ss58Format });
   const mnemonic = mnemonicGenerate(12);
   const miniSecret = u8aToHex(mnemonicToMiniSecret(mnemonic));
   const pair = keyring.createFromUri(miniSecret, { name });
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: pair.address,
     privateKey: miniSecret
    }
   });
  } catch (error) {
   console.log(error);
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
   // await api.disconnect();
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: balance.free.toNumber() / 10 ** 12
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async sendToken(
  pk: string,
  to: string,
  value: number
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const api = await promise();
   const keyring = new Keyring({ type: "sr25519", ss58Format });
   const pair = keyring.addFromUri(pk);
   const txHash = await api.tx.balances
    .transfer(to, value * 10 ** 12)
    .signAndSend(pair);
   // await api.disconnect();
   return Promise.resolve({
    statusCode: 200,
    payload: {
     hash: txHash.toHex()
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
   const response = await rp.post(txScan + "/api/scan/transfers", {
    body: {
     row: 10,
     page: 1,
     address
    },
    simple: true,
    resolveWithFullResponse: true,
    json: true
   });

   // console.log(response.body);
   const mappedArray =
    response.body.data.transfers?.map((trx: any) => ({
     from: trx.from,
     to: trx.to,
     amount:
      trx.from.toLowerCase() === address.toLowerCase()
       ? "-" + parseFloat(trx.amount)
       : "+" + parseFloat(trx.amount),
     nonce: trx.nonce,
     status: trx.success ? "Confirmed" : "Pending",
     date: new Date(trx.block_timestamp),
     hash: trx.hash,
     fee: parseFloat(trx.fee) / 10 ** 12
    })) || [];
   return Promise.resolve({
    statusCode: 200,
    payload: mappedArray
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
