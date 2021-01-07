import nem from "nem-sdk";
import cryptoRandom from "crypto-random-string";

const environment = process.env.NODE_ENV;

const networks = {
 development: "testnet",
 production: "mainnet",
 test: "testnet",
 staging: "testnet"
};

const nodes = {
 development: "69.30.222.140",
 production: "san.nem.ninja",
 test: "69.30.222.140",
 staging: "69.30.222.140"
};

const ports = {
 development: 7890,
 production: 7778,
 test: 7890,
 staging: 7890
};

const node = nodes[environment];
const nemPort = ports[environment];
const network = nem.model.network.data[networks[environment]].id;

export class XEM {
 static async generateAddress(): Promise<{ statusCode: number; payload: any }> {
  try {
   const randomBytes = nem.crypto.nacl.randomBytes(32);
   const randomHex = nem.utils.convert.ua2hex(randomBytes);
   const keyPair = nem.crypto.keyPair.create(randomHex);
   const address = nem.model.address.toAddress(
    keyPair.publicKey.toString(),
    network
   );
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address,
     privateKey: randomHex
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
   const endpoint = nem.model.objects.create(node, nemPort);
   const account = await nem.com.requests.account.data(endpoint, address);
   console.log(JSON.stringify(account));
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: account.account.balance / 10 ** 6
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
   const endpoint = nem.model.objects.create(node, nemPort);
   const tx = nem.model.objects.create("transferTransaction")(
    to,
    value,
    cryptoRandom({ length: 12 })
   );
   const common = nem.model.objects.create("common")("", pk);
   const preparedTx = nem.model.transactions.prepare("transferTransaction")(
    common,
    tx,
    network
   );
   const sentTx = await nem.model.transactions.send(
    common,
    preparedTx,
    endpoint
   );
   return Promise.resolve({
    statusCode: 200,
    payload: {
     hash: sentTx.transactionHash.data
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
   const endpoint = nem.model.objects.create(node, nemPort);
   const allTxMetadataPair = await nem.com.requests.account.allTransactions(
    endpoint,
    address
   );
   const allTxMapped = allTxMetadataPair.map(tx => ({
    hash: tx.meta.hash.data,
    date: new Date(tx.transaction.timeStamp),
    amount:
     address.toLowerCase() === tx.transaction.recipient.toLowerCase()
      ? "+" + tx.transaction.amount / 10 ** 6
      : "-" + tx.transaction.amount / 10 ** 6,
    to: tx.transaction.recipient,
    from: address
   }));
   return Promise.resolve({
    statusCode: 200,
    payload: allTxMapped
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }
}
