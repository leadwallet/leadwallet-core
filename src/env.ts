import dotenv from "dotenv";

dotenv.config();

export class Environment {
 static JWT_SECRET = process.env.JWT_SECRET;
 static CRYPTO_API = process.env.CRYPTO_API;
 static CRYPTO_API_KEY= process.env.CRYPTO_API_KEY
 static MONGO_URI = {
  development: process.env.MONGO_MAIN_URI,
  test: process.env.MONGO_TEST_URI,
  production: process.env.MONGO_MAIN_URI,
  staging: process.env.MONGO_MAIN_URI
 };
 static TRON = {
  development: process.env.TRON_TEST_API,
  production: process.env.TRON_MAIN_API,
  test: process.env.TRON_TEST_API,
  staging: process.env.TRON_TEST_API
 }
 static POLKA_URL = {
  development: "wss://rpc.polkadot.io"
 };
 static NEAR = {
  development: process.env.NEAR_TEST_API,
  production: process.env.NEAR_MAIN_API,
  test: process.env.NEAR_TEST_API,
  staging: process.env.NEAR_TEST_API
 };
}
