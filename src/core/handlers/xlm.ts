import * as Stellar from "stellar-sdk";
import randomString from "crypto-random-string";
import api from "node-fetch";

const environment = process.env.NODE_ENV;

const xlm_mainnet = "https://horizon.stellar.org";
const xlm_testnet = "https://horizon-testnet.stellar.org";

const apis = {
 development: xlm_testnet,
 production: xlm_mainnet,
 test: xlm_testnet,
 staging: xlm_testnet
};

const networks = {
 development: "TESTNET",
 production: "PUBLIC",
 test: "TESTNET",
 staging: "TESTNET"
};

const network = networks[environment];
const xlm = new Stellar.Server(apis[environment]);

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
   if (error instanceof Stellar.NotFoundError)
    return Promise.resolve({
     statusCode: 200,
     payload: {
      balance: 0
     }
    });
   return Promise.reject(new Error(error.message));
  }
 }

 static async sendToken(
  secret: string,
  to: string,
  amount: number
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const pair = Stellar.Keypair.fromSecret(secret);
   // const destination = await xlm.loadAccount(to);
   const source = await xlm.loadAccount(pair.publicKey());
   const txBuilder = new Stellar.TransactionBuilder(source, {
    fee: Stellar.BASE_FEE,
    networkPassphrase: Stellar.Networks[network]
   });
   const operation = Stellar.Operation.payment({
    destination: to,
    asset: Stellar.Asset.native(),
    amount: amount.toString()
   });
   const tx = txBuilder
    .addMemo(
     Stellar.Memo.text(
      "Lead-Memo-" + Date.now() + "" + randomString({ length: 10 })
     )
    )
    .addOperation(operation)
    .setTimeout(60 * 20)
    .build();
   tx.sign(pair);
   const submittedTx = await xlm.submitTransaction(tx);
   return Promise.resolve({
    statusCode: 200,
    payload: {
     hash: submittedTx.hash
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
   const txs = await xlm.transactions().forAccount(address).call();
   const txsPromisesArray = txs.records.map(async tx => {
    const effects = await xlm.effects().forTransaction(tx.id).call();
    const effect = effects.records[0];
    return {
     date: tx.created_at,
     hash: tx.hash,
     from: tx.source_account,
     fee: tx.fee_charged,
     status: tx.succeeds ? "Confirmed" : "Pending",
     to: effect.account,
     amount:
      tx.source_account.toLowerCase() === address.toLowerCase()
       ? "-" + effect.amount
       : "+" + effect.amount
    };
   });
   const resolvedTxsMapped = await Promise.all(txsPromisesArray);
   return Promise.resolve({
    statusCode: 200,
    payload: resolvedTxsMapped
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async importWallet(
  secret: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const pair = Stellar.Keypair.fromSecret(secret);
   const account = await xlm.loadAccount(pair.publicKey());
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: account.accountId(),
     privateKey: pair.secret()
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
