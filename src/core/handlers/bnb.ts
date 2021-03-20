import Web3 from "web3";
import rp from "request-promise";
import { BEPToken } from "../interfaces/token";

const environment = process.env.NODE_ENV;

const bsc_mainnet = "https://bsc-dataseed.binance.org";
const bsc_testnet = "https://data-seed-prebsc-1-s1.binance.org:8545";

const bsc = {
  development: bsc_testnet,
  production: bsc_mainnet,
  test: bsc_testnet,
  staging: bsc_testnet
};

const web3 = new Web3(bsc[environment]);

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
      // console.log("======== " + account.address);
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
    address: string,
    tokens: Array<BEPToken> = []
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      // console.log("=========" + address)
      const balance = await web3.eth.getBalance(address);
      // console.log(balance);
      // console.log(JSON.stringify(balance));
      return Promise.resolve({
        statusCode: 200,
        payload: {
          balance: parseFloat(balance) / 10 ** 18
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
    to: string,
    value: number,
    pk: string,
    nonce?: number
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(pk);
      const gasPrice = parseFloat(await web3.eth.getGasPrice());
      const gas = await web3.eth.estimateGas({
        to,
        from: account.address,
        gasPrice,
        value: value * 10 ** 18
      });
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

  static async sendBEP20(
    pk: string,
    from: string,
    to: string,
    amount: number,
    contractAddress: string
  ) {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(pk);
      const nonce = await web3.eth.getTransactionCount(account.address);
      const contract = new web3.eth.Contract(null, contractAddress, { from });
      const data = await contract.methods
        .transfer(to, web3.utils.toWei(amount.toString(), "ether"))
        .encodeABI();
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 210000;
      const signedTx = await account.signTransaction({
        from,
        gasPrice: web3.utils.toHex(gasPrice),
        gas: web3.utils.toHex(gasLimit),
        to: contractAddress,
        value: "0x0",
        data,
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

  static async importWallet(
    pk: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(pk);
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

  static async getFee(
    body: any
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const gasLimit = await web3.eth.estimateGas({
        from: body.fromAddress,
        to: body.toAddress,
        value: body.value
      });
      const gasPrice = await web3.eth.getGasPrice();

      return Promise.resolve({
        statusCode: 200,
        payload: {
          gasLimit,
          gasPrice
        }
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
