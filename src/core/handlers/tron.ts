import Tronweb from "tronweb";
import rp from "request-promise";
import { Environment } from "../../env";
import { options } from "./commons";
import { TRCToken } from "../interfaces/token";

const tWeb = new Tronweb({
  fullHost: Environment.TRON[process.env.NODE_ENV]
});

const API = {
  production: "https://api.trongrid.io/v1",
  development: "https://api.shasta.trongrid.io/v1",
  staging: "https://api.shasta.trongrid.io/v1",
  test: "https://api.shasta.trongrid.io/v1"
};

const EXPLORER = API[process.env.NODE_ENV];

export class TRON {
  static async generateAddress(): Promise<{
    payload: any;
    statusCode: number;
  }> {
    try {
      const account = await tWeb.createAccount();
      // console.log(account);
      return Promise.resolve({
        payload: {
          ...account.address,
          privateKey: account.privateKey
        },
        statusCode: 201
      });
    } catch (error) {
      return Promise.resolve({
        payload: error,
        statusCode: 500
      });
    }
  }

  static async getAddressDetails(
    address: string,
    tokens: Array<TRCToken> = []
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const balance = await tWeb.trx.getBalance(address);
      const tkz: Array<any> = [];
      const tokensResponse = await rp.get(
        `https://apilist.tronscan.org/api/account?address=${address}`,
        {
          simple: false,
          resolveWithFullResponse: true,
          json: true
        }
      );

      if (tokensResponse.statusCode >= 400)
        throw new Error("Could not get all tokens by user");

      let tkData: Array<TRCToken> = [
        ...tokensResponse.body["trc20token_balances"],
        ...tokensResponse.body["tokenBalances"]
      ]
        .filter(token => token.tokenId !== "_")
        .map(token => ({
          contract: token.tokenId,
          symbol: token.tokenAbbr,
          name: token.tokenName,
          decimals: token.tokenDecimal,
          type: token.tokenType,
          balance: (parseFloat(token.balance) / 10 ** 6).toString()
        }));

      tkData = [
        ...tkData,
        ...tokens
          .filter(tk => !tkData.map(t => t.contract).includes(tk.contract))
          .map(token => ({
            contract: token.contract,
            symbol: token.symbol,
            name: token.name,
            decimal: token.decimals,
            type: token.type,
            balance: token.balance
          }))
      ];

      for (const tokenDetail of tkData) {
        const res = await rp.get(
          `https://apilist.tronscan.org/api/contract?contract=${tokenDetail.contract}`,
          {
            simple: false,
            resolveWithFullResponse: true,
            json: true
          }
        );
        const infoResponse = await rp.get(
          "https://api.coingecko.com/api/v3/coins/tron",
          { ...options, headers: { accept: "application/json" } }
        );
        const price = infoResponse.body["market_data"]["current_price"]["usd"];
        const image = res.body.data[0].tokenInfo?.tokenLogo;
        const balanceInTrx = res.body.data[0].balance / 10 ** 6;
        tkz.push({
          ...tokenDetail,
          image: { thumb: image, small: image, large: image },
          rate_in_usd: balanceInTrx * price
        });
      }
      // console.log(balance);
      return Promise.resolve({
        payload: { balance: balance / 10 ** 6, tokens: tkz },
        statusCode: 200
      });
    } catch (error) {
      // console.error(error);
      return Promise.resolve({
        payload: {
          balance: 0
        },
        statusCode: 200
      });
    }
  }

  static async sendToken(
    from: string,
    to: string,
    amount: number
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const payload = await tWeb.transactionBuilder.sendTrx(
        to,
        amount * 10 ** 6,
        from
      );
      // console.log(JSON.stringify(payload, null, 2));
      return Promise.resolve({
        payload,
        statusCode: 200
      });
    } catch (error) {
      console.error(error);
      return Promise.resolve({
        payload: error,
        statusCode: 500
      });
    }
  }

  static async sendAsset(
    from: string,
    to: string,
    amount: number,
    tokenId: string
  ): Promise<{ statusCode: number; payload: any }> {
    try {
      const payload = await tWeb.transactionBuilder.sendAsset(
        to,
        amount * 10 ** 6,
        tokenId,
        from
      );
      return Promise.resolve({
        payload,
        statusCode: 200
      });
    } catch (error) {
      return Promise.resolve({
        payload: error,
        statusCode: 500
      });
    }
  }

  static async signTransaction(
    transaction: any,
    pk: string
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const signedTransaction = await tWeb.trx.sign(transaction, pk);
      const receipt = await tWeb.trx.sendRawTransaction(signedTransaction);
      //console.log(JSON.stringify(receipt));
      return Promise.resolve({
        payload: receipt,
        statusCode: 200
      });
    } catch (error) {
      console.error(error);
      return Promise.resolve({
        payload: error,
        statusCode: 500
      });
    }
  }

  static async getTransactions(
    address: string
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const trxResponse = await rp.get(
        EXPLORER + "/accounts/" + address + "/transactions",
        { ...options }
      );
      const trxs: Array<any> = trxResponse.body.data.map((item: any) => ({
        ...item,
        raw_data: {
          ...item.raw_data,
          contract: item.raw_data.contract.map((c: any) => ({
            value:
              tWeb.address.toHex(address) === c.parameter.value.to_address
                ? "+" + c.parameter.value.amount / 10 ** 6
                : "-" + c.parameter.value.amount / 10 ** 6,
            from: tWeb.address.fromHex(c.parameter.value.owner_address),
            to: tWeb.address.fromHex(c.parameter.value.to_address)
          }))
        }
      }));

      return Promise.resolve({
        statusCode: 200,
        payload: trxs
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async getTrcTransactions(
    address: string
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const trxResponse = await rp.get(
        EXPLORER + "/accounts/" + address + "/transactions/trc20",
        { ...options }
      );
      const trxs: Array<any> = trxResponse.body.data.map((item: any) => ({
        hash: item.transaction_id,
        amount:
          address.toLowerCase() === item.to.toLowerCase()
            ? "+" + parseFloat(item.value) / 10 ** 6
            : "-" + parseFloat(item.value) / 10 ** 6,
        from: item.from,
        to: item.to,
        symbol: item.token_info.symbol,
        date: new Date(item.block_timestamp),
        status: "Confirmed"
      }));

      return Promise.resolve({
        statusCode: 200,
        payload: trxs
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }

  static async importWallet(
    privateKey: string
  ): Promise<{ payload: any; statusCode: number }> {
    try {
      const address = tWeb.address.fromPrivateKey(privateKey);
      return Promise.resolve({
        statusCode: 200,
        payload: {
          address,
          privateKey
        }
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }
}
