import rp from "request-promise";
import { Environment } from "../../env";
import { COIN_NETWORK, options } from "./commons";

const ethPath = "/v1/bc/eth/" + COIN_NETWORK["eth"][process.env.NODE_ENV];
const ETHROOT = Environment.CRYPTO_API + ethPath;

export class ETH {
 static async createAddress(): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/address", { ...options });
  // console.log(JSON.stringify(response.body));
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async getAddressDetails(address: string): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.get(ETHROOT + "/address/" + address, { ...options });
  const tokensResponse = await rp.get(ETHROOT + "/tokens/address/" + address, { ...options});
  if(response.statusCode >= 400 || tokensResponse.statusCode>= 400) {
      console.log("Couldn't get eth and its tokens details together");
      console.log(response.body);
      console.log(tokensResponse.body);
      return Promise.resolve({
        statusCode: 400,
        payload: {...response.body,...tokensResponse.body}
      });
  }
  const tokenDetails: Array<any> = tokensResponse.body.payload;
  const tokenDetailsWithImages : Array<any> = [];
  for (const tokenDetail of tokenDetails) {
      const contractDetails = await rp.get("https://api.coingecko.com/api/v3/coins/ethereum/contract/" + tokenDetail.contract, {
          simple: false,
          json: true,
          resolveWithFullResponse: true
        })
      if(contractDetails.statusCode >= 400) {
        console.log("Couldn't get image url for "+ tokenDetail.name);
        // If image is not available preoceeding with empty image urls
        tokenDetailsWithImages.push({...tokenDetail, image: {}});
      } else {
        tokenDetailsWithImages.push({...tokenDetail, image: contractDetails.body.image});
      }
    }
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: {...response.body.payload, tokens: tokenDetailsWithImages }
  });
 }

 static async sendToken(
  body: { fromAddress: string; toAddress: string; gasPrice: number; gasLimit: number; value: number; privateKey: string; nonce?: number; }
 ): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/txs/new-pvtkey", {
   ...options, body
  });
  console.error(JSON.stringify(response));
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async transferERC20(
  fromAddress: string, 
  toAddress: string,
  contract: string,
  privateKey: string,
  gasPrice: number,
  gasLimit: number
 ): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.post(ETHROOT + "/token/transfer", {
   ...options,
   body: {
    fromAddress, toAddress, privateKey, gasPrice, gasLimit, contract
   }
  });

  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 static async getERC20Tokens(address: string): Promise<{ statusCode: number; payload: any; }> {
  const response = await rp.get(ETHROOT + "/tokens/address/" + address, { ...options });
  return Promise.resolve({
   statusCode: response.statusCode,
   payload: response.body.payload || response.body.meta.error.message
  });
 }

 // static async broadcastTransaction() {}
}
