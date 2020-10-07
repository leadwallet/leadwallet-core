import { Environment } from "../../env";
export const options = {
    simple: false,
    json: true,
    resolveWithFullResponse: true,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": Environment.CRYPTO_API_KEY
    }
};
export const CRYPTO_API_COINS: Array<String> = ["btc","ltc","eth","dash","doge"]
export const COIN_NETWORK = {
    btc : {
        development: "testnet",
        production: "mainnet",
        test: "testnet"
    },
    ltc : {
        development: "testnet",
        production: "mainnet",
        test: "testnet"
    },
    dash : {
        development: "testnet",
        production: "mainnet",
        test: "testnet"
    },
    doge : {
        development: "testnet",
        production: "mainnet",
        test: "testnet"
    },
    eth : {
        development: "ropsten",
        production: "mainnet",
        test: "ropsten"
    }
};
