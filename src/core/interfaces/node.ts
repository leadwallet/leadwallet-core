export interface Node {
 id: string;
 chain: string; // Node's copy of the blockchain serialized as a web token
 address: string; // Node's Lead Wallet address. This would be useful in giving reward to node that successfully mines a block. 
}
