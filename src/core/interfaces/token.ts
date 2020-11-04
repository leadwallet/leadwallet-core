export interface ERCToken {
    contract: string,
    symbol: string,
    name: string,
    type: string,
    balance: string,
    rate_in_usd?: number
}