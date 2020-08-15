export interface Wallet {
 publicKey: string;
 privateKey: string;
 hash: string;
 balance: number;
 btcAddress?: string;
 ethAddress?: string;
}

