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
 };
 ltc?: {
  address: string;
  wif: string;
  balance: number;
 };
 polka?: {
  address: string;
  balance: number;
 };
 trx?: {
  address: string;
  balance: number;
  pk?: string;
 },
 dash?: {
  address: string;
  wif: string;
  balance: number;
 }
 // one?: {
 //  address: string;
 //  balance: number;
 // }
}
