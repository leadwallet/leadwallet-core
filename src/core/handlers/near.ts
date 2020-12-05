import * as Near from "near-api-js";
import BN from "bn.js";
import crypto from "crypto";
import createRandomString from "crypto-random-string";

const environment = process.env.NODE_ENV;

const keyStores = {
 development: new Near.keyStores.InMemoryKeyStore(),
 staging: new Near.keyStores.InMemoryKeyStore(),
 test: new Near.keyStores.InMemoryKeyStore(),
 production: new Near.keyStores.UnencryptedFileSystemKeyStore("keystore")
};

const near_mainnet = "https://rpc.mainnet.near.org";
const near_testnet = "https://rpc.testnet.near.org";

const nodes = {
 development: near_testnet,
 production: near_mainnet,
 test: near_testnet,
 staging: near_testnet
};

const nConfig: any = {
 nodeUrl: nodes[environment],
 deps: {
  keyStore: keyStores[environment]
 }
};

const networks = {
 development: "testnet",
 production: "mainnet",
 test: "testnet",
 staging: "testnet"
};

const helpers = {
 development: "https://helper.testnet.near.org",
 production: "https://helper.nearprotocol.com",
 test: "https://helper.testnet.near.org",
 staging: "https://helper.testnet.near.org"
};

const networkId = networks[environment];
const helperUrl = helpers[environment];

const api = () =>
 Near.connect({
  ...nConfig,
  networkId,
  helperUrl
 });

export class NEAR {
 static async createAddress(): Promise<{ statusCode: number; payload: any }> {
  try {
   const near = await api();
   console.log(near.connection.networkId);
   const randomString = createRandomString({ length: 58 });
   const keyPair = Near.utils.KeyPairEd25519.fromRandom();
   const accountId = randomString + ".near";
   const acc = await near.createAccount(accountId, keyPair.getPublicKey());
   // const acc = new Near.Account(near.connection, accountId);
   return Promise.resolve({
    statusCode: 201,
    payload: {
     address: acc.accountId,
     privateKey: keyPair.toString()
    }
   });
  } catch (error) {
   // console.log(error);
   return Promise.reject(new Error(error.message));
  }
 }

 static async getAddressDetails(
  address: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const near = await api();
   const account = await near.account(address);
   const accountBalance = await account.getAccountBalance();
   const balance = parseFloat(accountBalance.available) * 10 ** -24;
   return Promise.resolve({
    statusCode: 200,
    payload: { balance }
   });
  } catch (error) {
   return Promise.resolve({
    statusCode: 200,
    payload: { balance: 0 }
   });
  }
 }

 static async sendToken(
  pk: string,
  from: string,
  to: string,
  value: number
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const near = await api();
   const status = await near.connection.provider.status();
   const blockHash = Near.utils.serialize.base_decode(
    status.sync_info.latest_block_hash
   );
   const keyPair = Near.utils.KeyPairEd25519.fromString(pk);
   const account = await near.account(from);
   const accessKey = await near.connection.provider.query(
    `access_key/${account.accountId}/${keyPair.getPublicKey().toString()}`,
    ""
   );
   const nonce = accessKey.nonce + 1;
   const transfer = Near.transactions.transfer(
    new BN(Near.utils.format.parseNearAmount(value.toString()))
   );

   const tx = Near.transactions.createTransaction(
    from,
    keyPair.getPublicKey(),
    to,
    nonce,
    [transfer],
    blockHash
   );
   const serializedTx = Near.utils.serialize.serialize(
    Near.transactions.SCHEMA,
    tx
   );
   const bytes = crypto.createHash("sha256").update(serializedTx).digest();
   const message = new Uint8Array(bytes);
   const signature = keyPair.sign(message);
   const signedTx = new Near.transactions.SignedTransaction({
    transaction: tx,
    signature: new Near.transactions.Signature({
     keyType: tx.publicKey.keyType,
     data: signature.signature
    })
   });
   const sentTx = await near.connection.provider.sendTransaction(signedTx);
   const hash = sentTx.transaction.hash;
   return Promise.resolve({
    statusCode: 200,
    payload: { hash }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 // static async getTransactions(address: string) {
 //  try {
 //   const near = await api();
 //   Near.utils.
 //  } catch (error) {}
 // }
}
