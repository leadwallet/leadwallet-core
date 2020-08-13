import express from "express";
import { Tokenizers } from "../core/utils";
import { CustomError } from "../custom";
import db from "../db";
import { Wallet } from "../core/interfaces";

const { DBWallet } = db;

export class WalletMiddleware {
 static async getKeyPair(req: express.Request & { privateKey: string; publicKey: string; }, res: express.Response, next: express.NextFunction): Promise<any> {
  try {
   // Request authorization header
   const authorization = req.headers.authorization;

   // Throw error if header is null
   if (!authorization)
    throw new CustomError(400, "Authorization header is null.");
   
    // Throw error if header doesn't begin with a 'Bearer' string
    if (!authorization.startsWith("Bearer"))
     throw new CustomError(400, "Authorization header must begin with 'Bearer'");
   
   // Token from authorization header
   const token = authorization.substring(7, authorization.length);

   // Check if token's length is equal to 0 and if it is, throw an error
   if (token.trim().length === 0)
    throw new CustomError(400, "Token not found in header.");

   // Key pair from token
   const pair = Tokenizers.decodeToken(token);

   // Confirm that object isn't null
   if (!pair)
    throw new CustomError(400, "Key pair object could not be deserialized from token.");
   
   // Modify the request if key pair was successfully deserialized
   req.privateKey = pair.privateKey;
   req.publicKey = pair.publicKey;

   // Pass control to the next controller
   next();
  } catch (error) {
   res.status(error.code || 500).json({
    statusCode: error.code || 500,
    response: error.message
   });
  }
 }

 static async getWalletFromRequest(
  req: express.Request & { privateKey: string; wallet: Wallet },
  res: express.Response,
  next: express.NextFunction
 ) {
  try {
   // Get wallet from privateKey
   const wallet = await DBWallet.getWallet(req.privateKey);

   // Check if wallet is null
   if (!wallet)
    throw new CustomError(404, "Wallet not found");
   
    // Modify the request
    req.wallet = wallet;

    // Delegate control to the next function
    next();
  } catch (error) {
   res.status(error.code || 500).json({
    statusCode: error.code || 500,
    response: error.message
   });
  }
 }

 static async recoverWallet(
  req: express.Request & { wallet: Wallet },
  res: express.Response,
  next: express.NextFunction
 ): Promise<any> {
  try {
   // Phrase to use in recovery
   let phrase: string = "";

   // The incoming recovery phrase
   const recoveryPhrase: string[] = req.body.recoveryPhrase;

   // Loop through and append to actual phrase
   for (const p of recoveryPhrase)
    phrase += p + " ";

   // Generate key pair
   const keyPair = Tokenizers.generateKeyPairs(phrase);

   // Get wallet using private key
   const wallet: Wallet = await DBWallet.getWallet(keyPair.privateKey);

   // Respond with a 404 if wallet is not found
   if (!wallet)
    throw new CustomError(404, "Wallet not found");

   // Modify the request
   req.wallet = wallet;

   // Delegate control to the next controller function
   next();
  } catch (error) {
   res.status(error.code || 500).json({
    statusCode: error.code || 500,
    response: error.message
   });
  }
 }
}
