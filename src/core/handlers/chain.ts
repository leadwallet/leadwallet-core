import { Blocks } from "../interfaces";
import { Tokenizers } from "../utils";

export class BlockChain {
 chain: Blocks

 constructor(chain: Blocks) {
  this.chain = [...chain];
 }

 public chainIsValid(): boolean {
  for (const block of this.chain) {
   const currentBlock = this.chain[block.index - 1];
   const previousBlock = this.chain[block.index - 2];
   if (currentBlock.previousHash !== previousBlock.hash)
    return false;
   if (
    currentBlock.hash !== Tokenizers.hash(currentBlock.index + currentBlock.timestamp + currentBlock.previousHash + currentBlock.nonce + currentBlock.transactions)
    )
    return false;
  }
  return true;
 }

 public getBlocks() {
  return this.chain;
 }
}
