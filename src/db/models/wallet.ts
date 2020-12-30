import mongoose from "mongoose";
import { Wallet } from "../../core/interfaces";
import { Tokenizers } from "../../core/utils";

export class WalletModel {
 model: mongoose.Model<mongoose.Document>;

 constructor() {
  this.define();
 }

 private define() {
  this.model = mongoose.model(
   "Wallet",
   new mongoose.Schema({
    encryptedPrivateKey: String,
    encryptedWallet: {
     type: String,
     required: true
    }
   })
  );
 }

 async create(wallet: Wallet, privateKey: string): Promise<Wallet> {
  const encryptedWallet = Tokenizers.encryptWallet(wallet);
  const walletModel: any = await this.model.create({
   encryptedPrivateKey: Tokenizers.encryptPrivateKey(
    privateKey,
    wallet.publicKey
   ),
   encryptedWallet
  });
  const decryptedWallet: Wallet = Tokenizers.decryptWallet(
   walletModel.encryptedWallet,
   wallet.privateKey
  );
  return Promise.resolve(decryptedWallet);
 }

 async getWallet(privateKey: string, publicKey: string): Promise<Wallet> {
  const encPrivateKey: string = Tokenizers.encryptPrivateKey(
   privateKey,
   publicKey
  );
  // Below find utilizes the indexing created on encryptedPrivateKey field
  // and is way faster than linear search on whole collection
  const encWallet: mongoose.Document & {
   encryptedPrivateKey: string;
   encryptedWallet: string;
  } = (await this.model.findOne({
   encryptedPrivateKey: encPrivateKey
  })) as mongoose.Document & {
   encryptedPrivateKey: string;
   encryptedWallet: string;
  };
  const encryptedWallet: string = encWallet.encryptedWallet;
  const decryptedWallet: Wallet = Tokenizers.decryptWallet(
   encryptedWallet,
   privateKey
  );
  return Promise.resolve(decryptedWallet);
 }

 async findByPrivateKey(privateKey: string): Promise<Wallet> {
  let wallet: Wallet = null;
  const allWallets = (await this.model.find()) as any;

  for (const doc of allWallets) {
   const pk = Tokenizers.decryptPrivateKey(doc.encryptedPrivateKey);
   if (pk === privateKey)
    wallet = Tokenizers.decryptWallet(doc.encryptedWallet, privateKey);
  }

  return Promise.resolve(wallet);
 }

 async updateWallet(privateKey: string, newWallet: Wallet): Promise<Wallet> {
  const allWallets = await this.model.find();
  let w: Wallet = null;
  const updatedWallet = (await this.model.findOneAndUpdate(
   {
    encryptedPrivateKey: Tokenizers.encryptPrivateKey(
     privateKey,
     newWallet.publicKey
    )
   },
   {
    encryptedWallet: Tokenizers.encryptWallet(newWallet)
   },
   {
    new: true
   }
  )) as mongoose.Document & {
   encryptedWallet: string;
   encryptedPrivateKey: string;
  };
  w = Tokenizers.decryptWallet(updatedWallet.encryptedWallet, privateKey);
  return Promise.resolve(w);
 }
}
