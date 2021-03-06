import rp from "request-promise";
import Web3 from "web3";
// import abi from "human-standard-token-abi";
import { Environment } from "../../env";
import { ERCToken } from "../interfaces/token";
import { COIN_NETWORK, options } from "./commons";

const environment = process.env.NODE_ENV;
// const blockCypherNetworks = {
//  development: "test",
//  production: "main",
//  test: "test",
//  staging: "test"
// };
// const ethPrefix = {
//  development: "beth",
//  production: "eth",
//  test: "beth",
//  staging: "beth"
// };
// const bcn = blockCypherNetworks[environment];
// const ethP = ethPrefix[environment];
// const EXPLORER = "https://api.blockcypher.com/v1/" + ethP + "/" + bcn;
const CRYPTOAPI =
  Environment.CRYPTO_API + "/v1/bc/eth/" + COIN_NETWORK["eth"][environment];

const web3 = new Web3(
  new Web3.providers.HttpProvider(Environment.ETH_PROVIDERS[environment])
);

export class ETH {
  static async createAddress(
    key: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const account = web3.eth.accounts.create(key);
      // console.log(account.address);
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
    tokens: Array<ERCToken> = []
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const response = await rp.get(CRYPTOAPI + "/address/" + address, {
        ...options
      });

      if (response.statusCode >= 400)
        throw new Error(response.body.meta.error.message);

      const tokensResponse = await rp.get(
        CRYPTOAPI + "/tokens/address/" + address,
        { ...options }
      );

      if (tokensResponse.statusCode >= 400)
        throw new Error(response.body.meta.error.message);

      let tokenDetails: Array<any> = tokensResponse.body.payload;
      const tokenDetailsWithImages: Array<any> = [];
      const collectibleDetailsWithImages: Array<any> = [];
      const tokensFiltered = tokens.filter(
        t => !tokenDetails.map(d => d.contract).includes(t.contract)
      );
      tokenDetails = tokenDetails.concat(tokensFiltered);

      for (const tokenDetail of tokenDetails) {
        const contractDetails = await rp.get(
          "https://api.coingecko.com/api/v3/coins/ethereum/contract/" +
            tokenDetail.contract,
          {
            simple: false,
            json: true,
            resolveWithFullResponse: true
          }
        );
        if (contractDetails.statusCode >= 400) {
          console.log("Couldn't get image url for " + tokenDetail.name);
          // If image is not available, proceed with custom image
          // console.log(tokenDetail);
          if (tokenDetail.type.toLowerCase() === "erc-20")
            tokenDetailsWithImages.push({
              ...tokenDetail,
              image: {
                thumb:
                  "https://u20.plpstatic.ru/s/31g6ba0061/d3d591315e90751dab06ebbc70adfc38/b07feb7649a38a684a95c374ea2ca2e6.png",
                small:
                  "https://u20.plpstatic.ru/s/31g6ba0061/d3d591315e90751dab06ebbc70adfc38/b07feb7649a38a684a95c374ea2ca2e6.png",
                large:
                  "https://u20.plpstatic.ru/s/31g6ba0061/d3d591315e90751dab06ebbc70adfc38/b07feb7649a38a684a95c374ea2ca2e6.png"
              }
            });
          else
            collectibleDetailsWithImages.push({
              ...tokenDetail,
              image: {
                thumb:
                  "data:image/jpeg;base64,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",
                small:
                  "data:image/jpeg;base64,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",
                large:
                  "data:image/jpeg;base64,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"
              }
            });
        } else {
          if (tokenDetail.type.toLowerCase() === "erc-20")
            tokenDetailsWithImages.push({
              ...tokenDetail,
              image: contractDetails.body.image
            });
          else
            collectibleDetailsWithImages.push({
              ...tokenDetail,
              image: contractDetails.body.image
            });
        }
      }
      return Promise.resolve({
        statusCode: response.statusCode,
        payload: {
          ...response.body.payload,
          tokens: tokenDetailsWithImages.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          ),
          collectibles: collectibleDetailsWithImages.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          )
        }
      });
    } catch (error) {
      return Promise.resolve({
        statusCode: 200,
        payload: {
          balance: 0,
          tokens: []
        }
      });
    }
  }

  static async sendToken(
    pk: string,
    body: {
      toAddress: string;
      gasPrice: number;
      gasLimit: number;
      value: number;
      nonce?: number;
    }
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(pk);
      const signedTx = await account.signTransaction({
        to: body.toAddress,
        gasPrice: body.gasPrice,
        gas: body.gasLimit,
        value: body.value * 10 ** 18,
        nonce: body.nonce
      });

      const sendSignedTxResponse = await rp.post(CRYPTOAPI + "/txs/push", {
        ...options,
        body: {
          hex: signedTx.rawTransaction
        }
      });

      if (sendSignedTxResponse.statusCode >= 400)
        throw new Error(sendSignedTxResponse.body.meta.error.message);

      return Promise.resolve({
        statusCode: sendSignedTxResponse.statusCode,
        payload: sendSignedTxResponse.body.payload
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async transferERC20(
    fromAddress: string,
    toAddress: string,
    contract: string,
    privateKey: string,
    token: number,
    gasPrice: number,
    gasLimit: number
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const response = await rp.post(CRYPTOAPI + "/tokens/transfer", {
        ...options,
        body: {
          fromAddress,
          toAddress,
          privateKey,
          gasPrice,
          gasLimit,
          contract,
          token
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

  static async transferERC721(
    fromAddress: string,
    toAddress: string,
    contract: string,
    privateKey: string,
    token: number,
    gasPrice: number,
    gasLimit: number
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const response = await rp.post(CRYPTOAPI + "/tokens/transfer", {
        ...options,
        body: {
          fromAddress,
          toAddress,
          privateKey,
          gasPrice,
          gasLimit,
          contract,
          token
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

  static async getERC20Tokens(
    address: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const response = await rp.get(CRYPTOAPI + "/tokens/address/" + address, {
        ...options
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

  static async getTransactionDetails(
    transactionHash: string,
    address: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const trx = await web3.eth.getTransaction(transactionHash);
      return Promise.resolve({
        statusCode: 200,
        payload: {
          from: trx.from,
          to: trx.to,
          nonce: trx.nonce,
          amount:
            trx.from.toLowerCase() === address.toLowerCase()
              ? "-" + trx.value
              : "+" + trx.value
        }
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async importWallet(
    privateKey: string
  ): Promise<{ payload: any; statusCode: any }> {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
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

  // static async broadcastTransaction() {}
}
