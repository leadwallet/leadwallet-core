import { Block } from "../interfaces";
import { Tokenizers } from "../utils";

export class BlockHandler {
 block: Block

 constructor(block: Block) {
  const { index, timestamp, previousHash, nonce, transactions } = block;
  this.block = { 
   index, timestamp, previousHash, nonce, transactions, hash: this.createHash(block)
  };
 }
 
 public getBlock() {
  return this.block;
 }

 private createHash(block: Block): string {
  return Tokenizers.hash(
   block.index + block.timestamp + block.previousHash + block.nonce + block.transactions
  );
 }

 public mine(block: Block, difficulty: number): Block {
  while (block.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
   block.nonce = block.nonce + 1;
   block.timestamp = Date.now();
   block.hash = this.createHash(block);
  }
  return block;
 }
}
