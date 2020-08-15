import express from "express";
import db from "../db";
import { Wallet } from "../core/interfaces";
import { Tokenizers } from "../core/utils";
import { CustomError } from "../custom";
import { BTC } from "../core/handlers";

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
}

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

   // Get BTC address details
   const btcAddressDetailsResponse = await BTC.getAddressDetails(btcAddressCreationResponse.payload.address);
   // console.log(btcAddressDetailsResponse.payload);
   
   // Instantiate wallet
   const wallet: Wallet = {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    balance: parseInt(btcAddressDetailsResponse.payload.balance),
    hash: Tokenizers.hash(keyPair.publicKey + keyPair.privateKey),
    btcAddress: btcAddressCreationResponse.payload.address
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

 static async importWallet(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<void> {
  try {
   const { wallet } = req;
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

 static async sendToken(req: express.Request & { wallet: Wallet; privateKey: string; }, res: express.Response): Promise<any> {
  try {
   // Token's recipient
   const recipient = req.body.recipient;

   // Sender's wallet
   const senderWallet = req.wallet;

   // Null wallet interface. Would serve as updated recipient's wallet
   let wallet: Wallet = null;

   // All wallets in the database. Recipient's wallet would be singled out and updated
   const allWallets = await DBWallet.getAllWallets();

   // Loop through all wallets and find recipient's wallet.
   for (const w of allWallets)
    if (w.publicKey === recipient)
     wallet = w;
    
   // Throw an error with code 400 if sender's wallet balance is less than token to be sent
   if (senderWallet.balance < parseInt(req.body.amount))
    throw new CustomError(400, "Not enough token");
   
   // Send BTC
   const btcSentResponse = await BTC.sendToken(
    [{ address: senderWallet.btcAddress, value: parseInt(req.body.amount) }],
    [{ address: recipient, value: parseInt(req.body.amount) }],
    { address: senderWallet.btcAddress, value: 0.000141 },
    JSON.stringify({
     initialBalance: senderWallet.balance,
     newBalance: senderWallet.balance - parseInt(req.body.amount)
    })
   );

   // Throw error for 4XX or 5XX status code ranges
   if (btcSentResponse.statusCode >= 400)
    throw new CustomError(btcSentResponse.statusCode, errorCodes[btcSentResponse.statusCode]);
   
   // Update recipient's wallet balance by adding to it
   wallet.balance = wallet.balance + parseInt(req.body.amount);

   // Update sender's wallet balance by deducting from it 
   senderWallet.balance = senderWallet.balance - parseInt(req.body.amount);

   // Update both wallets
   const updatedSenderWallet = await DBWallet.updateWallet(req.privateKey, senderWallet);
   const updatedRecipientWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);

   // API response
   const response = {
    senderWallet: Tokenizers.encryptWallet(updatedSenderWallet),
    recipientWallet: Tokenizers.encryptWallet(updatedRecipientWallet),
    message: "Token has been sent."
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
