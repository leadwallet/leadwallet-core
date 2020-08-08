export interface Block {
 index: number;
 nonce: number;
 timestamp: number;
 hash: string;
 previousHash: string;
 transactions: string; // Transactions held by a block. Serialized as a web token.
}

export type Blocks = Array<Block>;
