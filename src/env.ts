import dotenv from "dotenv";

dotenv.config();

export class Environment {
 static JWT_SECRET = process.env.JWT_SECRET;
 static CRYPTO_API = process.env.CRYPTO_API;
 static CRYPTO_API_KEY= process.env.CRYPTO_API_KEY
 static MONGO_URI = {
  development: process.env.MONGO_MAIN_URI,
  test: process.env.MONGO_TEST_URI,
  production: process.env.MONGO_MAIN_URI
 };
}
