export interface Wallet {
 publicKey: string;
 privateKey: string;
 hash: string;
 balance: number;
 btc?: {
  address: string;
  wif: string;
  balance: number;
 };
 eth?: {
  address: string;
  balance: number;
 };
 doge?: {
  address: string;
  wif: string;
  balance: number;
 }
}

