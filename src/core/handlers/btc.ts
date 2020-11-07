import * as bitcoin from "bitcoinjs-lib";
import rp from "request-promise";
import { CustomError } from "../../custom";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const environment = process.env.NODE_ENV;
const network = bitcoin.networks[COIN_NETWORK.btc[environment]];
const blockCypherNetworks = {
 development: "test3",
 production: "main",
 test: "test3",
 staging: "test3"
};
const bcn = blockCypherNetworks[environment];
const EXPLORER = "https://api.blockcypher.com/v1/btc/" + bcn;
const CRYPTOAPI = Environment.CRYPTO_API + "/v1/bc/btc/" + COIN_NETWORK["btc"][process.env.NODE_ENV];

export class BTC {
 static async createAddress(): Promise<{ payload: any; statusCode: number }> {
  try {
   const keypair = bitcoin.ECPair.makeRandom({ network });
   const { address } = bitcoin.payments.p2wpkh({
    pubkey: keypair.publicKey,
    network
   });
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address,
     wif: keypair.toWIF(),
     privateKey: keypair.privateKey.toString("hex")
    }
   });
  } catch (error) {
   return Promise.reject(
    new Error(error.message)
   );
  }
 }

 static async getAddressDetails(address: string): Promise<{ payload: any; statusCode: number; }> {
  try {
   const response = await rp.get(EXPLORER + "/addrs/" + address, { ...options });
   
   if (response.statusCode >= 400)
    throw new CustomError(response.statusCode, response.body);
   // console.log(response.body);
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: response.body.address,
     balance: response.body.final_balance / (100 * (10 ** 6))
    }
   });
  } catch (error) {
   return Promise.reject(
    new Error(error.message)
   );
  }
 }

 static async sendToken(
  inputs: { address: string; value: number; }[], 
  outputs: { address: string; value: number; }[],
  fee: { address: string; value: number; },
  wif?: string
 ): Promise<{ payload: any; statusCode: number; }> {
  try {
   const keypair = bitcoin.ECPair.fromWIF(wif, network);
   const payments = bitcoin.payments.p2wpkh({
    pubkey: keypair.publicKey,
    network
   });
   const txb = new bitcoin.Psbt({ network });
   // const feeValue = outputs.map(o => o.value)
   //  .concat(localFee.value)
   //  .reduce((prev, current) => prev + current);
   // const inputValue = inputs.map(i => i.value)
   //  .concat(localFee.value)
   //  .reduce((prev, current) => prev + current);
   const txPrepareResponse = await rp.post(CRYPTOAPI + "/txs/create", {
    ...options,
    body: {
     inputs,
     outputs,
     fee
    }
   });

   if (txPrepareResponse.statusCode >= 400)
    throw new CustomError(txPrepareResponse.statusCode, txPrepareResponse.body.meta.error.message);

   console.log("Transaction hex: " + txPrepareResponse.body.payload.hex);

   const txDecoded = await rp.post(CRYPTOAPI + "/txs/decode", {
    ...options,
    body: {
     hex: txPrepareResponse.body.payload.hex
    }
   });

   if (txDecoded.statusCode >= 400)
    throw new CustomError(txDecoded.statusCode, txDecoded.body.meta.error.message);

   const txs = txDecoded.body.payload;
   console.log(JSON.stringify(txs));
   console.log(txDecoded.body.payload.vin);

   const unspentTxResponse = await rp.get(CRYPTOAPI + "/address/" + payments.address + "/unspent-transactions", {
    ...options
   });

   if (unspentTxResponse.statusCode >= 400)
    throw new CustomError(unspentTxResponse.statusCode, unspentTxResponse.body.meta.error.message);

   const unspentTxs = unspentTxResponse.body.payload[0];

   console.log(unspentTxs);

   const rawTxsResponse = await rp.get(CRYPTOAPI + "/txs/raw/txid/" + unspentTxs.txid, {
    ...options
   });

   if (rawTxsResponse.statusCode >= 400)
    throw new CustomError(rawTxsResponse.statusCode, rawTxsResponse.body.meta.error.message);

   const rawHex = (rawTxsResponse.body.payload.hex);
   
   txb.addInput({
    hash: unspentTxs.txid,
    index: unspentTxs.vout,
    nonWitnessUtxo: Buffer.from(rawHex, "hex")
   });

   // const vOut = txs.vout[0];

   for (const vOut of txs.vout)
    if (!vOut.scriptPubKey.addresses.includes(inputs[0].address))
     txb.addOutput({
      address: vOut.scriptPubKey.addresses[0],
      value: parseFloat(vOut.value) * 100 * (10 ** 6)
     });

   const txbBase64 = txb.toBase64();
   const signer = bitcoin.Psbt.fromBase64(txbBase64);

   const s = txb.combine(signer);
   const s2 = s.signInput(0, keypair);
   s2.validateSignaturesOfInput(0);
   const s3 = s2.finalizeAllInputs();

   const txn = s3.extractTransaction();
   const hex = txn.toHex();

   console.log("tx inputs: " + JSON.stringify(txn.ins.map(i => i.hash.toString("hex"))));

   console.log("Tx Hex: " + hex);

   const broadcastResponse = await rp.post(CRYPTOAPI + "/txs/send", {
    ...options,
    body: {
     hex
    }
   });

   if (broadcastResponse.statusCode >= 400)
    throw new CustomError(broadcastResponse.statusCode, broadcastResponse.body.meta.error.message);

   const txId = broadcastResponse.body.payload.txid;

   return Promise.resolve({
    statusCode: 200,
    payload: {
     hex,
     txId
    }
   });
  } catch (error) {
   return Promise.reject(
    new Error(error.message)
   );
  }
 }

 // static async signTransaction(
 //  hex: string, 
 //  wifs: Array<string>
 // ): Promise<{ payload: any; statusCode: number }> {
 //  const response = await rp.post(BTCROOT + "/txs/sign", {
 //   ...options,
 //   body: { hex, wifs }
 //  });
 //  return Promise.resolve({
 //   statusCode: response.statusCode,
 //   payload: response.body.payload || response.body.meta.error.message
 //  });
 // }

 // static async broadcastTransaction(hex: string): Promise<{ payload: any; statusCode: number }> {
 //  const response = await rp.post(BTCROOT + "/txs/send", {
 //   ...options,
 //   body: { hex }
 //  });
 //  return Promise.resolve({
 //   statusCode: response.statusCode,
 //   payload: response.body.payload || response.body.meta.error.message
 //  });
 // }

 static async importWallet(privateKey: string): Promise<{ payload: any; statusCode: number }> {
  try {
   const keyPair = bitcoin.ECPair.fromPrivateKey(
    Buffer.from(privateKey, "hex"),
    network
   );
   const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network
   });

   return Promise.resolve({
    statusCode: 200,
    payload: {
     address,
     privateKey: keyPair.privateKey.toString("hex"),
     wif: keyPair.toWIF()
    }
   });
  } catch (error) {
   return Promise.reject(
    new Error(error.message)
   );
  }
 }
}
