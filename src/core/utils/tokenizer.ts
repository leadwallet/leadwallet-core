import crypto from "crypto";
import hasher from "crypto-js";
import jwt from "jsonwebtoken";
import { Transaction, Block, Wallet } from "../interfaces";
import { TransactionStatus } from "../enums";

export class Tokenizers {
 static hash(input: string): string {
  return hasher.SHA256(input).toString();
 }

 static generateKeyPairs(recoveryPhrase: string): { publicKey: string; privateKey: string } {
  const keyPair = crypto.generateKeyPairSync("rsa", {
   modulusLength: 2048,
   publicKeyEncoding: {
    type: "pkcs1",
    format: "der"
   },
   privateKeyEncoding: {
    type: "pkcs8",
    format: "der",
    passphrase: recoveryPhrase
   }
  });
  return {
   publicKey: keyPair.publicKey.toString("base64"),
   privateKey: keyPair.privateKey.toString("base64")
  }
 }

 static signTransaction(tx: Transaction, privateKey: string): Transaction {
  const txStringified = JSON.stringify({
   recipient: tx.recipient,
   sender: tx.sender,
   amount: tx.amount,
   id: tx.id
  });
  const signed = crypto.sign("SHA256", Buffer.from(txStringified), privateKey);
  tx.signature = signed.toString();
  return tx;
 }

 static verifyTransaction(tx: Transaction, publicKey: string): Transaction {
  tx.status = TransactionStatus.CONFIRMED;
  return tx;
 }

 static encryptWallet(wallet: Wallet): string {
  const walletStringified = JSON.stringify(wallet);
  const encrypted = crypto.publicEncrypt({
   key: wallet.publicKey,
   padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
   oaepHash: "sha256"
  }, Buffer.from(walletStringified));
  return encrypted.toString("base64");
 }

 static decryptWallet(encryptedWallet: string, privateKey: string): Wallet {
  const decrypted = crypto.privateDecrypt({
   key: privateKey,
   padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
   oaepHash: "sha256"
  }, Buffer.from(encryptedWallet, "base64"));
  return JSON.parse(
   decrypted.toString()
  );
 }

 static encryptPrivateKey(privateKey: string, publicKey: string): string {
  const encrypted = crypto.publicEncrypt({
   key: publicKey,
   padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
   oaepHash: "sha256"
  }, Buffer.from(privateKey));
  return encrypted.toString("base64");
 }

 static decryptPrivateKey(encryptedKey: string, privateKey: string): string {
  const decrypted = crypto.privateDecrypt({
   key: privateKey,
   padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
   oaepHash: "sha256"
  }, Buffer.from(encryptedKey, "base64"));
  return decrypted.toString();
 }
}