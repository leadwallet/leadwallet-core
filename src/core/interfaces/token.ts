export interface ERCToken {
  contract: string;
  symbol: string;
  name: string;
  type: string;
  balance: string;
  rate_in_usd?: number;
  decimals?: number;
}

export interface TRCToken {
  contract: string;
  symbol: string;
  type: string;
  balance: string;
  rate_in_usd?: number;
  name: string;
  decimals?: number;
}

export interface BEPToken {
  contract: string;
  symbol: string;
  type: string;
  balance: string;
  rate_in_usd?: number;
  name: string;
  decimals: number;
}

export interface CUsd {
  symbol: string;
  type: string;
  balance: string;
  rate_in_usd?: number;
  name: string;
}
