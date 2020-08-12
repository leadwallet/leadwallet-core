import rp from "request-promise";
import { Environment } from "../../env";

export class BTC {
 static async createWallet(privateKey: string): Promise<any> {
  const response = await rp.post(Environment.BTC_URI, {
   resolveWithFullResponse: true,
   json: true,
   body: {}
  });
  return Promise.resolve(response);
 }

 static async sendToken(from: string, to: string): Promise<any> {
  const response = await rp.post(Environment.BTC_URI);
  return Promise.resolve(response);
 }
}
