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
