import dotenv from "dotenv";

dotenv.config();

export class Environment {
 static BTC_URI = process.env.BTC_URI;
 static JWT_SECRET = process.env.JWT_SECRET;
 static MONGO_URI = {
  development: process.env.MONGO_MAIN_URI,
  test: process.env.MONGO_TEST_URI,
  production: process.env.MONGO_MAIN_URI
 };
}
