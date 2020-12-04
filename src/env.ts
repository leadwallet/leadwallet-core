import dotenv from "dotenv";

dotenv.config();

export class Environment {
 static LEAD_BTC_ADDRESS = process.env.LEAD_BITCOIN_ADDRESS;
 static JWT_SECRET = process.env.JWT_SECRET;
 static CRYPTO_API = process.env.CRYPTO_API;
 static CRYPTO_API_KEY = process.env.CRYPTO_API_KEY;
 static MONGO_URI = {
  development: process.env.MONGO_MAIN_URI,
  test: process.env.MONGO_TEST_URI,
  production: process.env.MONGO_MAIN_URI,
  staging: process.env.MONGO_MAIN_URI
 };
 static ETH_PROVIDERS = {
  development: process.env.INFURA,
  production: process.env.INFURA,
  test: process.env.INFURA,
  staging: process.env.INFURA_ROPSTEN
 };
 static TRON = {
  development: process.env.TRON_TEST_API,
  production: process.env.TRON_MAIN_API,
  test: process.env.TRON_TEST_API,
  staging: process.env.TRON_TEST_API
 };
 static TRON_EXPLORER = {
  development:
   process.env.TEST_TRONSCAN_URL || "https://shasta.tronscan.org/#/transaction",
  production:
   process.env.PROD_TRONSCAN_URL || "https://tronscan.org/#/transaction",
  test:
   process.env.TEST_TRONSCAN_URL || "https://shasta.tronscan.org/#/transaction",
  staging:
   process.env.TEST_TRONSCAN_URL || "https://shasta.tronscan.org/#/transaction"
 };
 static BLOCK_EXPLORER: string = "https://blockexplorer.one";
 static POLKA_URL = {
  development: "wss://rpc.polkadot.io",
  production: ""
 };
 static NEAR = {
  development: process.env.NEAR_TEST_API,
  production: process.env.NEAR_MAIN_API,
  test: process.env.NEAR_TEST_API,
  staging: process.env.NEAR_TEST_API
 };
 static HARMONY = {
  development: process.env.HMY_TESTNET,
  production: process.env.HMY_MAINNET,
  test: process.env.HMY_TESTNET,
  staging: process.env.HMY_TESTNET
 };
 static CELO = {
  development: process.env.CELO_TEST_API,
  production: process.env.CELO_MAIN_API,
  test: process.env.CELO_TEST_API,
  staging: process.env.CELO_TEST_API
 };
 static XRP = {
  development: process.env.XRP_TEST_API,
  production: process.env.XRP_MAIN_API,
  test: process.env.XRP_TEST_API,
  staging: process.env.XRP_TEST_API
 };
 static BNB = {
  development: process.env.BNB_TEST_API,
  production: process.env.BNB_MAIN_API,
  test: process.env.BNB_TEST_API,
  staging: process.env.BNB_TEST_API
 };
 static BSC = {
  development: process.env.BSC_TEST_API,
  production: process.env.BSC_MAIN_API,
  test: process.env.BSC_TEST_API,
  staging: process.env.BSC_TEST_API
 };
 static XTZ = {
  development: process.env.XTZ_TEST_API,
  production: process.env.XTZ_MAIN_API,
  test: process.env.XTZ_TEST_API,
  staging: process.env.XTZ_TEST_API
 };
 static CONSEIL_API_KEY = process.env.CONSEIL_API_KEY;
 static XLM = {
  development: process.env.XLM_TEST_API,
  production: process.env.XLM_MAIN_API,
  test: process.env.XLM_TEST_API,
  staging: process.env.XLM_TEST_API
 };
}
