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

 async create(wallet: Wallet, privateKey: string): Promise<Wallet> {
  const encryptedWallet = Tokenizers.encryptWallet(wallet);
  const walletModel: mongoose.Document & { encryptedWallet: string } | any = await this.model.create({
   encryptedPrivateKey: Tokenizers.encryptPrivateKey(privateKey, wallet.publicKey),
   encryptedWallet
  });
  const decryptedWallet: Wallet = Tokenizers.decryptWallet(walletModel.encryptedWallet, wallet.privateKey);
  return Promise.resolve(decryptedWallet);
 }

 async getWallet(privateKey: string): Promise<Wallet> {
  const encryptedWallets = await this.model.find();
  let encryptedWallet = null;
  encryptedWallets.forEach((encWallet: mongoose.Document & { encryptedPrivateKey: string, encryptedWallet: string }) => {
   if (Tokenizers.decryptPrivateKey(encWallet.encryptedPrivateKey) === privateKey)
    encryptedWallet = encWallet;
  });
  const decryptedWallet: Wallet = Tokenizers.decryptWallet(encryptedWallet, privateKey);
  return Promise.resolve(decryptedWallet);
 }

 async getAllWallets(): Promise<Array<Wallet>> {
  const allWallets = await this.model.find();
  const allDecryptedWallets: Array<Wallet> = [];
  for (const doc of (<mongoose.Document[] & { encryptedWallet: string; encryptedPrivateKey: string }[]> allWallets))
   allDecryptedWallets.push(
    Tokenizers.decryptWallet(
     doc.encryptedWallet,
     Tokenizers.decryptPrivateKey(doc.encryptedPrivateKey)
    )
   );
  return Promise.resolve(allDecryptedWallets);
 }

 async updateWallet(privateKey: string, newWallet: Wallet): Promise<Wallet> {
  const allWallets = await this.model.find();
  let w: Wallet = null;
  for (const wallet of (allWallets as Array<mongoose.Document> & Array<{ encryptedPrivateKey: string; }>))
   if (Tokenizers.decryptPrivateKey(wallet.encryptedPrivateKey) === privateKey) {
    const updatedWallet = await this.model.findOneAndUpdate({
     encryptedPrivateKey: wallet.encryptedPrivateKey
    }, {
     encryptedWallet: Tokenizers.encryptWallet(newWallet)
    }, {
     new: true
    }) as mongoose.Document & { encryptedWallet: string; encryptedPrivateKey: string; };
    w = Tokenizers.decryptWallet(updatedWallet.encryptedWallet, privateKey);
   }
  return Promise.resolve(w);
 }
}
