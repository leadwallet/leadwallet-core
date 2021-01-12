import rp from "request-promise";
import db from "../db";
import { Wallet } from "../core/interfaces";
import { Tokenizers } from "../core/utils";
import { CustomError } from "../custom";
import {
 BTC,
 ETH,
 DOGE,
 LTC,
 TRON,
 DASH,
 // XRP,
 BNB,
 DOT,
 XTZ,
 XLM,
 CELO,
 // NEAR,
 ZIL,
 KSM,
 XEM
} from "../core/handlers";
import { TransactionService } from "../core/handlers/transaction_handler";
import {
 CRYPTO_API_COINS,
 CURRENT_ERC20_TOKENS,
 getExplorerLink,
 SYMBOL_TO_CONTRACT_ADDRESS_MAP
} from "../core/handlers/commons";
import { WalletAdaptor } from "../core/utils/wallet_adaptor";
import { CurrencyConverter } from "../core/utils/currency_converter";
import { TransactionFeeService } from "../core/handlers/transaction_fee_service";
import { ERCToken } from "../core/interfaces/token";
import { sendMail } from "./mail";

const { DBWallet } = db;
const errorCodes = {
 400: "BAD REQUEST",
 401: "UNAUTHORIZED",
 402: "PAYMENT REQUIRED",
 403: "FORBIDDEN",
 404: "NOT FOUND",
 408: "REQUEST TIMEOUT",
 500: "INTERNAL SERVER ERROR",
 502: "BAD GATEWAY",
 503: "SERVICE UNAVAILABLE",
 504: "GATEWAY TIMEOUT"
};

export const createWallet = async (recoveryPhrase: Array<string>) => {
 let phrase = "";

 // Loop through array and then append to 'phrase' string
 for (const p of recoveryPhrase) phrase += p + " ";

 // Generate keypair
 const keyPair = await Tokenizers.generateKeyPairs(phrase);

 // console.log(phrase.trim(), "===========");

 const allPromises = [
  BTC.createAddress(),
  ETH.createAddress(keyPair.privateKey),
  DOGE.createAddress(),
  LTC.createAddress(),
  DASH.createAddress(),
  TRON.generateAddress(),
  // XRP.generateAddress(),
  BNB.generateAddress(keyPair.privateKey),
  DOT.generateAddress(keyPair.publicKey),
  XTZ.generateAddress(keyPair.privateKey),
  XLM.generateAddress(),
  CELO.createAddress(keyPair.privateKey),
  // NEAR.createAddress(),
  ZIL.generateAddress(),
  KSM.generateAddress(keyPair.publicKey),
  XEM.generateAddress()
 ];

 const [
  btcAddressCreationResponse,
  ethAddressCreationResponse,
  dogeAddressCreationResponse,
  ltcAddressCreationResponse,
  dashAddressCreationResponse,
  tronAddressCreationResponse,
  // xrpAddressCreationResponse,
  bnbAddressCreationResponse,
  dotAddressCreationResponse,
  xtzAddressCreationResponse,
  xlmAddressCreationResponse,
  celoAddressCreationResponse,
  // nearAddressCreationResponse,
  zilAddressCreationResponse,
  ksmAddressCreationResponse,
  xemAddressCreationResponse
 ] = await Promise.all(allPromises);

 const allDetailsPromises = [
  BTC.getAddressDetails(btcAddressCreationResponse.payload.address),
  ETH.getAddressDetails(ethAddressCreationResponse.payload.address),
  DOGE.getAddressDetails(dogeAddressCreationResponse.payload.address),
  LTC.getAddressDetails(ltcAddressCreationResponse.payload.address),
  DASH.getAddressDetails(dashAddressCreationResponse.payload.address),
  TRON.getAddressDetails(tronAddressCreationResponse.payload.base58),
  // XRP.getAddressDetails(xrpAddressCreationResponse.payload.address),
  BNB.getAddressDetails(bnbAddressCreationResponse.payload.address),
  DOT.getAddressDetails(dotAddressCreationResponse.payload.address),
  XTZ.getAddressDetails(xtzAddressCreationResponse.payload.address),
  XLM.getAddressDetails(xlmAddressCreationResponse.payload.address),
  CELO.getAddressDetails(celoAddressCreationResponse.payload.address),
  // NEAR.getAddressDetails(nearAddressCreationResponse.payload.address),
  ZIL.getAddressDetails(zilAddressCreationResponse.payload.address),
  KSM.getAddressDetails(ksmAddressCreationResponse.payload.address),
  XEM.getAddressDetails(xemAddressCreationResponse.payload.address)
 ];

 const [
  btcAddressDetailsResponse,
  ethAddressDetailsResponse,
  dogeAddressDetailsResponse,
  ltcAddressDetailsResponse,
  dashAddressDetailsResponse,
  tronAddressDetailsResponse,
  // xrpAddressDetailsResponse,
  bnbAddressDetailsResponse,
  dotAddressDetailsResponse,
  xtzAddressDetailsResponse,
  xlmAddressDetailsResponse,
  celoAddressDetailsResponse,
  // nearAddressDetailsResponse,
  zilAddressDetailsResponse,
  ksmAddressDetailsResponse,
  xemAddressDetailsResponse
 ] = await Promise.all(allDetailsPromises);

 console.log("Got all address details");

 // Instantiate wallet
 const wallet: Wallet = {
  privateKey: keyPair.privateKey,
  publicKey: keyPair.publicKey,
  balance:
   parseFloat(btcAddressDetailsResponse.payload.balance) +
   parseFloat(ethAddressDetailsResponse.payload.balance) +
   parseFloat(dogeAddressDetailsResponse.payload.balance) +
   parseFloat(ltcAddressDetailsResponse.payload.balance) +
   tronAddressDetailsResponse.payload.balance +
   parseFloat(dashAddressDetailsResponse.payload.balance) +
   // xrpAddressDetailsResponse.payload.balance +
   parseFloat(bnbAddressDetailsResponse.payload.balance) +
   dotAddressDetailsResponse.payload.balance +
   xtzAddressDetailsResponse.payload.balance +
   xlmAddressDetailsResponse.payload.balance +
   celoAddressDetailsResponse.payload.balance +
   ksmAddressDetailsResponse.payload.balance +
   xemAddressDetailsResponse.payload.balance,
  // nearAddressDetailsResponse.payload.balance,
  // hmyAddressCreationResponse.payload.balance
  hash: Tokenizers.hash(keyPair.publicKey + keyPair.privateKey),
  btc: {
   address: btcAddressCreationResponse.payload.address,
   wif: btcAddressCreationResponse.payload.wif,
   balance: parseFloat(btcAddressDetailsResponse.payload.balance),
   pk: btcAddressCreationResponse.payload.privateKey
  },
  eth: {
   address: ethAddressCreationResponse.payload.address,
   balance: parseFloat(ethAddressDetailsResponse.payload.balance),
   tokens: ethAddressDetailsResponse.payload.tokens,
   collectibles: ethAddressDetailsResponse.payload.collectibles,
   pk: ethAddressCreationResponse.payload.privateKey
  },
  doge: {
   address: dogeAddressCreationResponse.payload.address,
   wif: dogeAddressCreationResponse.payload.wif,
   balance: parseFloat(dogeAddressDetailsResponse.payload.balance)
  },
  ltc: {
   address: ltcAddressCreationResponse.payload.address,
   wif: ltcAddressCreationResponse.payload.wif,
   balance: parseFloat(ltcAddressDetailsResponse.payload.balance)
  },
  trx: {
   address: tronAddressCreationResponse.payload.base58,
   balance: tronAddressDetailsResponse.payload.balance,
   pk: tronAddressCreationResponse.payload.privateKey
  },
  dash: {
   address: dashAddressCreationResponse.payload.address,
   wif: dashAddressCreationResponse.payload.wif,
   balance: parseFloat(dashAddressDetailsResponse.payload.balance)
  },
  // xrp: {
  //  address: xrpAddressCreationResponse.payload.address,
  //  secret: xrpAddressCreationResponse.payload.secret,
  //  balance: xrpAddressDetailsResponse.payload.balance
  // },
  bnb: {
   address: bnbAddressCreationResponse.payload.address,
   pk: bnbAddressCreationResponse.payload.privateKey,
   balance: bnbAddressDetailsResponse.payload.balance
  },
  dot: {
   address: dotAddressCreationResponse.payload.address,
   pk: dotAddressCreationResponse.payload.privateKey,
   balance: dotAddressDetailsResponse.payload.balance
  },
  xtz: {
   address: xtzAddressCreationResponse.payload.address,
   pk: xtzAddressCreationResponse.payload.privateKey,
   balance: xtzAddressDetailsResponse.payload.balance,
   revealed: false
  },
  xlm: {
   address: xlmAddressCreationResponse.payload.address,
   pk: xlmAddressCreationResponse.payload.privateKey,
   balance: xlmAddressDetailsResponse.payload.balance
  },
  celo: {
   address: celoAddressCreationResponse.payload.address,
   pk: celoAddressCreationResponse.payload.privateKey,
   balance: celoAddressDetailsResponse.payload.balance
  },
  // near: {
  //  address: nearAddressCreationResponse.payload.address,
  //  pk: nearAddressCreationResponse.payload.privateKey,
  //  balance: nearAddressDetailsResponse.payload.balance
  // },
  zil: {
   address: zilAddressCreationResponse.payload.address,
   pk: zilAddressCreationResponse.payload.privateKey,
   balance: zilAddressDetailsResponse.payload.balance
  },
  ksm: {
   address: ksmAddressCreationResponse.payload.address,
   pk: ksmAddressCreationResponse.payload.privateKey,
   balance: ksmAddressDetailsResponse.payload.balance
  },
  xem: {
   address: xemAddressCreationResponse.payload.address,
   pk: xemAddressCreationResponse.payload.privateKey,
   balance: xemAddressDetailsResponse.payload.balance
  }
  // one: {
  //  address: hmyAddressCreationResponse.payload.address,
  //  balance: hmyAddressCreationResponse.payload.balance
  // }
 };

 // Save wallet to db and get as object
 const newWallet = await DBWallet.create(wallet, wallet.privateKey);
 console.log("Wallet added in DB");
 // API Response
 return Promise.resolve({
  wallet: await WalletAdaptor.convert(newWallet),
  token: Tokenizers.generateToken({
   privateKey: newWallet.privateKey,
   publicKey: newWallet.publicKey,
   defiAccessKey: newWallet.eth.pk
  })
 });
};

export const getWallet = async (privateKey: string, publicKey: string) => {
 const wallet = await DBWallet.getWallet(privateKey, publicKey);
 return Promise.resolve(await WalletAdaptor.convert(wallet));
};

export const updateWallet = async (wallet: Wallet) => {
 // Remove NEAR from all wallets on update
 // if (wallet.near) wallet.near = null;
 // Get all address details
 const allAddressDetails = [
  wallet.btc ? BTC.getAddressDetails(wallet.btc.address) : null,
  wallet.eth
   ? ETH.getAddressDetails(wallet.eth.address, [
      ...wallet.eth.tokens,
      ...(wallet.eth.collectibles || [])
     ])
   : null,
  wallet.doge ? DOGE.getAddressDetails(wallet.doge.address) : null,
  wallet.ltc ? LTC.getAddressDetails(wallet.ltc.address) : null,
  wallet.trx ? TRON.getAddressDetails(wallet.trx.address) : null,
  wallet.dash ? DASH.getAddressDetails(wallet.dash.address) : null,
  // wallet.xrp ? XRP.getAddressDetails(wallet.xrp.address) : null,
  wallet.bnb ? BNB.getAddressDetails(wallet.bnb.address) : null,
  wallet.dot ? DOT.getAddressDetails(wallet.dot.address) : null,
  wallet.xtz ? XTZ.getAddressDetails(wallet.xtz.address) : null,
  wallet.xlm ? XLM.getAddressDetails(wallet.xlm.address) : null,
  wallet.celo ? CELO.getAddressDetails(wallet.celo.address) : null,
  // wallet.near ? NEAR.getAddressDetails(wallet.near.address) : null,
  wallet.zil ? ZIL.getAddressDetails(wallet.zil.address) : null,
  wallet.ksm ? KSM.getAddressDetails(wallet.ksm.address) : null,
  wallet.xem ? XEM.getAddressDetails(wallet.xem.address) : null
 ];
 // Update wallet
 const [
  btcDetailsResponse,
  ethDetailsResponse,
  dogeDetailsResponse,
  ltcDetailsResponse,
  tronDetailsResponse,
  dashDetailsResponse,
  // xrpDetailsResponse,
  bnbDetailsResponse,
  dotDetailsResponse,
  xtzDetailsResponse,
  xlmDetailsResponse,
  celoDetailsResponse,
  // nearDetailsResponse,
  zilDetailsResponse,
  ksmDetailsResponse,
  xemDetailsResponse
 ] = await Promise.all(allAddressDetails);
 if (
  btcDetailsResponse.statusCode >= 400 ||
  ethDetailsResponse.statusCode >= 400 ||
  dogeDetailsResponse.statusCode >= 400 ||
  ltcDetailsResponse.statusCode >= 400 ||
  dashDetailsResponse.statusCode >= 400 ||
  tronDetailsResponse.statusCode >= 400
 ) {
  console.log("Could not get all address details at once");
  throw new CustomError(500, "Could not get all address details at once");
 }
 const tickers = [
  "btc",
  "eth",
  "doge",
  "ltc",
  "trx",
  "dash",
  "bnb",
  "dot",
  "xtz",
  "xlm",
  "celo",
  "zil",
  "ksm",
  "xem"
 ];
 const balances = {
  btc: parseFloat(btcDetailsResponse?.payload.balance || "0"),
  eth: parseFloat(ethDetailsResponse?.payload.balance || "0"),
  doge: parseFloat(dogeDetailsResponse?.payload.balance || "0"),
  ltc: parseFloat(ltcDetailsResponse.payload.balance || "0"),
  trx: parseFloat(tronDetailsResponse.payload.balance || "0"),
  dash: parseFloat(dashDetailsResponse.payload.balance || "0"),
  bnb: parseFloat(bnbDetailsResponse?.payload.balance || "0"),
  dot: parseFloat(dotDetailsResponse?.payload.balance || "0"),
  xtz: parseFloat(xtzDetailsResponse?.payload.balance || "0"),
  xlm: parseFloat(xlmDetailsResponse?.payload.balance || "0"),
  celo: parseFloat(celoDetailsResponse?.payload.balance || "0"),
  // near: parseFloat(nearDetailsResponse?.payload.balance || "0"),
  zil: parseFloat(zilDetailsResponse?.payload.balance || "0"),
  ksm: parseFloat(ksmDetailsResponse?.payload.balance || "0"),
  xem: parseFloat(xemDetailsResponse?.payload.balance || "0")
 };
 // hmyDetailsResponse.payload.balance
 // wallet.one.balance = hmyDetailsResponse.payload.balance;

 let newBalance = 0;

 for (const ticker of tickers)
  if (wallet[ticker]) {
   wallet[ticker].balance = balances[ticker];
   newBalance = newBalance + balances[ticker];
   if (ticker === "eth") wallet.eth.tokens = ethDetailsResponse?.payload.tokens;
  }

 // const removeTickers = ["bnb", "xtz", "xlm", "celo", "zil", "near"];

 // for (const ticker of removeTickers)
 //  if (wallet[ticker]) {
 //   console.log(ticker);
 //   wallet[ticker] = null;
 //  }

 wallet.balance = newBalance;
 // Update wallet in db
 const newWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);
 return Promise.resolve(await WalletAdaptor.convert(newWallet));
};

export const importWallet = async (wallet: Wallet) => {
 const tickers = [
  "btc",
  "eth",
  "doge",
  "ltc",
  "trx",
  "dash",
  "bnb",
  "dot",
  "xtz",
  "xlm",
  "celo",
  "zil",
  "ksm",
  "xem"
 ];

 const allPromises = [
  BTC.createAddress(),
  ETH.createAddress(wallet.privateKey),
  DOGE.createAddress(),
  LTC.createAddress(),
  DASH.createAddress(),
  TRON.generateAddress(),
  BNB.generateAddress(wallet.privateKey),
  DOT.generateAddress(wallet.publicKey),
  XTZ.generateAddress(wallet.privateKey),
  XLM.generateAddress(),
  CELO.createAddress(wallet.privateKey),
  // NEAR.createAddress(),
  ZIL.generateAddress(),
  KSM.generateAddress(wallet.publicKey),
  XEM.generateAddress()
 ];

 const [
  btcAddressCreationResponse,
  ethAddressCreationResponse,
  dogeAddressCreationResponse,
  ltcAddressCreationResponse,
  dashAddressCreationResponse,
  tronAddressCreationResponse,
  bnbAddressCreationResponse,
  dotAddressCreationResponse,
  xtzAddressCreationResponse,
  xlmAddressCreationResponse,
  celoAddressCreationResponse,
  // nearAddressCreationResponse,
  zilAddressCreationResponse,
  ksmAddressCreationResponse,
  xemAddressCreationResponse
 ] = await Promise.all(allPromises);

 const allDetailsPromises = [
  BTC.getAddressDetails(btcAddressCreationResponse.payload.address),
  ETH.getAddressDetails(ethAddressCreationResponse.payload.address),
  DOGE.getAddressDetails(dogeAddressCreationResponse.payload.address),
  LTC.getAddressDetails(ltcAddressCreationResponse.payload.address),
  DASH.getAddressDetails(dashAddressCreationResponse.payload.address),
  TRON.getAddressDetails(tronAddressCreationResponse.payload.base58),
  BNB.getAddressDetails(bnbAddressCreationResponse.payload.address),
  DOT.getAddressDetails(dotAddressCreationResponse.payload.address),
  XTZ.getAddressDetails(xtzAddressCreationResponse.payload.address),
  XLM.getAddressDetails(xlmAddressCreationResponse.payload.address),
  CELO.getAddressDetails(celoAddressCreationResponse.payload.address),
  // NEAR.getAddressDetails(nearAddressCreationResponse.payload.address),
  ZIL.getAddressDetails(zilAddressCreationResponse.payload.address),
  KSM.getAddressDetails(ksmAddressCreationResponse.payload.address),
  XEM.getAddressDetails(xemAddressCreationResponse.payload.address)
 ];

 const [
  btcAddressDetailsResponse,
  ethAddressDetailsResponse,
  dogeAddressDetailsResponse,
  ltcAddressDetailsResponse,
  dashAddressDetailsResponse,
  tronAddressDetailsResponse,
  bnbAddressDetailsResponse,
  dotAddressDetailsResponse,
  xtzAddressDetailsResponse,
  xlmAddressDetailsResponse,
  celoAddressDetailsResponse,
  // nearAddressDetailsResponse,
  zilAddressDetailsResponse,
  ksmAddressDetailsResponse,
  xemAddressDetailsResponse
 ] = await Promise.all(allDetailsPromises);

 const coins = {
  btc: {
   address: btcAddressCreationResponse.payload.address,
   wif: btcAddressCreationResponse.payload.wif,
   balance: parseFloat(btcAddressDetailsResponse.payload.balance),
   pk: btcAddressCreationResponse.payload.privateKey
  },
  eth: {
   address: ethAddressCreationResponse.payload.address,
   balance: parseFloat(ethAddressDetailsResponse.payload.balance),
   tokens: ethAddressDetailsResponse.payload.tokens,
   collectibles: ethAddressDetailsResponse.payload.collectibles,
   pk: ethAddressCreationResponse.payload.privateKey
  },
  doge: {
   address: dogeAddressCreationResponse.payload.address,
   wif: dogeAddressCreationResponse.payload.wif,
   balance: parseFloat(dogeAddressDetailsResponse.payload.balance)
  },
  ltc: {
   address: ltcAddressCreationResponse.payload.address,
   wif: ltcAddressCreationResponse.payload.wif,
   balance: parseFloat(ltcAddressDetailsResponse.payload.balance)
  },
  trx: {
   address: tronAddressCreationResponse.payload.base58,
   balance: tronAddressDetailsResponse.payload.balance,
   pk: tronAddressCreationResponse.payload.privateKey
  },
  dash: {
   address: dashAddressCreationResponse.payload.address,
   wif: dashAddressCreationResponse.payload.wif,
   balance: parseFloat(dashAddressDetailsResponse.payload.balance)
  },
  bnb: {
   address: bnbAddressCreationResponse.payload.address,
   pk: bnbAddressCreationResponse.payload.privateKey,
   balance: bnbAddressDetailsResponse.payload.balance
  },
  dot: {
   address: dotAddressCreationResponse.payload.address,
   pk: dotAddressCreationResponse.payload.privateKey,
   balance: dotAddressDetailsResponse.payload.balance
  },
  xtz: {
   address: xtzAddressCreationResponse.payload.address,
   pk: xtzAddressCreationResponse.payload.privateKey,
   balance: xtzAddressDetailsResponse.payload.balance,
   revealed: false
  },
  xlm: {
   address: xlmAddressCreationResponse.payload.address,
   pk: xlmAddressCreationResponse.payload.privateKey,
   balance: xlmAddressDetailsResponse.payload.balance
  },
  celo: {
   address: celoAddressCreationResponse.payload.address,
   pk: celoAddressCreationResponse.payload.privateKey,
   balance: celoAddressDetailsResponse.payload.balance
  },
  // near: {
  //  address: nearAddressCreationResponse.payload.address,
  //  pk: nearAddressCreationResponse.payload.privateKey,
  //  balance: nearAddressDetailsResponse.payload.balance
  // },
  zil: {
   address: zilAddressCreationResponse.payload.address,
   pk: zilAddressCreationResponse.payload.privateKey,
   balance: zilAddressDetailsResponse.payload.balance
  },
  ksm: {
   address: ksmAddressCreationResponse.payload.address,
   pk: ksmAddressCreationResponse.payload.privateKey,
   balance: ksmAddressDetailsResponse.payload.balance
  },
  xem: {
   address: xemAddressCreationResponse.payload.address,
   pk: xemAddressCreationResponse.payload.privateKey,
   balance: xemAddressDetailsResponse.payload.balance
  }
 };

 let newBalance = 0;

 for (const ticker of tickers)
  if (!wallet[ticker]) {
   wallet[ticker] = coins[ticker];
   newBalance = newBalance + coins[ticker].balance;
  }

 wallet.balance = wallet.balance + newBalance;

 const updatedWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);
 const token = Tokenizers.generateToken({
  privateKey: wallet.privateKey,
  publicKey: wallet.publicKey,
  defiAccessKey: wallet.eth.pk
 });
 return Promise.resolve({
  wallet: await WalletAdaptor.convert(updatedWallet),
  token
 });
};

export const sendToken = async (
 type: string,
 body: any,
 pk: string,
 senderWallet: Wallet
) => {
 let balance: number = 0;
 let txHash: string = "";
 let txId: string = "";
 let recipient: string = "";
 if (type === "btc") {
  // Increment balance for every input
  for (const i of body.inputs) balance = balance + i.value;

  // Throw error if sender's balance is less than balance to be sent
  if (senderWallet.balance < balance)
   throw new CustomError(400, "Wallet balance is not sufficient.");

  // Throw error if sender's btc balance is less than balance to be sent
  if (senderWallet.btc.balance < balance)
   throw new CustomError(400, "Insufficient BTC balance");

  // Send BTC
  const btcSentResponse = await BTC.sendToken(
   body.inputs,
   body.outputs,
   {
    address: senderWallet.btc.address,
    value: parseFloat(Number(body.fee).toFixed(8))
   },
   senderWallet.btc.wif
  );

  // Update sender's btc balance
  senderWallet.btc.balance = senderWallet.btc.balance - balance;
  txHash = btcSentResponse.payload.txId;
  txId = btcSentResponse.payload.txId;
  recipient = body.outputs[0].address;
 } else if (type === "eth") {
  // Increment balance
  balance = balance + body.value;

  // Throw error if balance is more than sender's wallet balance
  if (senderWallet.balance < balance)
   throw new CustomError(400, "Wallet balance is not sufficient.");

  // Throw error if sender's ethereum balance is less than balance to be sent
  if (senderWallet.eth.balance < balance)
   throw new CustomError(400, "Insufficient ETH balance.");

  // Find matching wallet
  // for (const w of allWallets)
  //  if (!!w.eth && w.eth.address === req.body.toAddress)
  //   wallets = [...wallets, w];

  // Send ETH
  const ethSentResponse = await ETH.sendToken(senderWallet.eth.pk, body);

  // Throw error for 4XX or 5XX status code ranges
  if (ethSentResponse.statusCode >= 400) {
   console.error(ethSentResponse);
   throw new CustomError(
    ethSentResponse.statusCode,
    ethSentResponse.payload || errorCodes[ethSentResponse.statusCode]
   );
  }

  // Loop through array
  // for (const w of wallets)
  //  if (w.eth.address === req.body.toAddress) {
  //   const wallet: Wallet = w;
  //   wallet.balance = wallet.balance + req.body.value;
  //   wallet.eth.balance = wallet.eth.balance + req.body.value;
  //   encRecipientWallets.push(
  //    Tokenizers.encryptWallet(
  //     await DBWallet.updateWallet(wallet.privateKey, wallet)
  //    )
  //   );
  //  }

  // Update sender's wallet eth balance
  senderWallet.eth.balance = senderWallet.eth.balance - balance;
  txHash = ethSentResponse.payload.hex;
  recipient = body.toAddress;
 } else if (type === "doge") {
  // Increment balance
  for (const i of body.inputs) balance = balance + i.value;

  // Throw error if sender's wallet balance is less than specified balance
  if (senderWallet.balance < balance)
   throw new CustomError(400, "Wallet balance is not sufficient");

  // Throw error if doge balance is less than the specified balance
  if (senderWallet.doge.balance < balance)
   throw new CustomError(400, "Insufficient DOGE balance.");

  // Find matching wallet
  // for (const o of req.body.outputs)
  //  for (const w of allWallets)
  //   if (!!w.doge && w.doge.address === o.address)
  //    wallets = [...wallets, w];

  // Send DOGE
  const dogeSentResponse = await DOGE.sendToken(body.inputs, body.outputs, {
   value: parseFloat(Number(body.fee.value).toFixed(8))
  });

  // Throw error if status code is within 4XX and 5XX ranges
  if (dogeSentResponse.statusCode >= 400)
   throw new CustomError(
    dogeSentResponse.statusCode,
    dogeSentResponse.payload || errorCodes[dogeSentResponse.statusCode]
   );

  // Sign transaction immediately
  const signTransactionResponse = await DOGE.signTransaction(
   dogeSentResponse.payload.hex,
   [senderWallet.doge.wif]
  );

  // Throw error if status code is within 4XX and 5XX ranges
  if (signTransactionResponse.statusCode >= 400)
   throw new CustomError(
    signTransactionResponse.statusCode,
    signTransactionResponse.payload ||
     errorCodes[signTransactionResponse.statusCode]
   );

  // Broadcast transaction to the Dogecoin blockchain
  const broadcastTransactionResponse = await DOGE.broadcastTransaction(
   signTransactionResponse.payload.hex
  );

  // Throw error if status code is within 4XX and 5XX ranges
  if (broadcastTransactionResponse.statusCode >= 400)
   throw new CustomError(
    broadcastTransactionResponse.statusCode,
    broadcastTransactionResponse.payload ||
     errorCodes[broadcastTransactionResponse.statusCode]
   );

  // Loop through recipients' wallets
  // for (const w of wallets)
  //  for (const o of req.body.outputs)
  //   if (o.address === w.doge.address) {
  //    const wallet: Wallet = w;
  //    wallet.balance = wallet.balance + o.value;
  //    wallet.doge.balance = wallet.doge.balance + o.value;
  //    encRecipientWallets.push(
  //     Tokenizers.encryptWallet(
  //      await DBWallet.updateWallet(wallet.privateKey, wallet)
  //     )
  //    );
  //   }

  // Update sender's wallet doge balance
  senderWallet.doge.balance = senderWallet.doge.balance - balance;
  txHash = broadcastTransactionResponse.payload.txid;
  recipient = body.outputs[0].address;
 } else if (type === "ltc") {
  // Increment balance
  for (const i of body.inputs) balance = balance + i.value;

  // Throw error if sender's balance is less than  specified balance
  if (senderWallet.balance < balance)
   throw new CustomError(400, "Wallet balance not sufficient.");

  // Throw error if sender's ltc balance is less than specified balance
  if (senderWallet.ltc.balance < balance)
   throw new CustomError(400, "Insufficient LTC balance");

  // Find matching wallet
  // for (const o of req.body.outputs)
  //  for (const w of allWallets)
  //   if (!!w.ltc && w.ltc.address === o.address)
  //    wallets = [...wallets, w];

  // Send LTC
  const ltcSentResponse = await LTC.sendToken(body.inputs, body.outputs, {
   value: parseFloat(Number(body.fee.value).toFixed(8))
  });

  console.log(ltcSentResponse);

  // Throw error if status code is within 4XX and 5XX
  if (ltcSentResponse.statusCode >= 400)
   throw new CustomError(
    ltcSentResponse.statusCode,
    ltcSentResponse.payload || errorCodes[ltcSentResponse.statusCode]
   );

  // Sign transaction
  const transactionSignResponse = await LTC.signTransaction(
   ltcSentResponse.payload.hex,
   [senderWallet.ltc.wif]
  );

  // Throw error for 4XX and 5XX status codes
  if (transactionSignResponse.statusCode >= 400)
   throw new CustomError(
    transactionSignResponse.statusCode,
    transactionSignResponse.payload ||
     errorCodes[transactionSignResponse.statusCode]
   );

  // Broadcast transaction to the Litecoin blockchain
  const broadcastTransactionResponse = await LTC.broadcastTransaction(
   transactionSignResponse.payload.hex
  );

  // Throw error if there is any
  if (broadcastTransactionResponse.statusCode >= 400)
   throw new CustomError(
    broadcastTransactionResponse.statusCode,
    broadcastTransactionResponse.payload ||
     errorCodes[broadcastTransactionResponse.statusCode]
   );

  // Find matching wallets
  // for (const w of wallets)
  //  for (const o of req.body.outputs)
  //   if (o.address = w.ltc.address) {
  //    const wallet: Wallet = w;
  //    wallet.balance = wallet.balance + o.value;
  //    wallet.ltc.balance = wallet.ltc.balance + o.value;
  //    encRecipientWallets.push(
  //     Tokenizers.encryptWallet(
  //      await DBWallet.updateWallet(wallet.privateKey, wallet)
  //     )
  //    );
  //   }

  // Update sender wallet's LTC balance
  senderWallet.ltc.balance = senderWallet.ltc.balance - balance;
  txHash = broadcastTransactionResponse.payload.txid;
  recipient = body.outputs[0].address;
 } else if (type === "trx") {
  balance = balance + body.amount;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficient wallet balance.");

  if (senderWallet.trx.balance < balance)
   throw new CustomError(400, "Insufficient TRON balance");

  // Find matching wallet
  // for (const w of allWallets)
  //  if (!!w.tron && w.tron.address === req.body.to)
  //   wallets = [...wallets, w];

  // console.log(wallets[0]);

  // Send TRON
  const tronSentResponse = await TRON.sendToken(
   senderWallet.trx.address,
   body.to,
   body.amount
  );

  // Check for errors
  if (tronSentResponse.statusCode >= 400) {
   console.log(tronSentResponse);
   throw new CustomError(tronSentResponse.statusCode, tronSentResponse.payload);
  }

  // Sign transaction
  const signTransactionResponse = await TRON.signTransaction(
   tronSentResponse.payload,
   senderWallet.trx.pk
  );

  // Check for errors
  if (signTransactionResponse.statusCode >= 400)
   throw new CustomError(
    signTransactionResponse.statusCode,
    signTransactionResponse.payload
   );

  // for (const w of wallets)
  //  if (w.tron.address === req.body.to) {
  //   const wallet: Wallet = w;
  //   wallet.balance = wallet.balance + balance;
  //   wallet.tron.balance = wallet.tron.balance + balance;
  //   encRecipientWallets.push(
  //    Tokenizers.encryptWallet(
  //     await DBWallet.updateWallet(wallet.privateKey, wallet)
  //    )
  //   );
  //  }

  // Update sender's wallet tron balance
  senderWallet.trx.balance = senderWallet.trx.balance - balance;
  txHash = signTransactionResponse.payload.transaction.txID;
  recipient = body.to;
 } else if (type === "dash") {
  // Increment balance
  for (const i of body.inputs) balance = balance + i.value;

  // Throw error if sender's balance is less than  specified balance
  if (senderWallet.balance < balance)
   throw new CustomError(400, "Wallet balance not sufficient.");

  // Throw error if sender's dash balance is less than specified balance
  if (senderWallet.dash.balance < balance)
   throw new CustomError(400, "Insufficient DASH balance");

  // Find matching wallet
  // for (const o of req.body.outputs)
  //  for (const w of allWallets)
  //   if (w.dash.address === o.address)
  //    wallets = [...wallets, w];

  // Send LTC
  const dashSentResponse = await DASH.sendToken(body.inputs, body.outputs, {
   value: parseFloat(Number(body.fee.value).toFixed(8))
  });

  // Throw error if status code is within 4XX and 5XX
  if (dashSentResponse.statusCode >= 400)
   throw new CustomError(
    dashSentResponse.statusCode,
    dashSentResponse.payload || errorCodes[dashSentResponse.statusCode]
   );

  // Sign transaction
  const transactionSignResponse = await DASH.signTransaction(
   dashSentResponse.payload.hex,
   [senderWallet.dash.wif]
  );

  // Throw error for 4XX and 5XX status codes
  if (transactionSignResponse.statusCode >= 400)
   throw new CustomError(
    transactionSignResponse.statusCode,
    transactionSignResponse.payload ||
     errorCodes[transactionSignResponse.statusCode]
   );

  // Broadcast transaction to the Litecoin blockchain
  const broadcastTransactionResponse = await DASH.broadcastTransaction(
   transactionSignResponse.payload.hex
  );

  // Throw error if there is any
  if (broadcastTransactionResponse.statusCode >= 400)
   throw new CustomError(
    broadcastTransactionResponse.statusCode,
    broadcastTransactionResponse.payload ||
     errorCodes[broadcastTransactionResponse.statusCode]
   );

  // Find matching wallets
  // for (const w of wallets)
  //  for (const o of req.body.outputs)
  //   if (o.address = w.ltc.address) {
  //    const wallet: Wallet = w;
  //    wallet.balance = wallet.balance + o.value;
  //    wallet.dash.balance = wallet.dash.balance + o.value;
  //    encRecipientWallets.push(
  //     Tokenizers.encryptWallet(
  //      await DBWallet.updateWallet(wallet.privateKey, wallet)
  //     )
  //    );
  //   }

  // Update sender wallet's LTC balance
  senderWallet.dash.balance = senderWallet.dash.balance - balance;
  txHash = broadcastTransactionResponse.payload.txid;
  recipient = body.outputs[0].address;
 } else if (type === "bnb") {
  balance = body.value;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficient wallet balance");

  if (senderWallet.bnb.balance < balance)
   throw new CustomError(400, "Insufficient BNB balance");

  const bnbSentResponse = await BNB.sendToken(
   body.to,
   body.value,
   senderWallet.bnb.pk,
   body.nonce
  );

  txHash = bnbSentResponse.payload.hash;
  recipient = body.to;
 } else if (type === "dot") {
  balance = body.value;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficient wallet balance");

  if (senderWallet.dot.balance < balance)
   throw new CustomError(400, "Insufficient DOT balance");

  const dotSentResponse = await DOT.sendToken(
   senderWallet.dot.pk,
   body.to,
   body.value
  );

  txHash = dotSentResponse.payload.hash;
 } else if (type === "ksm") {
  balance = body.value;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficient wallet balance");

  if (senderWallet.ksm.balance < balance)
   throw new CustomError(400, "Insufficient KSM balance");

  const ksmSentResponse = await KSM.sendToken(
   senderWallet.ksm.pk,
   body.to,
   body.value
  );

  txHash = ksmSentResponse.payload.hash;
  recipient = body.to;
 } else if (type === "xlm") {
  balance = body.value;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficient wallet balance");

  if (senderWallet.xlm.balance < balance)
   throw new CustomError(400, "Insufficient XLM balance");

  const xlmSentResponse = await XLM.sendToken(
   senderWallet.xlm.pk,
   body.to,
   body.value
  );
  txHash = xlmSentResponse.payload.hash;
  recipient = body.to;
 } else if (type === "celo") {
  balance = body.value;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficient wallet balance");

  if (senderWallet.celo.balance < balance)
   throw new CustomError(400, "Insufficient CELO balance");

  const celoSentResponse = await CELO.sendToken(
   senderWallet.celo.pk,
   body.to,
   body.value
  );
  txHash = celoSentResponse.payload.hash;
  recipient = body.to;
 } else if (type === "xtz") {
  balance = body.value;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficient wallet balance");

  if (senderWallet.xtz.balance < balance)
   throw new CustomError(400, "Insufficient XTZ balance");

  const xtzSentResponse = await XTZ.sendToken(
   senderWallet.privateKey,
   senderWallet.publicKey,
   body.to,
   body.value,
   senderWallet.xtz.pk,
   0.02 * body.value
  );
  txHash = xtzSentResponse.payload.hash;
  recipient = body.to;
 } else if (type === "zil") {
  balance = body.value;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficient wallet balance");

  if (senderWallet.zil.balance < balance)
   throw new CustomError(400, "Insufficeint ZIL balance");

  const zilSentResponse = await ZIL.sendToken(
   senderWallet.zil.pk,
   body.to,
   body.value
  );
  txHash = zilSentResponse.payload.hash;
  recipient = body.to;
 } else if (type === "xem") {
  balance = body.value;

  if (senderWallet.balance < balance)
   throw new CustomError(400, "Insufficeint wallet balance");

  if (senderWallet.xem.balance < balance)
   throw new CustomError(400, "Insufficient XEM balance");

  const xemSentResponse = await XEM.sendToken(
   senderWallet.xem.pk,
   body.to,
   body.value
  );
  txHash = xemSentResponse.payload.hash;
  recipient = body.to;
 } else {
  throw new CustomError(400, type + " not available yet.");
 }

 // Update sender's wallet balance by deducting from it
 senderWallet.balance = senderWallet.balance - balance;

 // Update sender's wallet
 const updatedSenderWallet = await DBWallet.updateWallet(pk, senderWallet);

 // Send mail
 // const mail = await sendMail("analytics", {
 //  coin: type,
 //  hash: txHash,
 //  sender: senderWallet[type].address,
 //  recipient
 // });

 // console.log(JSON.stringify(mail));

 // API response
 return Promise.resolve({
  sender: Tokenizers.encryptWallet(updatedSenderWallet),
  // recipients: encRecipientWallets,
  message: "Transaction successful.",
  txHash,
  txId,
  view_in_explorer: getExplorerLink(type, txHash)
 });
};

export const getTransactions = async (ticker: string, address: string) => {
 let payload: any = null;

 if (CRYPTO_API_COINS.includes(ticker)) {
  const response = await TransactionService.getTransactions(ticker, address);

  let apiResponse = [];
  if (ticker !== "eth") {
   const response2 = await TransactionService.getPendingTransactions(
    ticker,
    address
   );
   apiResponse = response.payload.map((item: any) => ({
    hash: item.txid,
    amount: Object.keys(item.received)
     .map(a => a.toLowerCase())
     .includes(address.toLowerCase())
     ? "+" + item.amount
     : "-" + item.amount,
    fee: item.fee,
    status: item.confirmations > 0 ? "Confirmed" : "Pending",
    from: Object.keys(item.sent)
     .map(key => key)
     .join(", "),
    to: Object.keys(item.received)
     .map(key => key)
     .join(", "),
    date: item.datetime,
    view_in_explorer: getExplorerLink(ticker, item.txid)
   }));
   apiResponse = apiResponse.concat(
    response2.payload.map((item: any) => ({
     hash: item.hash,
     amount: item.txins[0].addresses
      .map((a: string) => a.toLowerCase())
      .includes(address.toLowerCase())
      ? "-" + item.txouts[0].amount
      : "+" + item.txouts[0].amount,
     status: "Pending",
     from: item.txins[0].addresses.join(", "),
     to: item.txouts[0].addresses.join(", "),
     date: item.datetime,
     view_in_explorer: getExplorerLink(ticker, item.txid)
    }))
   );
  } else {
   // console.log(response.payload);
   apiResponse = response.payload.map(async (item: any) => ({
    hash: item.hash,
    amount:
     item.sent.toLowerCase() === address.toLowerCase()
      ? "-" + item.amount
      : "+" + item.amount,
    fee: item.fee,
    status: item.confirmations > 0 ? "Confirmed" : "Pending",
    from: item.sent,
    to: item.received,
    date: item.datetime,
    nonce: (await ETH.getTransactionDetails(item.hash, address)).payload.nonce,
    view_in_explorer: getExplorerLink(ticker, item.hash)
   }));
   apiResponse = await Promise.all(apiResponse);
  }

  payload = apiResponse;
 } else if (
  ticker.toLowerCase() === "erc-20" ||
  ticker.toLowerCase() === "erc-721"
 ) {
  const response = await TransactionService.getERCTransactions(address);
  const apiResponse: Array<any> = response.payload.map((txn: any) => ({
   hash: txn.txHash,
   from: txn.from,
   to: txn.to,
   date: txn.datetime,
   amount:
    txn.from.toLowerCase() === address.toLowerCase()
     ? "-" + txn.value
     : "+" + txn.value,
   name: txn.name,
   symbol: txn.symbol,
   type: txn.type,
   status: "Confirmed",
   view_in_explorer: getExplorerLink("eth", txn.txHash)
  }));

  payload = apiResponse;
 } else if (ticker.toLowerCase() === "trx") {
  const response = await TRON.getTransactions(address);
  const apiResponse = response.payload.map((item: any) => ({
   hash: item.txID,
   from: item.raw_data.contract[0].from,
   to: item.raw_data.contract[0].to,
   date: new Date(item.raw_data.timestamp),
   amount: item.raw_data.contract[0].value,
   fee: item.net_fee / 10 ** 6,
   status: item.ret[0].contractRet === "SUCCESS" ? "Confirmed" : "Pending",
   view_in_explorer: getExplorerLink(ticker, item.txID)
  }));

  payload = apiResponse;
 } else if (ticker.toLowerCase() === "bnb") {
  const response = await BNB.getTransactions(address);

  payload = response.payload.map((tx: any) => ({
   ...tx,
   view_in_explorer: getExplorerLink(ticker, tx.hash)
  }));
 } else if (ticker.toLowerCase() === "xlm") {
  const response = await XLM.getTransactions(address);

  payload = response.payload.map((tx: any) => ({
   ...tx,
   view_in_explorer: getExplorerLink(ticker, tx.hash)
  }));
 } else if (ticker.toLowerCase() === "celo") {
  const response = await CELO.getTransactions(address);

  payload = response.payload.map((tx: any) => ({
   ...tx,
   view_in_explorer: getExplorerLink(ticker, tx.hash)
  }));
 } else if (ticker.toLowerCase() === "xtz") {
  const response = await XTZ.getTransactions(address);

  payload = response.payload.map((tx: any) => ({
   ...tx,
   view_in_explorer: getExplorerLink(ticker, tx.hash)
  }));
 } else if (ticker.toLowerCase() === "zil") {
  const response = await ZIL.getTransactions(address);

  payload = response.payload.map((tx: any) => ({
   ...tx,
   view_in_explorer: getExplorerLink(ticker, tx.hash)
  }));
 } else if (ticker.toLowerCase() === "dot") {
  const response = await DOT.getTransactions(address);

  payload = response.payload.map((tx: any) => ({
   ...tx,
   view_in_explorer: getExplorerLink(ticker, tx.hash)
  }));
 } else if (ticker.toLowerCase() === "ksm") {
  const response = await KSM.getTransactions(address);

  payload = response.payload.map((tx: any) => ({
   ...tx,
   view_in_explorer: getExplorerLink(ticker, tx.hash)
  }));
 } else if (ticker.toLowerCase() === "xem") {
  const response = await XEM.getTransactions(address);

  payload = response.payload.map((tx: any) => ({
   ...tx,
   view_in_explorer: getExplorerLink(ticker, tx.hash)
  }));
 } else {
  throw new CustomError(
   400,
   "Transaction history isn't available yet for " + ticker.toLowerCase()
  );
 }

 return Promise.resolve(payload);
};

export const refreshPrices = async () => {
 const currencyConverter = await CurrencyConverter.getInstance();
 const priceMap = currencyConverter.getAllPricesUSD();
 let respObj = {};
 priceMap.forEach((value, key) => {
  respObj[key] = value;
 });
 return Promise.resolve(respObj);
};

export const refreshPrice = async (ticker: string) => {
 const currencyConverter = await CurrencyConverter.getInstance();
 if (ticker.startsWith("0x")) {
  const values = await currencyConverter.getTokenPriceInUSD(ticker);
  return Promise.resolve(values);
 } else {
  const value = currencyConverter.getPriceInUSD(ticker);
  return Promise.resolve(value);
 }
};

export const getEstimatedTransactionFee = async (
 ticker: string,
 fromAddress: string,
 toAddress: string,
 contract: string,
 value: number
) => {
 const txFee: any =
  ticker.toLowerCase() === "erc-20" || ticker.toLowerCase() === "erc-721"
   ? await TransactionFeeService.getERCTransactionFee(
      fromAddress,
      toAddress,
      contract,
      value
     )
   : await TransactionFeeService.getTransactionFee(
      ticker,
      fromAddress,
      toAddress,
      value
     );

 return Promise.resolve(txFee);
};

export const getERC20Tokens = async (wallet: Wallet) => {
 const tokensResponse = await ETH.getERC20Tokens(wallet.eth.address);

 if (tokensResponse.statusCode >= 400)
  throw new CustomError(
   tokensResponse.statusCode,
   tokensResponse.payload || errorCodes[tokensResponse.payload]
  );

 const response =
  tokensResponse.payload.length > 0
   ? [
      ...tokensResponse.payload.map(async (token: any) => {
       const contractDetails = await rp.get(
        "https://api.coingecko.com/api/v3/coins/ethereum/contract/" +
         token.contract,
        {
         simple: false,
         json: true,
         resolveWithFullResponse: true
        }
       );

       if (contractDetails.statusCode >= 400)
        throw new CustomError(
         contractDetails.statusCode,
         "Could not retrieve image for " + token.contract
        );

       return {
        ...token,
        image: contractDetails.body.image
       };
      })
     ]
   : [];

 return Promise.resolve(response);
};

export const transferERC20Tokens = async (wallet: Wallet, body: any) => {
 const transferTokenResponse = await ETH.transferERC20(
  wallet.eth.address,
  body.to,
  body.contract,
  wallet.eth.pk,
  body.tokens,
  body.gasPrice,
  body.gasLimit
 );

 if (transferTokenResponse.statusCode >= 400)
  throw new CustomError(
   transferTokenResponse.statusCode,
   transferTokenResponse.payload || errorCodes[transferTokenResponse.statusCode]
  );

 const mail = await sendMail("analytics", {
  coin: "erc20",
  hash: transferTokenResponse.payload.hex,
  sender: wallet.eth.address,
  recipient: body.to
 });

 console.log(JSON.stringify(mail));

 return Promise.resolve({
  message: "Successfully transferred token.",
  txHash: transferTokenResponse.payload.hex,
  view_in_explorer: getExplorerLink("eth", transferTokenResponse.payload.hex)
 });
};

export const transferERC721Tokens = async (wallet: Wallet, body: any) => {
 const transferTokenResponse = await ETH.transferERC721(
  wallet.eth.address,
  body.to,
  body.contract,
  wallet.eth.pk,
  body.tokens,
  body.gasPrice,
  body.gasLimit
 );

 if (transferTokenResponse.statusCode >= 400)
  throw new CustomError(
   transferTokenResponse.statusCode,
   transferTokenResponse.payload || errorCodes[transferTokenResponse.statusCode]
  );

 const mail = await sendMail("analytics", {
  coin: "erc721",
  hash: transferTokenResponse.payload.hex,
  sender: wallet.eth.address,
  recipient: body.to
 });

 console.log(JSON.stringify(mail));

 return Promise.resolve({
  message: "Successfully transferred token.",
  txHash: transferTokenResponse.payload.hex,
  view_in_explorer: getExplorerLink("eth", transferTokenResponse.payload.hex)
 });
};

export const getEthTransactionDetails = async (wallet: Wallet, params: any) => {
 const txn = await ETH.getTransactionDetails(params.txHash, wallet.eth.address);

 return Promise.resolve(txn);
};

export const importCoin = async (
 wallet: Wallet,
 privateKey: string,
 type: string
) => {
 if (type === "btc") {
  const btc = await BTC.importWallet(privateKey);
  const balanceResponse = await BTC.getAddressDetails(btc.payload.address);
  const details = {
   address: btc.payload.address,
   wif: btc.payload.wif,
   pk: privateKey,
   balance: parseFloat(balanceResponse.payload.balance)
  };
  wallet.balance = wallet.balance - wallet.btc.balance;
  wallet.btc = details;
  wallet.balance = wallet.balance + wallet.btc.balance;
 } else if (type === "eth") {
  const eth = await ETH.importWallet(privateKey);
  const ethExtraDetails = await ETH.getAddressDetails(eth.payload.address);
  const details = {
   address: eth.payload.address,
   pk: eth.payload.privateKey,
   balance: parseFloat(ethExtraDetails.payload.balance),
   tokens: ethExtraDetails.payload.tokens
  };
  wallet.balance = wallet.balance - wallet.eth.balance;
  wallet.eth = details;
  wallet.balance = wallet.balance + wallet.eth.balance;
 } else if (type === "ltc") {
  const ltc = await LTC.importWallet(privateKey);
  const ltcExtraDetails = await LTC.getAddressDetails(ltc.payload.address);
  const details = {
   address: ltc.payload.address,
   wif: ltc.payload.wif,
   balance: parseFloat(ltcExtraDetails.payload.balance)
  };
  wallet.balance = wallet.balance - wallet.ltc.balance;
  wallet.ltc = details;
  wallet.balance = wallet.balance + wallet.ltc.balance;
 } else if (type === "trx") {
  const trx = await TRON.importWallet(privateKey);
  const tronDetails = await TRON.getAddressDetails(trx.payload.address);
  const details = {
   address: trx.payload.address,
   pk: trx.payload.privateKey,
   balance: parseFloat(tronDetails.payload.balance)
  };
  wallet.balance = wallet.balance - wallet.trx.balance;
  wallet.trx = details;
  wallet.balance = wallet.balance + wallet.trx.balance;
 } else {
  throw new CustomError(400, "Type " + type + " not avaliable yet");
 }
 const newWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);
 const token = Tokenizers.generateToken({
  privateKey: newWallet.privateKey,
  publicKey: newWallet.publicKey,
  defiAccessKey: newWallet.eth.pk
 });

 return Promise.resolve({
  wallet: await WalletAdaptor.convert(newWallet),
  token
 });
};

export const importByPrivateKey = async (wallet: Wallet) => {
 const tickers = [
  "btc",
  "eth",
  "doge",
  "ltc",
  "trx",
  "dash",
  "bnb",
  "dot",
  "xtz",
  "xlm",
  "celo",
  "zil",
  "ksm",
  "xem"
 ];

 if (!wallet) throw new CustomError(404, "Wallet not found");

 const allPromises = [
  BTC.createAddress(),
  ETH.createAddress(wallet.privateKey),
  DOGE.createAddress(),
  LTC.createAddress(),
  DASH.createAddress(),
  TRON.generateAddress(),
  BNB.generateAddress(wallet.privateKey),
  DOT.generateAddress(wallet.publicKey),
  XTZ.generateAddress(wallet.privateKey),
  XLM.generateAddress(),
  CELO.createAddress(wallet.privateKey),
  // NEAR.createAddress(),
  ZIL.generateAddress(),
  KSM.generateAddress(wallet.publicKey),
  XEM.generateAddress()
 ];

 const [
  btcAddressCreationResponse,
  ethAddressCreationResponse,
  dogeAddressCreationResponse,
  ltcAddressCreationResponse,
  dashAddressCreationResponse,
  tronAddressCreationResponse,
  bnbAddressCreationResponse,
  dotAddressCreationResponse,
  xtzAddressCreationResponse,
  xlmAddressCreationResponse,
  celoAddressCreationResponse,
  // nearAddressCreationResponse,
  zilAddressCreationResponse,
  ksmAddressCreationResponse,
  xemAddressCreationResponse
 ] = await Promise.all(allPromises);

 const allDetailsPromises = [
  BTC.getAddressDetails(btcAddressCreationResponse.payload.address),
  ETH.getAddressDetails(ethAddressCreationResponse.payload.address),
  DOGE.getAddressDetails(dogeAddressCreationResponse.payload.address),
  LTC.getAddressDetails(ltcAddressCreationResponse.payload.address),
  DASH.getAddressDetails(dashAddressCreationResponse.payload.address),
  TRON.getAddressDetails(tronAddressCreationResponse.payload.base58),
  BNB.getAddressDetails(bnbAddressCreationResponse.payload.address),
  DOT.getAddressDetails(dotAddressCreationResponse.payload.address),
  XTZ.getAddressDetails(xtzAddressCreationResponse.payload.address),
  XLM.getAddressDetails(xlmAddressCreationResponse.payload.address),
  CELO.getAddressDetails(celoAddressCreationResponse.payload.address),
  // NEAR.getAddressDetails(nearAddressCreationResponse.payload.address),
  ZIL.getAddressDetails(zilAddressCreationResponse.payload.address),
  KSM.getAddressDetails(ksmAddressCreationResponse.payload.address),
  XEM.getAddressDetails(xemAddressCreationResponse.payload.address)
 ];

 const [
  btcAddressDetailsResponse,
  ethAddressDetailsResponse,
  dogeAddressDetailsResponse,
  ltcAddressDetailsResponse,
  dashAddressDetailsResponse,
  tronAddressDetailsResponse,
  bnbAddressDetailsResponse,
  dotAddressDetailsResponse,
  xtzAddressDetailsResponse,
  xlmAddressDetailsResponse,
  celoAddressDetailsResponse,
  // nearAddressDetailsResponse,
  zilAddressDetailsResponse,
  ksmAddressDetailsResponse,
  xemAddressDetailsResponse
 ] = await Promise.all(allDetailsPromises);

 const coins = {
  btc: {
   address: btcAddressCreationResponse.payload.address,
   wif: btcAddressCreationResponse.payload.wif,
   balance: parseFloat(btcAddressDetailsResponse.payload.balance),
   pk: btcAddressCreationResponse.payload.privateKey
  },
  eth: {
   address: ethAddressCreationResponse.payload.address,
   balance: parseFloat(ethAddressDetailsResponse.payload.balance),
   tokens: ethAddressDetailsResponse.payload.tokens,
   collectibles: ethAddressDetailsResponse.payload.collectibles,
   pk: ethAddressCreationResponse.payload.privateKey
  },
  doge: {
   address: dogeAddressCreationResponse.payload.address,
   wif: dogeAddressCreationResponse.payload.wif,
   balance: parseFloat(dogeAddressDetailsResponse.payload.balance)
  },
  ltc: {
   address: ltcAddressCreationResponse.payload.address,
   wif: ltcAddressCreationResponse.payload.wif,
   balance: parseFloat(ltcAddressDetailsResponse.payload.balance)
  },
  trx: {
   address: tronAddressCreationResponse.payload.base58,
   balance: tronAddressDetailsResponse.payload.balance,
   pk: tronAddressCreationResponse.payload.privateKey
  },
  dash: {
   address: dashAddressCreationResponse.payload.address,
   wif: dashAddressCreationResponse.payload.wif,
   balance: parseFloat(dashAddressDetailsResponse.payload.balance)
  },
  bnb: {
   address: bnbAddressCreationResponse.payload.address,
   pk: bnbAddressCreationResponse.payload.privateKey,
   balance: bnbAddressDetailsResponse.payload.balance
  },
  dot: {
   address: dotAddressCreationResponse.payload.address,
   pk: dotAddressCreationResponse.payload.privateKey,
   balance: dotAddressDetailsResponse.payload.balance
  },
  xtz: {
   address: xtzAddressCreationResponse.payload.address,
   pk: xtzAddressCreationResponse.payload.privateKey,
   balance: xtzAddressDetailsResponse.payload.balance,
   revealed: false
  },
  xlm: {
   address: xlmAddressCreationResponse.payload.address,
   pk: xlmAddressCreationResponse.payload.privateKey,
   balance: xlmAddressDetailsResponse.payload.balance
  },
  celo: {
   address: celoAddressCreationResponse.payload.address,
   pk: celoAddressCreationResponse.payload.privateKey,
   balance: celoAddressDetailsResponse.payload.balance
  },
  // near: {
  //  address: nearAddressCreationResponse.payload.address,
  //  pk: nearAddressCreationResponse.payload.privateKey,
  //  balance: nearAddressDetailsResponse.payload.balance
  // },
  zil: {
   address: zilAddressCreationResponse.payload.address,
   pk: zilAddressCreationResponse.payload.privateKey,
   balance: zilAddressDetailsResponse.payload.balance
  },
  ksm: {
   address: ksmAddressCreationResponse.payload.address,
   pk: ksmAddressCreationResponse.payload.privateKey,
   balance: ksmAddressDetailsResponse.payload.balance
  },
  xem: {
   address: xemAddressCreationResponse.payload.address,
   pk: xemAddressCreationResponse.payload.privateKey,
   balance: xemAddressDetailsResponse.payload.balance
  }
 };

 let newBalance = 0;

 for (const ticker of tickers)
  if (!wallet[ticker]) {
   wallet[ticker] = coins[ticker];
   newBalance = newBalance + coins[ticker].balance;
  }

 wallet.balance = wallet.balance + newBalance;

 const updatedWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);

 const token = Tokenizers.generateToken({
  privateKey: wallet.privateKey,
  publicKey: wallet.publicKey,
  defiAccessKey: wallet.eth.pk
 });

 return Promise.resolve({
  token,
  wallet: await WalletAdaptor.convert(updatedWallet)
 });
};

export const getSupportedERC20Tokens = async () => {
 const responseArray: Array<any> = [];
 for (const symbol of CURRENT_ERC20_TOKENS) {
  if (SYMBOL_TO_CONTRACT_ADDRESS_MAP.has(symbol)) {
   responseArray.push({
    symbol: symbol,
    contractAddress: SYMBOL_TO_CONTRACT_ADDRESS_MAP.get(symbol)
   });
  }
 }

 return Promise.resolve(responseArray);
};

export const addCustomERC20Token = async (wallet: Wallet, body: any) => {
 const newToken: ERCToken = {
  contract: body.contract,
  symbol: body.symbol,
  name: body.name,
  decimals:
   typeof body.decimals === "string" ? parseInt(body.decimals) : body.decimals,
  type: "ERC-20",
  balance: "0"
 };
 wallet.eth.tokens = [...wallet.eth.tokens, newToken];
 await DBWallet.updateWallet(wallet.privateKey, wallet);
};

export const addCustomERC721Token = async (wallet: Wallet, body: any) => {
 const newToken: ERCToken = {
  contract: body.contract,
  symbol: body.symbol,
  name: body.name,
  decimals: null,
  type: "ERC-721",
  balance: "0"
 };
 wallet.eth.collectibles = [...(wallet.eth.collectibles || []), newToken];
 await DBWallet.updateWallet(wallet.privateKey, wallet);
};
