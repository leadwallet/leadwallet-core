// import * as symbol from "symbol-sdk";
// import { ChronoUnit } from "@js-joda/core";
// import { v4 as uuid } from "uuid";

// const environment = process.env.NODE_ENV;

// const networks = {
//  development: symbol.NetworkType.TEST_NET,
//  production: symbol.NetworkType.MAIN_NET
// };

// const network: symbol.NetworkType =
//  networks[environment] || symbol.NetworkType.TEST_NET;

// export class XYM {
//  static async createAddress() {
//   try {
//    const account = symbol.Account.generateNewAccount(network);
//    return Promise.resolve({
//     statusCode: 201,
//     payload: {
//      address: account.address.plain(),
//      privateKey: account.privateKey
//     }
//    });
//   } catch (error) {
//    return Promise.reject(new Error(error.message));
//   }
//  }

//  static async getAddressDetails(address: string) {
//   try {
//    const repoFactory = new symbol.RepositoryFactoryHttp("");
//    const accountInfo = await repoFactory
//     .createAccountRepository()
//     .getAccountInfo(symbol.Address.createFromRawAddress(address))
//     .toPromise();
//    const promiseMap = accountInfo.mosaics.map(async m => {
//     const mosaicInfo = await repoFactory
//      .createMosaicRepository()
//      .getMosaic(new symbol.MosaicId(m.id.toHex()))
//      .toPromise();
//     return m.amount.compact() / 10 ** mosaicInfo.divisibility;
//    });
//    const balance = (await Promise.all(promiseMap)).reduce(
//     (prev, current) => prev + current
//    );
//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      balance
//     }
//    });
//   } catch (error) {
//    return Promise.reject(new Error(error.message));
//   }
//  }

//  static async sendToken(
//   pk: string,
//   to: string,
//   amount: number,
//   maxFee: number
//  ) {
//   try {
//    const signer = symbol.Account.createFromPrivateKey(pk, network);
//    const repoFactory = new symbol.RepositoryFactoryHttp("");
//    const txn = symbol.TransferTransaction.create(
//     symbol.Deadline.create(1573430400, 4, ChronoUnit.HOURS),
//     symbol.Address.createFromRawAddress(to),
//     [symbol.Currency.PUBLIC.createRelative(amount)],
//     symbol.PlainMessage.create("Txn from Leadwallet: " + uuid()),
//     network,
//     symbol.UInt64.fromUint(maxFee * 10 ** 6)
//    );
//    const signed = signer.sign(txn, "");
//    const announcement = await repoFactory
//     .createTransactionRepository()
//     .announce(signed)
//     .toPromise();
//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      hash: signed.hash,
//      announcement
//     }
//    });
//   } catch (error) {
//    return Promise.reject(new Error(error.message));
//   }
//  }
// }
