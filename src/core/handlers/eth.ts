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
    } else {
     tokenDetailsWithImages.push({
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
     )
    }
   });
  } catch (error) {
   return Promise.reject(new Error(error.message));
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
   return Promise.resolve({
    statusCode: sendSignedTxResponse.statusCode,
    payload:
     sendSignedTxResponse.body.payload ||
     sendSignedTxResponse.body.meta.error.message
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

  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async getERC20Tokens(
  address: string
 ): Promise<{ statusCode: number; payload: any }> {
  const response = await rp.get(CRYPTOAPI + "/tokens/address/" + address, {
   ...options
  });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
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
