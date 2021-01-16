import rp from "request-promise";
// import cryptoRandom from "crypto-random-string";

const environment = process.env.NODE_ENV;

const addresses = {
  development: "http://localhost:8500",
  production: "https://leadwallet-nem-server.herokuapp.com",
  test: "http://localhost:8500",
  staging: "http://localhost:8500"
};

const opts = {
  simple: false,
  json: true,
  resolveWithFullResponse: true
};

const mainUrl: string = addresses[environment];

export class XEM {
  static async generateAddress(): Promise<{
    statusCode: number;
    payload: any;
  }> {
    try {
      const response = await rp.get(mainUrl + "/account/generate", { ...opts });

      if (response.statusCode >= 400) throw new Error(response.body);

      return Promise.resolve({
        statusCode: 200,
        payload: {
          address: response.body.address,
          privateKey: response.body.privateKey
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
      const response = await rp.get(
        mainUrl + `/account/balance?address=${address}`,
        { ...opts }
      );

      if (response.statusCode >= 400) throw new Error(response.body);

      // console.log(JSON.stringify(response.body));
      return Promise.resolve({
        statusCode: 200,
        payload: {
          balance: response.body.balance
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
      const response = await rp.post(mainUrl + `/tx?pk=${pk}&to=${to}`, {
        ...opts,
        body: { value }
      });

      if (response.statusCode >= 400) throw new Error(response.body);

      return Promise.resolve({
        statusCode: 200,
        payload: {
          hash: response.body.hash
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
      const response = await rp.get(mainUrl + `/txs?address=${address}`, {
        ...opts
      });

      if (response.statusCode >= 400) throw new Error(response.body);

      return Promise.resolve({
        statusCode: 200,
        payload: response.body.txns
      });
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  }
}
