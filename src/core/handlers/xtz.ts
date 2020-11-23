import { KeyStoreUtils, SoftSigner } from "conseiljs-softsigner";
// import { TezosToolkit } from "@taquito/taquito";
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
import { Environment } from "../../env";

const environment = process.env.NODE_ENV;
const server = Environment.XTZ[environment];
const apiKey = Environment.CONSEIL_API_KEY;

// console.log(server);

const logger = log.getLogger("conseiljs");
logger.setLevel("debug", false);

// const tezos = new TezosToolkit(server);

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
   const query = ConseilQueryBuilder.blankQuery();
   const query2 = ConseilQueryBuilder.addFields(query, "manager", "balance");
   const query3 = ConseilQueryBuilder.addPredicate(
    query2,
    "manager",
    ConseilOperator.EQ,
    [address]
   );
   const query4 = ConseilQueryBuilder.addPredicate(
    query3,
    "balance",
    ConseilOperator.GT,
    [0]
   );
   const query5 = ConseilQueryBuilder.addAggregationFunction(
    query4,
    "balance",
    ConseilFunction.sum
   );
   const query6 = ConseilQueryBuilder.setLimit(query5, 1);

   const result = await ConseilDataClient.executeEntityQuery(
    {
     url: server,
     network: "delphinet",
     apiKey
    },
    "tezos",
    "delphinet",
    "accounts",
    query6
   );

   console.log(JSON.stringify(result));
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: 0
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async sendToken(
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
   const tx = await TezosNodeWriter.sendTransactionOperation(
    server,
    signer,
    keystore,
    to,
    amount,
    fee
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
   const sendQuery2 = ConseilQueryBuilder.addFields(
    sendQuery,
    "block_level",
    "timestamp",
    "source",
    "destination",
    "amount",
    "fee"
   );
   const sendQuery3 = ConseilQueryBuilder.addPredicate(
    sendQuery2,
    "kind",
    ConseilOperator.EQ,
    ["transaction"],
    false
   );
   const sendQuery4 = ConseilQueryBuilder.addPredicate(
    sendQuery3,
    "source",
    ConseilOperator.EQ,
    [address],
    false
   );
   const sendQuery5 = ConseilQueryBuilder.addPredicate(
    sendQuery4,
    "status",
    ConseilOperator.EQ,
    ["applied"],
    false
   );
   const sendQuery6 = ConseilQueryBuilder.addOrdering(
    sendQuery5,
    "block_level",
    ConseilSortDirection.ASC
   );
   const sendQuery7 = ConseilQueryBuilder.setLimit(sendQuery6, 100);

   const receiveQuery = ConseilQueryBuilder.blankQuery();
   const receiveQuery2 = ConseilQueryBuilder.addFields(
    receiveQuery,
    "block_level",
    "timestamp",
    "source",
    "destination",
    "amount",
    "fee"
   );
   const receiveQuery3 = ConseilQueryBuilder.addPredicate(
    receiveQuery2,
    "kind",
    ConseilOperator.EQ,
    ["transaction"],
    false
   );
   const receiveQuery4 = ConseilQueryBuilder.addPredicate(
    receiveQuery3,
    "destination",
    ConseilOperator.EQ,
    [address],
    false
   );
   const receiveQuery5 = ConseilQueryBuilder.addPredicate(
    receiveQuery4,
    "status",
    ConseilOperator.EQ,
    ["applied"],
    false
   );
   const receiveQuery6 = ConseilQueryBuilder.addOrdering(
    receiveQuery5,
    "block_level",
    ConseilSortDirection.ASC
   );
   const receiveQuery7 = ConseilQueryBuilder.setLimit(receiveQuery6, 100);

   const sendResult = await ConseilDataClient.executeEntityQuery(
    {
     url: server,
     apiKey,
     network: "delphinet"
    },
    "tezos",
    "delphinet",
    "operations",
    sendQuery7
   );

   const receiveResult = await ConseilDataClient.executeEntityQuery(
    {
     url: server,
     apiKey,
     network: "delphinet"
    },
    "tezos",
    "delphinet",
    "operations",
    receiveQuery7
   );

   const txs = sendResult
    .concat(receiveResult)
    .sort((a, b) => a.timestamp - b.timestamp);

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
