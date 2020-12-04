// import { RippleAPI } from "ripple-lib";
// import { Environment } from "../../env";

// const environment = process.env.NODE_ENV;
// // const test = environment === "development" || environment === "test";

// const api = new RippleAPI({
//  server: Environment.XRP[environment],
//  timeout: 40000
// });

// api.connect().then(() => console.log("Rippled server connected"));

// export class XRP {
//  static async generateAddress(): Promise<{
//   statusCode: number;
//   payload: any;
//  }> {
//   try {
//    const o = api.generateAddress();

//    // console.log(o.xAddress);

//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      address: o.address,
//      secret: o.secret
//     }
//    });
//   } catch (error) {
//    return Promise.reject(new Error(error.message));
//   }
//  }

//  static async getAddressDetails(
//   address: string
//  ): Promise<{ statusCode: number; payload: any }> {
//   try {
//    const info = await api.getAccountInfo(address);
//    const balance = parseFloat(info.xrpBalance);

//    return Promise.resolve({
//     statusCode: 200,
//     payload: { balance }
//    });
//   } catch (error) {
//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      balance: 0
//     }
//    });
//   }
//  }

//  static async sendToken(
//   from: string,
//   to: string,
//   value: number,
//   secret: string
//  ): Promise<{ statusCode: number; payload: any }> {
//   try {
//    const payment = {
//     source: {
//      address: from,
//      amount: {
//       value: value.toString(),
//       currency: "XRP"
//      }
//     },
//     destination: {
//      address: to,
//      minAmount: {
//       value: value.toString(),
//       currency: "XRP"
//      }
//     }
//    };
//    const tx = await api.preparePayment(from, payment);
//    const signedTx = api.sign(tx.txJSON, secret);
//    const submittedTx: any = await api.submit(signedTx.signedTransaction);

//    console.log(submittedTx);

//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      hash: submittedTx.tx_json.hash,
//      hex: submittedTx.tx_json.TxnSignature
//     }
//    });
//   } catch (error) {
//    return Promise.reject(new Error(error.message));
//   }
//  }

//  static async getTransactions(
//   address: string
//  ): Promise<{ statusCode: number; payload: any }> {
//   try {
//    const txs = await api.getTransactions(address);
//    const mappedTxs = txs.map((t: any) => ({
//     from: t.specification.source?.address,
//     to: t.specification.destination?.address,
//     amount:
//      t.specification.source?.address === address
//       ? "-" + t.outcome.deliveredAmount.value
//       : "+" + t.outcome.deliveredAmount.value,
//     status: t.outcome.result
//      .replace(/tes\w*/, "Confirmed")
//      .replace(/(tef|tel|ter|tec|tem)\w*/, "Failed"),
//     hash: t.id,
//     date: t.outcome.timestamp
//    }));

//    return Promise.resolve({
//     statusCode: 200,
//     payload: mappedTxs
//    });
//   } catch (error) {
//    return Promise.reject(new Error(error.message));
//   }
//  }
// }
