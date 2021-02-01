import * as bitcoin from "bitcoinjs-lib";
import rp from "request-promise";
import sb from "satoshi-bitcoin";
import { CustomError } from "../../custom";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const environment = process.env.NODE_ENV;
const network = bitcoin.networks[COIN_NETWORK.btc[environment]];
const blockCypherNetworks = {
 development: "test3",
 production: "main"
};
const bcn = blockCypherNetworks[environment] || "test3";
const EXPLORER = "https://api.blockcypher.com/v1/btc/" + bcn;
const CRYPTOAPI =
 Environment.CRYPTO_API +
 "/v1/bc/btc/" +
 COIN_NETWORK["btc"][process.env.NODE_ENV];

const nowNodes = {
 development: "https://btc-testnet.nownodes.io",
 production: "https://btc.nownodes.io"
};

const node = nowNodes[environment] || "https://btc-testnet.nownodes.io";

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
   return Promise.reject(new Error(error.message));
  }
 }

 static async getAddressDetails(
  address: string
 ): Promise<{ payload: any; statusCode: number }> {
  try {
   const response = await rp.get(EXPLORER + "/addrs/" + address, {
    ...options
   });

   if (response.statusCode >= 400)
    throw new CustomError(response.statusCode, response.body);
   // console.log(response.body);
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: response.body.address,
     balance: response.body.final_balance / (100 * 10 ** 6)
    }
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
  inputs: { address: string; value: number }[],
  outputs: { address: string; value: number }[],
  fee: { address: string; value: number },
  wif?: string
 ): Promise<{ payload: any; statusCode: number }> {
  try {
   const keypair = bitcoin.ECPair.fromWIF(wif, network);
   const payments = bitcoin.payments.p2wpkh({
    pubkey: keypair.publicKey,
    network
   });
   const pBase58 = bitcoin.payments.p2pkh({
    pubkey: keypair.publicKey,
    network
   });
   let address = payments.address;

   if (pBase58.address.toLowerCase() === inputs[0].address.toLowerCase())
    address = pBase58.address;
   // console.log("Address: " + payments.address);
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
     inputs: inputs.map(i => ({
      ...i,
      value: parseFloat(Number(i.value).toFixed(8))
     })),
     outputs: outputs.map(o => ({
      ...o,
      value: parseFloat(Number(o.value).toFixed(8))
     })),
     fee
    }
   });

   if (txPrepareResponse.statusCode >= 400)
    throw new CustomError(
     txPrepareResponse.statusCode,
     txPrepareResponse.body.meta.error.message
    );

   // console.log("Transaction hex: " + txPrepareResponse.body.payload.hex);

   const txDecoded = await rp.post(node, {
    ...options,
    headers: { "Content-Type": "application/json" },
    body: {
     API_KEY: Environment.NOW_NODES_API_KEY,
     jsonrpc: "2.0",
     id: "leadwallet",
     method: "decoderawtransaction",
     params: [txPrepareResponse.body.payload.hex]
    }
   });

   if (txDecoded.statusCode >= 400)
    throw new CustomError(txDecoded.statusCode, txDecoded.body.error);

   const txs = txDecoded.body;
   console.log(JSON.stringify(txs));
   console.log(txs.vin);

   // const unspentTxResponse = await rp.post(node, {
   //  ...options,
   //  headers: { "Content-Type": "application/json" },
   //  body: {
   //   API_KEY: Environment.NOW_NODES_API_KEY,
   //   jsonrpc: "2.0",
   //   id: "leadwallet",
   //   method: "gettxout",
   //   params: [txs.txid, txs.vout[0].n]
   //  }
   // });

   // if (unspentTxResponse.statusCode >= 400)
   //  throw new CustomError(
   //   unspentTxResponse.statusCode,
   //   unspentTxResponse.body.error
   //  );

   // const allUnspent = unspentTxResponse.body;
   // const unspentTxs = unspentTxResponse.body;

   // for (const unspent of allUnspent)
   //  if (unspent.amount > unspentTxs.amount) unspentTxs = unspent;

   // console.log(JSON.stringify(unspentTxs));
   // console.log("All unspent", unspentTxResponse.body.payload);

   const rawTxsResponse = await rp.post(node, {
    ...options,
    headers: { "Content-Type": "application/json" },
    body: {
     API_KEY: Environment.NOW_NODES_API_KEY,
     jsonrpc: "2.0",
     id: "leadwallet",
     method: "getrawtransaction",
     params: [txs.txid, true]
    }
   });

   if (rawTxsResponse.statusCode >= 400)
    throw new CustomError(rawTxsResponse.statusCode, rawTxsResponse.body.error);

   const rawHex = rawTxsResponse.body.hex;

   txb.addInput({
    hash: txs.txid,
    index: txs.vout[0].n,
    nonWitnessUtxo: Buffer.from(rawHex, "hex")
   });

   // const vOut = txs.vout[0];

   for (const vout of txs.vout)
    txb.addOutput({
     address: vout.scriptPubKey.addresses[0],
     value: sb.toSatoshi(parseFloat(vout.value))
    });

   // txb.addOutput({
   //  address: txs.vout[0].scriptPubKey.addresses[0],
   //  value: sb.toSatoshi(parseFloat(txs.vout[0].value))
   // });

   // txb.addOutput({
   //  address: txs.vout[1].scriptPubKey.addresses[0],
   //  value: sb.toSatoshi(parseFloat(txs.vout[1].value))
   // });

   const signed = txb.signInput(0, keypair);

   signed.validateSignaturesOfInput(0);
   const final = signed.finalizeAllInputs();

   const txn = final.extractTransaction();
   const hex = txn.toHex();

   // console.log(
   //  "tx inputs: " + JSON.stringify(txn.ins.map(i => i.hash.toString("hex")))
   // );

   // console.log("Tx Hex: " + hex);

   const broadcastResponse = await rp.post(node, {
    ...options,
    headers: { "Content-Type": "application/json" },
    body: {
     API_KEY: Environment.NOW_NODES_API_KEY,
     jsonrpc: "2.0",
     id: "leadwallet",
     method: "sendrawtransaction",
     params: [hex]
    }
   });

   if (broadcastResponse.statusCode >= 400)
    throw new CustomError(
     broadcastResponse.statusCode,
     broadcastResponse.body.error
    );

   const txId = broadcastResponse.body;

   return Promise.resolve({
    statusCode: 200,
    payload: {
     hex,
     txId
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
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

 static async importWallet(
  privateKey: string
 ): Promise<{ payload: any; statusCode: number }> {
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
   return Promise.reject(new Error(error.message));
  }
 }
}
