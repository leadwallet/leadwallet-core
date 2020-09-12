import express from "express";
import db from "../db";
import { Wallet } from "../core/interfaces";
import { Tokenizers } from "../core/utils";
import { CustomError } from "../custom";
import { BTC, ETH, DOGE } from "../core/handlers";

const { DBWallet } = db;
const errorCodes = {
 400: "BAD REQUEST",
 401: "UNAUTHORIZED",
 402: "PAYMENT REQUIRED",
 403: "FORBIDDEN",
 404: "NOT FOUND",
 408: "REQUEST TIMEOUT",
 500: "INTERNAL SERVER ERROR",
 502: "BAD GATEWAY",
 503: "SERVICE UNAVAILABLE",
 504: "GATEWAY TIMEOUT"
};

export class WalletController {
 static async createWallet(req: express.Request, res: express.Response): Promise<any> {
  try {
   // String that would be created from the incoming array of phrases
   let phrase = "";

   // The incoming recovery phrase as an array
   const recoveryPhrase: string[] = req.body.recoveryPhrase;

   // Loop through array and then append to 'phrase' string
   for (const p of recoveryPhrase) 
    phrase += p + " ";
   
    // Generate keypair
   const keyPair = await Tokenizers.generateKeyPairs(phrase);

   // Generate BTC address
   const btcAddressCreationResponse = await BTC.createAddress();
   // console.log(btcAddressCreationResponse.payload);

   // Throw error if btc response code is within 4XX or 5XX range

   if (btcAddressCreationResponse.statusCode >= 400)
    throw new CustomError(btcAddressCreationResponse.statusCode, errorCodes[btcAddressCreationResponse.statusCode]);

   // Generate ETH address
   const ethAddressCreationResponse = await ETH.createAddress();

   // Throw error if eth response code is within 4XX or 5XX range
   if (ethAddressCreationResponse.statusCode >= 400)
    throw new CustomError(ethAddressCreationResponse.statusCode, errorCodes[ethAddressCreationResponse.statusCode]);

   // Generate DOGE address
   const dogeAddressCreationResponse = await DOGE.createAddress(); 

   // Throw error if doge response code is within 4XX or 5XX range
   if (dogeAddressCreationResponse.statusCode >= 400)
    throw new CustomError(dogeAddressCreationResponse.statusCode, errorCodes[dogeAddressCreationResponse.statusCode]);
   
   // Get BTC address details
   const btcAddressDetailsResponse = await BTC.getAddressDetails(btcAddressCreationResponse.payload.address);
   // console.log(btcAddressDetailsResponse.payload);

   // Get ETH address details
   const ethAddressDetailsResponse = await ETH.getAddressDetails(ethAddressCreationResponse.payload.address);

   // Get DOGE address details
   const dogeAddressDetailsResponse = await DOGE.getAddressDetails(dogeAddressCreationResponse.payload.address);
   
   // Instantiate wallet
   const wallet: Wallet = {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    balance: parseInt(btcAddressDetailsResponse.payload.balance) + parseInt(ethAddressDetailsResponse.payload.balance) + parseInt(dogeAddressDetailsResponse.payload.balance),
    hash: Tokenizers.hash(keyPair.publicKey + keyPair.privateKey),
    btc: {
     address: btcAddressCreationResponse.payload.address,
     wif: btcAddressCreationResponse.payload.wif,
     balance: parseInt(btcAddressDetailsResponse.payload.balance)
    },
    eth: {
     address: ethAddressCreationResponse.payload.address,
     balance: parseInt(ethAddressDetailsResponse.payload.balance)
    },
    doge: {
     address: dogeAddressCreationResponse.payload.address,
     wif: dogeAddressCreationResponse.payload.wif,
     balance: parseInt(dogeAddressDetailsResponse.payload.balance)
    }
   };

   // Save wallet to db and get as object
   const newWallet = await DBWallet.create(wallet, wallet.privateKey);

   // API Response
   const response = {
    wallet: newWallet,
    token: Tokenizers.generateToken({
     privateKey: newWallet.privateKey,
     publicKey: newWallet.publicKey
    })
   };

   // Send response
   res.status(201).json({
    statusCode: 201,
    response
   });
  } catch (error) {
   res.status(error.code || 500).json({
    statusCode: error.code || 500,
    response: error.message
   });
  }
 }

 static async getWallet(req: express.Request & { privateKey: string; }, res: express.Response): Promise<any> {
  try {
   // Private key would be deserialized from a token and passed into the request object
   const privateKey: string = req.privateKey;

   // Get wallet using private key
   const wallet = await DBWallet.getWallet(privateKey);

   // Send response
   res.status(200).json({
    statusCode: 200,
    response: wallet
   });
  } catch (error) {
   res.status(500).json({
    statusCode: 500,
    response: error.message
   });
  }
 }

 static async updateWallet(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<void> {
  try {
   // Get user's wallet
   const wallet = req.wallet;

   // Get BTC address details
   const btcDetailsResponse = await BTC.getAddressDetails(wallet.btc.address);

   // Throw error for 4XX and 5XX status code ranges
   if (btcDetailsResponse.statusCode >= 400)
    throw new CustomError(btcDetailsResponse.statusCode, errorCodes[btcDetailsResponse.statusCode]);

   // Get ETH address details
   const ethDetailsResponse = await ETH.getAddressDetails(wallet.eth.address);

   // Throw error for 4XX and 5XX status code ranges
   if (ethDetailsResponse.statusCode >= 400)
    throw new CustomError(ethDetailsResponse.statusCode, errorCodes[ethDetailsResponse.statusCode]);

   // Get DOGE address details
   const dogeDetailsResponse = await DOGE.getAddressDetails(wallet.doge.address);

   // Throw error for 4XX and 5XX status code ranges
   if (dogeDetailsResponse.statusCode >= 400)
    throw new CustomError(dogeDetailsResponse.statusCode, errorCodes[dogeDetailsResponse.statusCode]);

   // Update wallet
   wallet.balance = parseInt(btcDetailsResponse.payload.balance) + parseInt(ethDetailsResponse.payload.balance) + parseInt(dogeDetailsResponse.payload.balance);
   wallet.btc.balance = parseInt(btcDetailsResponse.payload.balance);
   wallet.eth.balance = parseInt(ethDetailsResponse.payload.balance);
   wallet.doge.balance = parseInt(dogeDetailsResponse.payload.balance);

   // Update wallet in db
   const newWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);

   res.status(200).json({
    statusCode: 200,
    response: newWallet
   });
  } catch (error) {
   res.status(error.code || 500).json({
    statusCode: error.code || 500,
    response: error.message
   });
  }
 }

 static async importWallet(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<void> {
  try {
   const { wallet } = req;
   const token = Tokenizers.generateToken({
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey
   });
   res.status(200).json({
    statusCode: 200,
    response: {
     wallet,
     token
    }
   });
  } catch (error) {
   res.status(500).json({
    statusCode: 500,
    response: error.message
   });
  }
 }

 static async sendToken(req: express.Request & { wallet: Wallet; privateKey: string; }, res: express.Response): Promise<any> {
  try {
   // Wallet type. BTC (Bitcoin), ETH (Ethereum) e.t.c.
   const { type } = req.body;

   // Sender's wallet
   const senderWallet = req.wallet;

   // Empty array of wallets. Would serve as updated recipients' wallets
   let wallets: Array<Wallet> = [];

   // Empty array of encrypted recipients' wallets
   const encRecipientWallets: Array<string> = [];

   // All wallets in the database. Recipient's wallet would be singled out and updated
   const allWallets = await DBWallet.getAllWallets();

   // Total balance to be sent
   let balance: number = 0;

   if (type === "btc") {

    // Increment balance for every input
    for (const i of req.body.inputs)
     balance = balance + i.value
  
    // Throw error if sender's balance is less than balance to be sent
    if (senderWallet.balance < balance)
     throw new CustomError(400, "Wallet balance is not sufficient.");

    // Throw error if sender's btc balance is less than balance to be sent
    if (senderWallet.btc.balance < balance)
     throw new CustomError(400, "Insufficient BTC balance");

    // Check for matching btc address
    for (const o of req.body.outputs)
     for (const w of allWallets)
      if (o.address === w.btc.address)
       wallets = [...wallets, w];
    
    // Send BTC
    const btcSentResponse = await BTC.sendToken(
     req.body.inputs,
     req.body.outputs,
     { address: senderWallet.btc.address, value: 0.000141 },
     JSON.stringify({
      initialBalance: senderWallet.balance,
      newBalance: senderWallet.balance - balance
     })
    );

    // Throw error for 4XX or 5XX status code ranges
    if (btcSentResponse.statusCode >= 400)
     throw new CustomError(btcSentResponse.statusCode, errorCodes[btcSentResponse.statusCode]);
    
     // Loop through array of recipients' wallets
     for (const w of wallets)
      for (const o of req.body.outputs)
       if (o.address === w.btc.address) {
        const wallet: Wallet = w;
        wallet.balance = wallet.balance + o.value;
        wallet.btc.balance = wallet.btc.balance + o.value;
        encRecipientWallets.push(
         Tokenizers.encryptWallet(
          await DBWallet.updateWallet(wallet.privateKey, wallet)
         )
        );
       }
       // Update sender's btc balance
       senderWallet.btc.balance = senderWallet.btc.balance - balance;
      } else if (type === "eth") {
       // Increment balance
       balance = balance + req.body.value;

       // Throw error if balance is more than sender's wallet balance
       if (senderWallet.balance < balance)
        throw new CustomError(400, "Wallet balance is not sufficient.");

       // Throw error if sender's ethereum balance is less than balance to be sent
       if (senderWallet.eth.balance < balance)
        throw new CustomError(400, "Insufficient ETH balance.");

       // Find matching wallet
       for (const w of allWallets)
        if (w.eth.address === req.body.toAddress)
         wallets = [...wallets, w];

       // Send ETH
       const ethSentResponse = await ETH.sendToken({
        fromAddress: req.wallet.eth.address,
        toAddress: req.body.toAddress,
        gasPrice: 21000000000,
        gasLimit: 21000,
        value: req.body.value,
        password: req.body.passphrase,
        nonce: 0
       });

       // Throw error for 4XX or 5XX status code ranges
       if (ethSentResponse.statusCode >= 400)
        throw new CustomError(ethSentResponse.statusCode, errorCodes[ethSentResponse.statusCode]);
       
       // Loop through array
       for (const w of wallets)
        if (w.eth.address === req.body.toAddress) {
         const wallet: Wallet = w;
         wallet.balance = wallet.balance + req.body.value;
         wallet.eth.balance = wallet.eth.balance + req.body.value;
         encRecipientWallets.push(
          Tokenizers.encryptWallet(
           await DBWallet.updateWallet(wallet.privateKey, wallet)
          )
         );
        }
       
       // Update sender's wallet eth balance
       senderWallet.eth.balance = senderWallet.eth.balance - balance;
      } else if (type === "doge") {
       // Increment balance
       for (const i of req.body.inputs)
        balance = balance + i.value;

       // Throw error if sender's wallet balance is less than specified balance
       if (senderWallet.balance < balance)
        throw new CustomError(400, "Wallet balance is not sufficient");

       // Throw error if doge balance is less than the specified balance
       if (senderWallet.doge.balance < balance)
        throw new CustomError(400, "Insufficient DOGE balance.");

       // Find matching wallet
       for (const o of req.body.outputs)
        for (const w of allWallets)
         if (w.doge.address === o.address)
          wallets = [...wallets, w];

        // Send DOGE
        const dogeSentResponse = await DOGE.sendToken(
         req.body.inputs,
         req.body.outputs,
         req.body.fee
        );

        // Throw error if status code is within 4XX and 5XX ranges
        if (dogeSentResponse.statusCode >= 400)
         throw new CustomError(dogeSentResponse.statusCode, errorCodes[dogeSentResponse.statusCode]);

        // Loop through recipients' wallets
        for (const w of wallets)
         for (const o of req.body.outputs)
          if (o.address === w.doge.address) {
           const wallet: Wallet = w;
           wallet.balance = wallet.balance + o.value;
           wallet.doge.balance = wallet.doge.balance + o.value;
           encRecipientWallets.push(
            Tokenizers.encryptWallet(
             await DBWallet.updateWallet(wallet.privateKey, wallet)
            )
           );
          }
        
        // Update sender's wallet doge balance
        senderWallet.doge.balance = senderWallet.doge.balance - balance;
      }

   // Update sender's wallet balance by deducting from it 
   senderWallet.balance = senderWallet.balance - balance;

   // Update sender's wallet
   const updatedSenderWallet = await DBWallet.updateWallet(req.privateKey, senderWallet);

   // API response
   const response = {
    sender: Tokenizers.encryptWallet(updatedSenderWallet),
    recipients: encRecipientWallets,
    message: "Transaction successful."
   };

   //Send response
   res.status(200).json({
    statusCode: 200,
    response
   });
  } catch (error) {
   res.status(500).json({
    statusCode: 500,
    response: error.message
   });
  }
 }
}
