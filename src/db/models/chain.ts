import mongoose from "mongoose";
import { Blocks } from "../../core/interfaces";

export class ChainModel {
 model: mongoose.Model<mongoose.Document, {}>

 constructor() {
  this.define();
 }

 private define() {
  this.model = mongoose.model("Chain", new mongoose.Schema({
   encryptedChain: {
    type: String,
    required: true
   }
  }));
 }

 async getDecryptedChain(): Promise<Blocks> {
  const [ chain ] = await this.model.find();
  return Promise.resolve([]);
 }
}
