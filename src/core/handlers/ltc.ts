import rp from "request-promise";
import litecore from "litecore-lib";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const networks = {
  development: "testnet",
  production: "livenet",
  test: "testnet",
  staging: "testnet"
};

const ltcPath = "/v1/bc/ltc/" + COIN_NETWORK["ltc"][process.env.NODE_ENV];
const LTCROOT = Environment.CRYPTO_API + ltcPath;
const n = networks[process.env.NODE_ENV];

export class LTC {
  static async createAddress(): Promise<{ payload: any; statusCode: number }> {
    try {
      const pk = litecore.PrivateKey.fromRandom(n);
      const address = pk.toAddress(n).toString();
      const wif = pk.toWIF();
      return Promise.resolve({
        statusCode: 200,
        payload: {
          address,
          wif
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
      const response = await rp.get(LTCROOT + "/address/" + address, {
        ...options
      });

      if (response.statusCode >= 400)
        throw new Error(response.body.meta.error.message);

      return Promise.resolve({
        statusCode: 200,
        payload: response.body.payload
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
    fee: { value: number }
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const response = await rp.post(LTCROOT + "/txs/create", {
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

      if (response.statusCode >= 400)
        throw new Error(response.body.meta.error.message);

      return Promise.resolve({
        statusCode: 200,
        payload: response.body.payload
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async signTransaction(
    hex: string,
    wifs: Array<string>
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const response = await rp.post(LTCROOT + "/txs/sign", {
        ...options,
        body: { hex, wifs }
      });

      if (response.statusCode >= 400)
        throw new Error(response.body.meta.error.message);

      return Promise.resolve({
        statusCode: 200,
        payload: response.body.payload
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async broadcastTransaction(
    hex: string
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const response = await rp.post(LTCROOT + "/txs/send", {
        ...options,
        body: { hex }
      });

      if (response.statusCode >= 400)
        throw new Error(response.body.meta.error.message);

      return Promise.resolve({
        statusCode: 200,
        payload: response.body.payload
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async importWallet(
    wif: string
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const pk = litecore.PrivateKey.fromWIF(wif);
      const address = pk.toAddress(n).toString();
      return Promise.resolve({
        statusCode: 200,
        payload: {
          address,
          wif
        }
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }
}
