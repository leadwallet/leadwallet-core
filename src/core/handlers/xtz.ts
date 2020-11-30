import { KeyStoreUtils, SoftSigner } from "conseiljs-softsigner";
import { TezosToolkit } from "@taquito/taquito";
import { TezBridgeSigner } from "@taquito/tezbridge-signer";
import {
 ConseilDataClient,
 ConseilFunction,
 ConseilOperator,
 ConseilQueryBuilder,
 ConseilSortDirection,
 registerFetch,
 registerLogger,
 TezosMessageUtils,
 TezosNodeWriter
} from "conseiljs";
import apiFetch from "node-fetch";
import log from "loglevel";
import db from "../../db";
import { Environment } from "../../env";

const { DBWallet } = db;
const environment = process.env.NODE_ENV;
const server = Environment.XTZ[environment];
const apiKey = Environment.CONSEIL_API_KEY;
const tezosNode = "https://mainnet-tezos.giganode.io";

// console.log(server);

const logger = log.getLogger("conseiljs");
logger.setLevel("debug", false);

const tezos = new TezosToolkit(tezosNode);

registerLogger(logger);
registerFetch(apiFetch);

export class XTZ {
 static async generateAddress(
  password: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const mnemonic = KeyStoreUtils.generateMnemonic();
   const keystore = await KeyStoreUtils.generateIdentity(
    14,
    password,
    mnemonic
   );
   // console.log(keystore);
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: keystore.publicKeyHash,
     privateKey: keystore.secretKey
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error));
  }
 }

 static async getAddressDetails(
  address: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   // console.log("Taah");
   const result = await tezos.tz.getBalance(address);

   console.log(JSON.stringify(result));
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: (result?.toNumber() || 0) / 10 ** 6
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async sendToken(
  globalPrivateKey: string,
  globalPublicKey: string,
  to: string,
  amount: number,
  secret: string,
  fee: number
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const keystore = await KeyStoreUtils.restoreIdentityFromSecretKey(secret);
   const signer = await SoftSigner.createSigner(
    TezosMessageUtils.writeKeyWithHint(secret, "edsk")
   );
   const wallet = await DBWallet.getWallet(globalPrivateKey, globalPublicKey);

   if (wallet.xtz && !wallet.xtz.revealed) {
    const revealOperation = await TezosNodeWriter.sendKeyRevealOperation(
     tezosNode,
     signer,
     keystore
    );
    console.log("Tezos key revealed " + revealOperation.operationGroupID);
    wallet.xtz.revealed = true;
    await DBWallet.updateWallet(globalPrivateKey, wallet);
   }
   const tx = await TezosNodeWriter.sendTransactionOperation(
    tezosNode,
    signer,
    keystore,
    to,
    amount * 10 ** 6,
    fee * 10 ** 6
   );
   return Promise.resolve({
    statusCode: 200,
    payload: {
     hash: tx.operationGroupID
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
   const sendQuery = ConseilQueryBuilder.blankQuery();
   // const sendQuery2 = ConseilQueryBuilder.addFields(
   //  sendQuery,
   //  "block_level",
   //  "timestamp",
   //  "source",
   //  "destination",
   //  "amount",
   //  "fee",
   //  "operation_group_hash"
   // );
   const sendQuery2 = ConseilQueryBuilder.addPredicate(
    sendQuery,
    "kind",
    ConseilOperator.EQ,
    ["transaction"],
    false
   );
   const sendQuery3 = ConseilQueryBuilder.addPredicate(
    sendQuery2,
    "source",
    ConseilOperator.EQ,
    [address],
    false
   );
   const sendQuery4 = ConseilQueryBuilder.addPredicate(
    sendQuery3,
    "status",
    ConseilOperator.EQ,
    ["applied"],
    false
   );
   const sendQuery5 = ConseilQueryBuilder.addOrdering(
    sendQuery4,
    "block_level",
    ConseilSortDirection.ASC
   );
   const sendQuery6 = ConseilQueryBuilder.setLimit(sendQuery5, 100);

   const receiveQuery = ConseilQueryBuilder.blankQuery();
   // const receiveQuery2 = ConseilQueryBuilder.addFields(
   //  receiveQuery,
   //  "block_level",
   //  "timestamp",
   //  "source",
   //  "destination",
   //  "amount",
   //  "fee",
   //  "operation_group_hash"
   // );
   const receiveQuery2 = ConseilQueryBuilder.addPredicate(
    receiveQuery,
    "kind",
    ConseilOperator.EQ,
    ["transaction"],
    false
   );
   const receiveQuery3 = ConseilQueryBuilder.addPredicate(
    receiveQuery2,
    "destination",
    ConseilOperator.EQ,
    [address],
    false
   );
   const receiveQuery4 = ConseilQueryBuilder.addPredicate(
    receiveQuery3,
    "status",
    ConseilOperator.EQ,
    ["applied"],
    false
   );
   const receiveQuery5 = ConseilQueryBuilder.addOrdering(
    receiveQuery4,
    "block_level",
    ConseilSortDirection.ASC
   );
   const receiveQuery6 = ConseilQueryBuilder.setLimit(receiveQuery5, 100);

   const sendResult = await ConseilDataClient.executeEntityQuery(
    {
     url: server,
     apiKey,
     network: "delphinet"
    },
    "tezos",
    "mainnet",
    "operations",
    sendQuery6
   );

   const receiveResult = await ConseilDataClient.executeEntityQuery(
    {
     url: server,
     apiKey,
     network: "delphinet"
    },
    "tezos",
    "mainnet",
    "operations",
    receiveQuery6
   );

   const txs = sendResult
    .concat(receiveResult)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(val => ({
     from: val.source,
     to: val.destination,
     date: new Date(val.timestamp),
     amount:
      val.source.toLowerCase() === address.toLowerCase()
       ? "-" + val.amount / 10 ** 6
       : "+" + val.amount / 10 ** 6,
     hash: val.operation_group_hash,
     fee: val.fee / 10 ** 6,
     status: val.status === "applied" ? "Confirmed" : "Pending"
    }));

   console.log(txs);

   return Promise.resolve({
    statusCode: 200,
    payload: txs
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
