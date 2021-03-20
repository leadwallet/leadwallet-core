import { ERCToken, TRCToken, BEPToken, CUsd } from "./token";

export interface Wallet {
  publicKey: string;
  privateKey: string;
  hash: string;
  balance: number;
  btc?: {
    address: string;
    wif: string;
    balance: number;
    pk?: string;
  };
  eth?: {
    address: string;
    balance: number;
    tokens?: Array<ERCToken>;
    collectibles?: Array<ERCToken>;
    pk?: string;
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
    tokens?: Array<TRCToken>;
  };
  dash?: {
    address: string;
    wif: string;
    balance: number;
  };
  // xrp?: {
  //  address: string;
  //  secret: string;
  //  balance: number;
  // };
  bnb?: {
    address: string;
    pk?: string;
    balance: number;
    tokens?: Array<BEPToken>;
  };
  dot?: {
    address: string;
    pk: string;
    balance: number;
  };
  // one?: {
  //  address: string;
  //  balance: number;
  // };
  xtz?: {
    address: string;
    pk: string;
    balance: number;
    revealed?: boolean;
  };
  xlm?: {
    address: string;
    pk: string;
    balance: number;
  };
  celo?: {
    address: string;
    pk: string;
    balance: number;
    token: CUsd;
  };
  near?: {
    address: string;
    pk: string;
    balance: number;
  };
  zil?: {
    address: string;
    pk: string;
    balance: number;
  };
  ksm?: {
    address: string;
    pk: string;
    balance: number;
  };
  xem?: {
    address: string;
    pk: string;
    balance: number;
  };
}
