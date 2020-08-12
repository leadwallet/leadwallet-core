import express from "express";
import db from "../db";
import { Wallet } from "../core/interfaces";
import { Tokenizers } from "../core/utils";

const { DBWallet } = db;

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
   const keyPair = Tokenizers.generateKeyPairs(phrase);
   
   // Instantiate wallet
   const wallet: Wallet = {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    balance: 0.00,
    hash: Tokenizers.hash(keyPair.publicKey + keyPair.privateKey)
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
   res.status(500).json({
    statusCode: 500,
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
   const recipient = req.params.recipient;

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
