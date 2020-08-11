import mongoose from "mongoose";
import { Wallet } from "../../core/interfaces";
import { Tokenizers } from "../../core/utils";

export class WalletModel {
 model: mongoose.Model<mongoose.Document, {}>

 constructor() {
  this.define();
 }

 private define() {
  this.model = mongoose.model("Wallet", new mongoose.Schema({
   encryptedPrivateKey: String,
   encryptedWallet: {
    type: String,
    required: true
   }
  }));
 }

 async create(wallet: Wallet): Promise<Wallet> {
  const encryptedWallet = Tokenizers.encryptWallet(wallet);
  const walletModel: mongoose.Document & { encryptedWallet: string } | any = await this.model.create({
   encryptedPrivateKey: "",
   encryptedWallet
  });
  const decryptedWallet: Wallet = Tokenizers.decryptWallet(walletModel.encryptedWallet, wallet.privateKey);
  return Promise.resolve(decryptedWallet);
 }

 async getWallet(privateKey: string): Promise<Wallet> {
  const encryptedWallets = await this.model.find();
  let encryptedWallet = null;
  encryptedWallets.forEach((encWallet: mongoose.Document & { encryptedPrivateKey: string, encryptedWallet: string }) => {
   if (Tokenizers.decryptPrivateKey(encWallet.encryptedPrivateKey, privateKey) === privateKey)
    encryptedWallet = encWallet;
  });
  const decryptedWallet: Wallet = Tokenizers.decryptWallet(encryptedWallet, privateKey);
  return Promise.resolve(decryptedWallet);
 }
}
