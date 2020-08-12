import crypto from "crypto";
import hasher from "crypto-js";
import jwt from "jsonwebtoken";
import { Wallet } from "../interfaces";
import { Environment } from "../../env";
// import { TransactionStatus } from "../enums";

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

 // static signTransaction(tx: Transaction, privateKey: string): Transaction {
 //  const txStringified = JSON.stringify({
 //   recipient: tx.recipient,
 //   sender: tx.sender,
 //   amount: tx.amount,
 //   id: tx.id
 //  });
 //  const signed = crypto.sign("SHA256", Buffer.from(txStringified), privateKey);
 //  tx.signature = signed.toString();
 //  return tx;
 // }

 // static verifyTransaction(tx: Transaction, publicKey: string): Transaction {
 //  tx.status = TransactionStatus.CONFIRMED;
 //  return tx;
 // }

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
  return jwt.sign(privateKey, publicKey);
 }

 static decryptPrivateKey(encryptedKey: string): string {
  return (jwt.decode(encryptedKey) as string);
 }

 static generateToken(payload: { privateKey: string; publicKey: string; }): string {
  return jwt.sign(payload, Environment.JWT_SECRET);
 }

 static decodeToken(token: string): { privateKey: string; publicKey: string; } {
  return (jwt.verify(token, Environment.JWT_SECRET) as { privateKey: string; publicKey: string; });
 }

 // static encryptChain(blocks: Blocks): string {
 //  const encrypted = jwt.sign(JSON.stringify(blocks), "");
 //  return encrypted;
 // }

 // static decryptChain(token: string): Blocks {
 //  const decrypted: any = jwt.verify(token, "");
 //  return JSON.parse(decrypted);
 // }

 // static encryptBlock(block: Block): string {
 //  const encrypted = jwt.sign(block, "");
 //  return encrypted;
 // }

 // static decryptBlock(token: string): Block {
 //  const decrypted: any = jwt.verify(token, "");
 //  return decrypted;
 // }
}