import express from "express";
import db from "../db";
import { Wallet } from "../core/interfaces";
import * as helpers from "../helpers";

const { DBWallet } = db;

export class WalletController {
  static async createWalletFaster(
    req: express.Request,
    res: express.Response
  ): Promise<any> {
    try {
      // The incoming recovery phrase as an array
      const recoveryPhrase: string[] = req.body.recoveryPhrase;

      // Response
      const response = await helpers.createWallet(recoveryPhrase);

      // Send response
      res.status(201).json({
        statusCode: 201,
        response
      });
    } catch (error) {
      // console.log(JSON.stringify(error));
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "createWallet()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(500).send(error.message);
    }
  }

  static async getWallet(
    req: express.Request & { privateKey: string; publicKey: string },
    res: express.Response
  ): Promise<any> {
    try {
      // Private key would be deserialized from a token and passed into the request object
      const privateKey: string = req.privateKey;
      const publicKey: string = req.publicKey;
      // Get wallet using private key
      const response = await helpers.getWallet(privateKey, publicKey);

      // Send response
      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "getWallet()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async updateWalletFaster(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<void> {
    try {
      // Get user's wallet
      const wallet = req.wallet;

      // Response
      const response = await helpers.updateWallet(wallet);

      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      // console.log(error);
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "updateWallet()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  // static async updateWallet(
  //  req: express.Request & { wallet: Wallet },
  //  res: express.Response
  // ): Promise<void> {
  //  try {
  //   // Get user's wallet
  //   const wallet = req.wallet;

  //   // Get BTC address details
  //   const btcDetailsResponse = await BTC.getAddressDetails(wallet.btc.address);

  //   // Throw error for 4XX and 5XX status code ranges
  //   if (btcDetailsResponse.statusCode >= 400)
  //    throw new CustomError(
  //     btcDetailsResponse.statusCode,
  //     errorCodes[btcDetailsResponse.statusCode]
  //    );

  //   // Get ETH address details
  //   const ethDetailsResponse = await ETH.getAddressDetails(wallet.eth.address);

  //   // Throw error for 4XX and 5XX status code ranges
  //   if (ethDetailsResponse.statusCode >= 400)
  //    throw new CustomError(
  //     ethDetailsResponse.statusCode,
  //     errorCodes[ethDetailsResponse.statusCode]
  //    );

  //   // Get DOGE address details
  //   const dogeDetailsResponse = await DOGE.getAddressDetails(
  //    wallet.doge.address
  //   );

  //   // Throw error for 4XX and 5XX status code ranges
  //   if (dogeDetailsResponse.statusCode >= 400)
  //    throw new CustomError(
  //     dogeDetailsResponse.statusCode,
  //     errorCodes[dogeDetailsResponse.statusCode]
  //    );

  //   // Get LTC address details
  //   const ltcDetailsResponse = await LTC.getAddressDetails(wallet.ltc.address);

  //   // Throw error for 4XX and 5XX status code ranges
  //   if (ltcDetailsResponse.statusCode >= 400)
  //    throw new CustomError(
  //     ltcDetailsResponse.statusCode,
  //     errorCodes[ltcDetailsResponse.statusCode]
  //    );

  //   // Get TRON address details
  //   const tronDetailsResponse = await TRON.getAddressDetails(wallet.trx.address);

  //   // Get DASH address details
  //   const dashDetailsResponse = await DASH.getAddressDetails(
  //    wallet.dash.address
  //   );

  //   // Throw error if any
  //   if (dashDetailsResponse.statusCode >= 400)
  //    throw new CustomError(
  //     dashDetailsResponse.statusCode,
  //     errorCodes[dashDetailsResponse.statusCode]
  //    );

  //   // Get HMY address details
  //   // const hmyDetailsResponse = await HMY.getAddressDetails(wallet.one.address);

  //   // Update wallet
  //   wallet.balance =
  //    parseFloat(btcDetailsResponse.payload.balance) +
  //    parseFloat(ethDetailsResponse.payload.balance) +
  //    parseFloat(dogeDetailsResponse.payload.balance) +
  //    parseFloat(ltcDetailsResponse.payload.balance) +
  //    tronDetailsResponse.payload.balance +
  //    parseFloat(dashDetailsResponse.payload.balance);
  //   // hmyDetailsResponse.payload.balance
  //   wallet.btc.balance = parseFloat(btcDetailsResponse.payload.balance);
  //   wallet.eth.balance = parseFloat(ethDetailsResponse.payload.balance);
  //   // wallet.eth.tokens = ethDetailsResponse.payload.tokens;
  //   wallet.doge.balance = parseFloat(dogeDetailsResponse.payload.balance);
  //   wallet.ltc.balance = parseFloat(ltcDetailsResponse.payload.balance);
  //   wallet.trx.balance = tronDetailsResponse.payload.balance;
  //   wallet.dash.balance = parseFloat(dashDetailsResponse.payload.balance);
  //   // wallet.one.balance = hmyDetailsResponse.payload.balance;

  //   // console.log("tokens",  ethDetailsResponse.payload.tokens);

  //   // Update wallet in db
  //   const newWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);

  //   res.status(200).json({
  //    statusCode: 200,
  //    response: await WalletAdaptor.convert(newWallet)
  //   });
  //  } catch (error) {
  //   res.status(error.code || 500).send(error.message);
  //  }
  // }

  static async importWallet(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<void> {
    try {
      const { wallet } = req;

      // Response
      const response = await helpers.importWallet(wallet);

      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "importWallet()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(500).send(error.message);
    }
  }

  static async sendToken(
    req: express.Request & { wallet: Wallet; privateKey: string },
    res: express.Response
  ): Promise<any> {
    try {
      // Wallet type. BTC (Bitcoin), ETH (Ethereum) e.t.c.
      const { type } = req.body;

      // console.log(type, JSON.stringify(req.body));

      // Sender's wallet
      const senderWallet = req.wallet;

      // Response
      const response = await helpers.sendToken(
        type,
        req.body,
        req.privateKey,
        senderWallet
      );

      //Send response
      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      // console.log(error);
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "sendToken()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async getTransactions(
    req: express.Request,
    res: express.Response
  ): Promise<any> {
    try {
      const { ticker, address } = req.params;

      // Response
      const response = await helpers.getTransactions(ticker, address);

      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "getTransactions()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }
  static async refreshPrices(
    req: express.Request,
    res: express.Response
  ): Promise<any> {
    try {
      // Response
      const response = await helpers.refreshPrices();

      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "refreshPrices()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async refreshPrice(
    req: express.Request,
    res: express.Response
  ): Promise<any> {
    try {
      const { ticker } = req.params;
      const response = await helpers.refreshPrice(ticker);
      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "refreshPrice()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  // static async getErc20Price(req: express.Request, res: express.Response): Promise<any> {
  //  try {
  //   const currencyConverter = await CurrencyConverter.getInstance();
  //   const { contract } = req.params;
  //   res.status(200).json({
  //    statusCode: 200,
  //    response: await currencyConverter.getERC20InUSD(contract)
  //   });
  //  } catch (error) {
  //   res.status(500).json({
  //    statusCode: 500,
  //    response: error.message
  //   });
  //  }
  // }

  static async getEstimatedTransactionFee(
    req: express.Request,
    res: express.Response
  ): Promise<any> {
    try {
      const { ticker } = req.params;
      const fromAddress: string = req.body.fromAddress;
      const toAddress: string = req.body.toAddress;
      const value: number = req.body.value;
      const contract: string = req.body.contract;
      const txFee: any = await helpers.getEstimatedTransactionFee(
        ticker,
        fromAddress,
        toAddress,
        contract,
        value
      );
      res.status(200).json({
        statusCode: 200,
        txFee
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "getEstimatedTransactionFee()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(500).send(error.message);
    }
  }

  static async getERC20Tokens(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<any> {
    try {
      const { wallet } = req;
      const response = await helpers.getERC20Tokens(wallet);

      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "getERC20Tokens()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async transferERC20Token(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<any> {
    try {
      const { wallet, body } = req;
      const response = await helpers.transferERC20Tokens(wallet, body);
      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "transferERC20Token()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async transferERC721Token(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<any> {
    try {
      const { wallet, body } = req;
      const response = await helpers.transferERC721Tokens(wallet, body);
      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "transferERC721Token()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async transferTrxAssets(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<any> {
    try {
      const { body, wallet } = req;
      const response = await helpers.transferTronAssets(wallet, body);
      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "transferTrxAssets()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async getETHTransactionDetails(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ) {
    try {
      const { wallet, params } = req;
      const txn = await helpers.getEthTransactionDetails(wallet, params);
      res.status(200).json({
        statusCode: 200,
        response: { ...txn.payload }
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "getETHTransactionDetails()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async importCoin(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<any> {
    try {
      const { wallet, body } = req;
      const { privateKey, type } = body;
      const response = await helpers.importCoin(wallet, privateKey, type);

      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "importCoin()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async importByPrivateKey(req: express.Request, res: express.Response) {
    try {
      const wallet = await DBWallet.findByPrivateKey(req.body.privateKey);
      const response = await helpers.importByPrivateKey(wallet);
      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      // console.log(error);
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "importByPrivateKey()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async getSupportedERC20Tokens(
    req: express.Request,
    res: express.Response
  ): Promise<any> {
    try {
      const response = await helpers.getSupportedERC20Tokens();
      res.status(200).json({
        statusCode: 200,
        response
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "getSupportedERC20Tokens()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(error.code || 500).send(error.message);
    }
  }

  static async addCustomERC20Token(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<any> {
    try {
      const { wallet, body } = req;
      await helpers.addCustomERC20Token(wallet, body);
      res.status(200).json({
        statusCode: 200,
        response: "Successfully added custom token"
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "addCustomERC20Token()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(500).send(error.message);
    }
  }

  static async addCustomERC721Token(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<any> {
    try {
      const { wallet, body } = req;
      await helpers.addCustomERC721Token(wallet, body);
      res.status(200).json({
        statusCode: 200,
        response: "Successfully added custom token"
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "addCustomERC721Token()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(500).send(error.message);
    }
  }

  static async addCustomTRCToken(
    req: express.Request & { wallet: Wallet },
    res: express.Response
  ): Promise<any> {
    try {
      const { wallet, body } = req;
      await helpers.addCustomTRCToken(wallet, body);
      res.status(200).json({
        statusCode: 200,
        response: "Successfully added custom token"
      });
    } catch (error) {
      await helpers.sendMail("err", {
        aspect: "Core",
        feature: "addCustomTRCToken()",
        endpoint: req.path,
        exact: error.message
      });
      res.status(500).send(error.message);
    }
  }
}
