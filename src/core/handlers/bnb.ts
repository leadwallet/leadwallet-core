import Web3 from "web3";
import rp from "request-promise";
import { Environment } from "../../env";

const environment = process.env.NODE_ENV;
const web3 = new Web3(Environment.BSC[environment]);

const testnet_scan = "https://api-testnet.bscscan.com";
const mainnet_scan = "https://api.bscscan.com";

const SCAN = {
 development: testnet_scan,
 production: mainnet_scan,
 test: testnet_scan,
 staging: testnet_scan
};

const SCAN_API = SCAN[environment];

export class BNB {
 static async generateAddress(
  mnemonic: string
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const account = web3.eth.accounts.create(mnemonic);
   return Promise.resolve({
    statusCode: 200,
    payload: {
     address: account.address,
     privateKey: account.privateKey
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
   const balance = await web3.eth.getBalance(address);
   // console.log(JSON.stringify(balance));
   return Promise.resolve({
    statusCode: 200,
    payload: {
     balance: parseFloat(balance) / 10 ** 18
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 static async sendToken(
  to: string,
  gasPrice: number,
  gas: number,
  value: number,
  pk: string,
  nonce?: number
 ): Promise<{ statusCode: number; payload: any }> {
  try {
   const account = web3.eth.accounts.privateKeyToAccount(pk);
   const signedTx = await account.signTransaction({
    to,
    gasPrice,
    gas,
    value: value * 10 ** 18,
    nonce
   });
   const broadcastTx = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
   );
   return Promise.resolve({
    statusCode: 200,
    payload: {
     hash: broadcastTx.transactionHash
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
   const res = await rp.get(
    SCAN_API +
     "/api?module=account&action=txlist&address=" +
     address +
     "&startblock=0&endblock=99999999&page=1&offset=100&sort=asc",
    {
     simple: false,
     resolveWithFullResponse: true,
     json: true
    }
   );
   // console.log(JSON.stringify(res.body));
   const payload = res.body.result.map((x: any) => ({
    date: new Date(parseInt(x.timeStamp)),
    hash: x.hash,
    nonce: parseInt(x.nonce),
    from: x.from,
    to: x.to,
    amount:
     x.from.toLowerCase() === address.toLowerCase()
      ? "-" + parseFloat(x.value) / 10 ** 18
      : "+" + parseFloat(x.value) / 10 ** 18,
    status: parseInt(x.confirmations) > 0 ? "Confirmed" : "Pending"
   }));
   return Promise.resolve({
    statusCode: 200,
    payload
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
  }
 }

 // static async importWallet(
 //  pk: string
 // ): Promise<{ statusCode: number; payload: any }> {
 //  try {
 //   const c = await client.initChain();
 //   const account = c.recoverAccountFromPrivateKey(pk);
 //   return Promise.resolve({
 //    statusCode: 200,
 //    payload: {
 //     address: account.address,
 //     privateKey: account.privateKey
 //    }
 //   });
 //  } catch (error) {
 //   return Promise.reject(new Error(error.message));
 //  }
 // }
}
