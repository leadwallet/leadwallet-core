import Web3 from "web3";
import * as ContractKit from "@celo/contractkit";
import rp from "request-promise";
import { CUsd } from "../interfaces/token";
import { options } from "./commons";

const environment = process.env.NODE_ENV;

const celo_mainnet = "https://forno.celo.org";
const celo_testnet = "https://alfajores-forno.celo-testnet.org";

const celo = {
  development: celo_testnet,
  production: celo_mainnet,
  test: celo_testnet,
  staging: celo_testnet
};

const web3 = new Web3();
const kit = ContractKit.newKit(celo[environment]);

const testnet_scan = "https://alfajores-blockscout.celo-testnet.org/api";
const mainnet_scan = "https://explorer.celo.org/api";
const explorers = {
  development: testnet_scan,
  production: mainnet_scan,
  test: testnet_scan,
  staging: testnet_scan
};

const explorer = explorers[environment];

export class CELO {
  static async createAddress(
    key: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const account = web3.eth.accounts.create(key);
      return Promise.resolve({
        statusCode: 200,
        payload: {
          address: account.address,
          privateKey: account.privateKey
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

  static async getAddressDetails(
    address: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const goldToken = await kit.contracts.getGoldToken();
      const stableToken = await kit.contracts.getStableToken();
      const balance = await goldToken.balanceOf(address);
      const cUSDBalance = await stableToken.balanceOf(address);
      const token: CUsd = {
        balance: (cUSDBalance.toNumber() / 10 ** 18).toString(),
        type: "ERC-20",
        symbol: "cUSD",
        name: "Celo Dollar"
      };
      // const cusdImage =
      //  "https://assets.coingecko.com/coins/images/13161/large/icon-celo-dollar-color-1000-circle-cropped.png?1605771134";
      const infoResponse = await rp.get(
        "https://api.coingecko.com/api/v3/coins/celo-dollar",
        { ...options, headers: { accept: "application/json" } }
      );
      const resp = infoResponse.body;
      const cusd = {
        ...token,
        rate_in_usd: resp["market_data"]["current_price"]["usd"],
        image: resp.image
      };
      return Promise.resolve({
        statusCode: 200,
        payload: {
          address,
          balance: balance.toNumber() / 10 ** 18,
          token: cusd
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
    pk: string,
    to: string,
    value: number
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(pk);

      kit.addAccount(account.privateKey);

      const goldToken = await kit.contracts.getGoldToken();
      const sendParam: any = {
        from: account.address
      };
      const val = value * 10 ** 18;
      const tx = await goldToken.transfer(to, val.toString()).send(sendParam);
      const receipt = await tx.waitReceipt();
      return Promise.resolve({
        statusCode: 200,
        payload: {
          hash: receipt.transactionHash
        }
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async sendCUSD(
    pk: string,
    to: string,
    value: number
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(pk);

      kit.addAccount(account.privateKey);

      const stableToken = await kit.contracts.getStableToken();
      const sendParam: any = {
        from: account.address
      };
      const val = value * 10 ** 18;
      const tx = await stableToken.transfer(to, val.toString()).send(sendParam);
      const receipt = await tx.waitReceipt();
      return Promise.resolve({
        statusCode: 200,
        payload: {
          hash: receipt.transactionHash
        }
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

  static async getTransactions(
    address: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const res = await rp.get(
        explorer + "?module=account&action=tokentx&address=" + address,
        {
          simple: true,
          json: true,
          resolveWithFullResponse: true
        }
      );
      const mappedArray = res.body.result
        .filter((t: any) => t.tokenSymbol !== "cUSD")
        .map((x: any) => ({
          from: x.from,
          to: x.to,
          amount:
            x.from.toLowerCase() === address.toLowerCase()
              ? "-" + parseFloat(x.value) / 10 ** 18
              : "+" + parseFloat(x.value) / 10 ** 18,
          hash: x.hash,
          status: parseInt(x.confirmations) > 0 ? "Confirmed" : "Pending",
          nonce: parseInt(x.nonce),
          date: new Date(parseInt(x.timeStamp))
        }));

      return Promise.resolve({
        statusCode: 200,
        payload: mappedArray
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async getCUSDTransactions(
    address: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const res = await rp.get(
        explorer + "?module=account&action=tokentx&address=" + address,
        {
          simple: true,
          json: true,
          resolveWithFullResponse: true
        }
      );
      const mappedArray = res.body.result
        .filter((t: any) => t.tokenSymbol === "cUSD")
        .map((x: any) => ({
          from: x.from,
          to: x.to,
          amount:
            x.from.toLowerCase() === address.toLowerCase()
              ? "-" + parseFloat(x.value) / 10 ** 18
              : "+" + parseFloat(x.value) / 10 ** 18,
          hash: x.hash,
          status: parseInt(x.confirmations) > 0 ? "Confirmed" : "Pending",
          nonce: parseInt(x.nonce),
          date: new Date(parseInt(x.timeStamp))
        }));

      return Promise.resolve({
        statusCode: 200,
        payload: mappedArray
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }
}
