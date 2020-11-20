// import Web3 from "web3";
// import ContractKit from "@celo/contractkit";
// import { Environment } from "../../env";

// const environment = process.env.NODE_ENV;

// const web3 = new Web3();
// const kit = ContractKit.newKit(
//  Environment.CELO[environment]
// );

// export class CELO {
//  static async createAddress(key: string): Promise<{ statusCode: number; payload: any; }> {
//   try {
//    const account = web3.eth.accounts.create(key);
//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      address: account.address,
//      privateKey: account.privateKey
//     }
//    });
//   } catch (error) {
//    return Promise.reject(
//     new Error(error.message)
//    );
//   }
//  }

//  static async getAddressDetails(address: string): Promise<{ statusCode: number; payload: any; }> {
//   try {
//    const goldToken = await kit.contracts.getGoldToken();
//    const balance = await goldToken.balanceOf(address);
//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      address,
//      balance: balance.toNumber()
//     }
//    });
//   } catch (error) {
//    return Promise.reject(
//     new Error(error.message)
//    );
//   }
//  }

//  static async sendToken(pk: string, to: string, value: number): Promise<{ statusCode: number; payload: any; }> {
//   try {
//    const account = web3.eth.accounts.privateKeyToAccount(pk);

//    kit.addAccount(account.privateKey);

//    const goldToken = await kit.contracts.getGoldToken();
//    const sendParam: any = {
//     from: account.address
//    };
//    const tx = await goldToken.transfer(to, value)
//     .send(sendParam);
//    const receipt = await tx.waitReceipt();
//    return Promise.resolve({
//     statusCode: 200,
//     payload: {
//      hash: receipt.transactionHash
//     }
//    });
//   } catch (error) {
//    return Promise.reject(
//     new Error(error.message)
//    );
//   }
//  }
// }
