import { Transaction } from "../interfaces";

export class Tokenizers {
 static signTransaction(tx: Transaction, privateKey: string): Transaction {
  tx.signature = "";
  return tx;
 }
}