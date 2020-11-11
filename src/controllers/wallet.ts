import express from "express";
import rp from "request-promise";
import db from "../db";
import { Wallet } from "../core/interfaces";
import { Tokenizers } from "../core/utils";
import { CustomError } from "../custom";
import { BTC, ETH, DOGE, LTC, TRON, DASH } from "../core/handlers";
import { TransactionService } from "../core/handlers/transaction_handler";
import { CRYPTO_API_COINS, getExplorerLink } from "../core/handlers/commons";
import { WalletAdaptor } from "../core/utils/wallet_adaptor";
import { CurrencyConverter } from "../core/utils/currency_converter";
import { TransactionFeeService } from "../core/handlers/transaction_fee_service";

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

export class WalletController {
	static async createWalletFaster(req: express.Request, res: express.Response): Promise<any> {
		try {
			// String that would be created from the incoming array of phrases
			let phrase = "";

			// The incoming recovery phrase as an array
			const recoveryPhrase: string[] = req.body.recoveryPhrase;

			// Loop through array and then append to 'phrase' string
			for (const p of recoveryPhrase)
				phrase += p + " ";

				// Generate keypair
			const keyPair = await Tokenizers.generateKeyPairs(phrase);

			const allPromises = [
    BTC.createAddress(), 
    ETH.createAddress(keyPair.privateKey),
    DOGE.createAddress(), 
    LTC.createAddress(), 
    DASH.createAddress(), 
    TRON.generateAddress()
   ];
   
			const [
    btcAddressCreationResponse,
    ethAddressCreationResponse,
    dogeAddressCreationResponse,
    ltcAddressCreationResponse,
    dashAddressCreationResponse,
    tronAddressCreationResponse
   ] = await Promise.all(allPromises);

			const allDetailsPromises = [
				BTC.getAddressDetails(btcAddressCreationResponse.payload.address),
				ETH.getAddressDetails(ethAddressCreationResponse.payload.address),
				DOGE.getAddressDetails(dogeAddressCreationResponse.payload.address),
				LTC.getAddressDetails(ltcAddressCreationResponse.payload.address),
				DASH.getAddressDetails(dashAddressCreationResponse.payload.address),
				TRON.getAddressDetails(tronAddressCreationResponse.payload.base58)
   ];
   
			const [
    btcAddressDetailsResponse,
    ethAddressDetailsResponse,
    dogeAddressDetailsResponse,
    ltcAddressDetailsResponse,
    dashAddressDetailsResponse,
    tronAddressDetailsResponse
   ] = await Promise.all(allDetailsPromises);

			console.log("Got all address details");
   
   // Instantiate wallet
			const wallet: Wallet = {
				privateKey: keyPair.privateKey,
				publicKey: keyPair.publicKey,
				balance: (
					parseFloat(btcAddressDetailsResponse.payload.balance) +
					parseFloat(ethAddressDetailsResponse.payload.balance) +
					parseFloat(dogeAddressDetailsResponse.payload.balance) +
					parseFloat(ltcAddressDetailsResponse.payload.balance) +
					tronAddressDetailsResponse.payload.balance +
					parseFloat(dashAddressDetailsResponse.payload.balance)
					// hmyAddressCreationResponse.payload.balance
				),
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
			const response = {
				wallet: await WalletAdaptor.convert(newWallet),
				token: Tokenizers.generateToken({
					privateKey: newWallet.privateKey,
     publicKey: newWallet.publicKey,
     defiAccessKey: newWallet.eth.pk
				})
			};

			// Send response
			res.status(201).json({
				statusCode: 201,
				response
			});
 } catch(error) {
		res.status(error.code || 500)
   .send(error.message);
	}
}

static async getWallet(req: express.Request & { privateKey: string, publicKey: string;}, res: express.Response): Promise<any> {
 try {
  // Private key would be deserialized from a token and passed into the request object
  const privateKey: string = req.privateKey;
		const publicKey: string = req.publicKey;
  // Get wallet using private key
  const wallet = await DBWallet.getWallet(privateKey,publicKey);

  // Send response
  res.status(200).json({
   statusCode: 200,
   response: await WalletAdaptor.convert(wallet)
  });
 } catch (error) {
  res.status(error.code || 500)
   .send(error.message);
  }
 }

	static async updateWalletFaster(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<void> {
  try {
   // Get user's wallet
   const wallet = req.wallet;

   // Get all address details
			const allAddressDetails
				= [BTC.getAddressDetails(wallet.btc.address), ETH.getAddressDetails(wallet.eth.address),
					DOGE.getAddressDetails(wallet.doge.address), LTC.getAddressDetails(wallet.ltc.address),
					TRON.getAddressDetails(wallet.trx.address), DASH.getAddressDetails(wallet.dash.address)];
			// Update wallet
			const [btcDetailsResponse, ethDetailsResponse, dogeDetailsResponse,
				ltcDetailsResponse, tronDetailsResponse, dashDetailsResponse]
				= await Promise.all(allAddressDetails);
				if(btcDetailsResponse.statusCode >= 400
					|| ethDetailsResponse.statusCode >= 400
					|| dogeDetailsResponse.statusCode >= 400
					|| ltcDetailsResponse.statusCode >= 400
					|| dashDetailsResponse.statusCode >= 400
					|| tronDetailsResponse.statusCode >= 400) {
						console.log("Could not get all address details at once")
					throw new CustomError(500,"Could not get all address details at once");
			}
   wallet.balance = (
    parseFloat(btcDetailsResponse.payload.balance) +
    parseFloat(ethDetailsResponse.payload.balance) +
    parseFloat(dogeDetailsResponse.payload.balance) +
    parseFloat(ltcDetailsResponse.payload.balance) +
    tronDetailsResponse.payload.balance +
    parseFloat(dashDetailsResponse.payload.balance)
    // hmyDetailsResponse.payload.balance
   );
   wallet.btc.balance = parseFloat(btcDetailsResponse.payload.balance);
   wallet.eth.balance = parseFloat(ethDetailsResponse.payload.balance);
   wallet.eth.tokens = ethDetailsResponse.payload.tokens;
   wallet.doge.balance = parseFloat(dogeDetailsResponse.payload.balance);
   wallet.ltc.balance = parseFloat(ltcDetailsResponse.payload.balance);
   wallet.trx.balance = tronDetailsResponse.payload.balance;
   wallet.dash.balance = parseFloat(dashDetailsResponse.payload.balance);
   // wallet.one.balance = hmyDetailsResponse.payload.balance;

   // Update wallet in db
   const newWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);

   res.status(200).json({
    statusCode: 200,
    response: await WalletAdaptor.convert(newWallet)
   });
  } catch (error) {
   console.error(error)
   res.status(error.code || 500)
    .send(error.message);
  }
	}

 static async updateWallet(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<void> {
  try {
   // Get user's wallet
   const wallet = req.wallet;

   // Get BTC address details
   const btcDetailsResponse = await BTC.getAddressDetails(wallet.btc.address);

   // Throw error for 4XX and 5XX status code ranges
   if (btcDetailsResponse.statusCode >= 400)
    throw new CustomError(btcDetailsResponse.statusCode, errorCodes[btcDetailsResponse.statusCode]);

   // Get ETH address details
   const ethDetailsResponse = await ETH.getAddressDetails(wallet.eth.address);

   // Throw error for 4XX and 5XX status code ranges
   if (ethDetailsResponse.statusCode >= 400)
    throw new CustomError(ethDetailsResponse.statusCode, errorCodes[ethDetailsResponse.statusCode]);

   // Get DOGE address details
   const dogeDetailsResponse = await DOGE.getAddressDetails(wallet.doge.address);

   // Throw error for 4XX and 5XX status code ranges
   if (dogeDetailsResponse.statusCode >= 400)
    throw new CustomError(dogeDetailsResponse.statusCode, errorCodes[dogeDetailsResponse.statusCode]);

   // Get LTC address details
   const ltcDetailsResponse = await LTC.getAddressDetails(wallet.ltc.address);

   // Throw error for 4XX and 5XX status code ranges
   if (ltcDetailsResponse.statusCode >= 400)
    throw new CustomError(ltcDetailsResponse.statusCode, errorCodes[ltcDetailsResponse.statusCode]);

   // Get TRON address details
   const tronDetailsResponse = await TRON.getAddressDetails(wallet.trx.address);

   // Get DASH address details
   const dashDetailsResponse = await DASH.getAddressDetails(wallet.dash.address);

   // Throw error if any
   if (dashDetailsResponse.statusCode >= 400)
    throw new CustomError(dashDetailsResponse.statusCode, errorCodes[dashDetailsResponse.statusCode]);

   // Get HMY address details
   // const hmyDetailsResponse = await HMY.getAddressDetails(wallet.one.address);

   // Update wallet
   wallet.balance = (
    parseFloat(btcDetailsResponse.payload.balance) + 
    parseFloat(ethDetailsResponse.payload.balance) + 
    parseFloat(dogeDetailsResponse.payload.balance) +
    parseFloat(ltcDetailsResponse.payload.balance) + 
    tronDetailsResponse.payload.balance +
    parseFloat(dashDetailsResponse.payload.balance)
    // hmyDetailsResponse.payload.balance
   );
   wallet.btc.balance = parseFloat(btcDetailsResponse.payload.balance);
   wallet.eth.balance = parseFloat(ethDetailsResponse.payload.balance);
   // wallet.eth.tokens = ethDetailsResponse.payload.tokens;
   wallet.doge.balance = parseFloat(dogeDetailsResponse.payload.balance);
   wallet.ltc.balance = parseFloat(ltcDetailsResponse.payload.balance);
   wallet.trx.balance = tronDetailsResponse.payload.balance;
   wallet.dash.balance = parseFloat(dashDetailsResponse.payload.balance);
   // wallet.one.balance = hmyDetailsResponse.payload.balance;

   // console.log("tokens",  ethDetailsResponse.payload.tokens);

   // Update wallet in db
   const newWallet = await DBWallet.updateWallet(wallet.privateKey, wallet);

   res.status(200).json({
    statusCode: 200,
    response: await WalletAdaptor.convert(newWallet)
   });
  } catch (error) {
   res.status(error.code || 500)
    .send(error.message);
  }
 }

 static async importWallet(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<void> {
  try {
   const { wallet } = req;
   const token = Tokenizers.generateToken({
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    defiAccessKey: wallet.eth.pk
   });
   res.status(200).json({
    statusCode: 200,
    response: {
     wallet: await WalletAdaptor.convert(wallet),
     token
    }
   });
  } catch (error) {
   res.status(500)
    .send(error.message);
  }
 }

 static async sendToken(req: express.Request & { wallet: Wallet; privateKey: string; }, res: express.Response): Promise<any> {
  try {
   // Wallet type. BTC (Bitcoin), ETH (Ethereum) e.t.c.
   const { type } = req.body;

   // Sender's wallet
   const senderWallet = req.wallet;

   // Empty array of wallets. Would serve as updated recipients' wallets
   // let wallets: Array<Wallet> = [];

   // Empty array of encrypted recipients' wallets
   // const encRecipientWallets: Array<string> = [];

   // All wallets in the database. Recipient's wallet would be singled out and updated
   // const allWallets = await DBWallet.getAllWallets();

   // Total balance to be sent
   let balance: number = 0;
   let txHash: string = "";
   let txId: string = "";
   if (type === "btc") {

    // Increment balance for every input
    for (const i of req.body.inputs)
     balance = balance + i.value
  
    // Throw error if sender's balance is less than balance to be sent
    if (senderWallet.balance < balance)
     throw new CustomError(400, "Wallet balance is not sufficient.");

    // Throw error if sender's btc balance is less than balance to be sent
    if (senderWallet.btc.balance < balance)
     throw new CustomError(400, "Insufficient BTC balance");
    
    // Send BTC
    const btcSentResponse = await BTC.sendToken(
     req.body.inputs,
     req.body.outputs,
     { address: senderWallet.btc.address, value: parseFloat(Number(req.body.fee).toFixed(8)) },
     senderWallet.btc.wif
    );

    // Update sender's btc balance
    senderWallet.btc.balance = senderWallet.btc.balance - balance;
    txHash = btcSentResponse.payload.hex;
    txId = btcSentResponse.payload.txId;
   } else if (type === "eth") {
      // Increment balance
       balance = balance + req.body.value;

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
       const ethSentResponse = await ETH.sendToken(senderWallet.eth.pk, req.body);

       // Throw error for 4XX or 5XX status code ranges
       if (ethSentResponse.statusCode >= 400) {
        console.error(ethSentResponse);
        throw new CustomError(ethSentResponse.statusCode, ethSentResponse.payload || errorCodes[ethSentResponse.statusCode]);
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
      } else if (type === "doge") {
       // Increment balance
       for (const i of req.body.inputs)
        balance = balance + i.value;

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
        const dogeSentResponse = await DOGE.sendToken(
         req.body.inputs,
         req.body.outputs,
         { value: parseFloat(Number(req.body.fee.value).toFixed(8)) }
        );

        // Throw error if status code is within 4XX and 5XX ranges
        if (dogeSentResponse.statusCode >= 400)
         throw new CustomError(dogeSentResponse.statusCode, dogeSentResponse.payload || errorCodes[dogeSentResponse.statusCode]);
        
        // Sign transaction immediately
        const signTransactionResponse = await DOGE.signTransaction(
         dogeSentResponse.payload.hex,
         [senderWallet.doge.wif]
        );

        // Throw error if status code is within 4XX and 5XX ranges
        if (signTransactionResponse.statusCode >= 400)
         throw new CustomError(signTransactionResponse.statusCode, signTransactionResponse.payload || errorCodes[signTransactionResponse.statusCode]);

        // Broadcast transaction to the Dogecoin blockchain
        const broadcastTransactionResponse = await DOGE.broadcastTransaction(signTransactionResponse.payload.hex);

        // Throw error if status code is within 4XX and 5XX ranges
        if (broadcastTransactionResponse.statusCode >= 400)
        throw new CustomError(broadcastTransactionResponse.statusCode, broadcastTransactionResponse.payload || errorCodes[broadcastTransactionResponse.statusCode]);

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
      } else if (type === "ltc") {
       // Increment balance
       for (const i of req.body.inputs)
        balance = balance + i.value;

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
       const ltcSentResponse = await LTC.sendToken(req.body.inputs, req.body.outputs, { value: parseFloat(Number(req.body.fee.value).toFixed(8)) });

       console.log(ltcSentResponse);

       // Throw error if status code is within 4XX and 5XX
       if (ltcSentResponse.statusCode >= 400)
        throw new CustomError(ltcSentResponse.statusCode, ltcSentResponse.payload || errorCodes[ltcSentResponse.statusCode]);

       // Sign transaction
       const transactionSignResponse = await LTC.signTransaction(
        ltcSentResponse.payload.hex,
        [senderWallet.ltc.wif]
       );

       // Throw error for 4XX and 5XX status codes
       if (transactionSignResponse.statusCode >= 400)
        throw new CustomError(transactionSignResponse.statusCode, transactionSignResponse.payload || errorCodes[transactionSignResponse.statusCode]);

       // Broadcast transaction to the Litecoin blockchain
       const broadcastTransactionResponse = await LTC.broadcastTransaction(transactionSignResponse.payload.hex);

       // Throw error if there is any
       if (broadcastTransactionResponse.statusCode >= 400)
        throw new CustomError(broadcastTransactionResponse.statusCode, broadcastTransactionResponse.payload || errorCodes[broadcastTransactionResponse.statusCode]);

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
      } else if (type === "trx") {
       balance = balance + req.body.amount;

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
       const tronSentResponse = await TRON.sendToken(senderWallet.trx.address, req.body.to, req.body.amount);

       // Check for errors
       if (tronSentResponse.statusCode >= 400){
         console.log(tronSentResponse);
        throw new CustomError(tronSentResponse.statusCode, tronSentResponse.payload);
       }

       // Sign transaction
       const signTransactionResponse = await TRON.signTransaction(tronSentResponse.payload, senderWallet.trx.pk);

       // Check for errors
       if (signTransactionResponse.statusCode >= 400)
        throw new CustomError(signTransactionResponse.statusCode, signTransactionResponse.payload);
       
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
      } else if (type === "dash") {
       // Increment balance
       for (const i of req.body.inputs)
        balance = balance + i.value;

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
       const dashSentResponse = await DASH.sendToken(req.body.inputs, req.body.outputs, { value: parseFloat(Number(req.body.fee.value).toFixed(8)) });

       // Throw error if status code is within 4XX and 5XX
       if (dashSentResponse.statusCode >= 400)
        throw new CustomError(dashSentResponse.statusCode, dashSentResponse.payload || errorCodes[dashSentResponse.statusCode]);

       // Sign transaction
       const transactionSignResponse = await DASH.signTransaction(
        dashSentResponse.payload.hex,
        [senderWallet.dash.wif]
       );

       // Throw error for 4XX and 5XX status codes
       if (transactionSignResponse.statusCode >= 400)
        throw new CustomError(transactionSignResponse.statusCode, transactionSignResponse.payload || errorCodes[transactionSignResponse.statusCode]);

       // Broadcast transaction to the Litecoin blockchain
       const broadcastTransactionResponse = await DASH.broadcastTransaction(transactionSignResponse.payload.hex);

       // Throw error if there is any
       if (broadcastTransactionResponse.statusCode >= 400)
        throw new CustomError(broadcastTransactionResponse.statusCode, broadcastTransactionResponse.payload || errorCodes[broadcastTransactionResponse.statusCode]);

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
      }

   // Update sender's wallet balance by deducting from it 
   senderWallet.balance = senderWallet.balance - balance;

   // Update sender's wallet
   const updatedSenderWallet = await DBWallet.updateWallet(req.privateKey, senderWallet);

   // API response
   const response = {
    sender: Tokenizers.encryptWallet(updatedSenderWallet),
    // recipients: encRecipientWallets,
    message: "Transaction successful.",
    txHash,
    txId,
    view_in_explorer: getExplorerLink(type, txHash)
   };

   //Send response
   res.status(200).json({
    statusCode: 200,
    response
   });
  } catch (error) {
   res.status(error.code || 500)
    .send(error.message);
  }
 }

	static async getTransactions(req: express.Request , res: express.Response): Promise<any> {
		try {
			const {ticker , address} = req.params
			if (CRYPTO_API_COINS.includes(ticker)) {
        const response = await TransactionService.getTransactions(ticker,address);
    
        let apiResponse = [];
        if (ticker !== "eth") {
         const response2 = await TransactionService.getPendingTransactions(ticker, address);
          apiResponse = response.payload.map((item: any) => ({
              hash: item.txid,
              amount: Object.keys(item.received).map((a) => a.toLowerCase()).includes(address.toLowerCase()) ? "+" + item.amount : "-" + item.amount,
              fee: item.fee,
              status: item.confirmations > 0 ? "Confirmed" : "Pending",
              from: Object.keys(item.sent).map((key) => key).join(", "),
              to: Object.keys(item.received).map((key) => key).join(", "),
              date: item.datetime,
              view_in_explorer: getExplorerLink(ticker, item.txid)
            }));
           apiResponse = apiResponse.concat(response2.payload.map((item: any) => ({
            hash: item.hash,
            amount: item.txins[0].addresses.map((a: string) => a.toLowerCase()).includes(address.toLowerCase()) ? "-" + item.txins[0].amount : "+" + item.txouts[0].amount,
            status: "Pending",
            from: item.txins[0].addresses.join(", "),
            to: item.txouts[0].addresses.join(", "),
            date: item.datetime,
            view_in_explorer: getExplorerLink(ticker, item.txid)
           })));
        } else {
            // console.log(response.payload);
            apiResponse = response.payload.map( async (item: any) => ({
              hash: item.hash,
              amount: item.sent.toLowerCase() === address.toLowerCase() ? "-" + item.amount : "+" + item.amount,
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

        res.status(200).json({
        statusCode: 200,
        response: apiResponse
        });
			} else if (ticker.toLowerCase() === 'erc-20') {
        const response = await TransactionService.getERC20Transactions(address);
        const apiResponse: Array<any> = response.payload.map((txn: any) => ({
          hash: txn.txHash,
          from: txn.from,
          to: txn.to,
          date: txn.datetime,
          amount: txn.from.toLowerCase() === address.toLowerCase() ? "-" + txn.value : "+" + txn.value,
          name: txn.name,
          symbol: txn.symbol,
          type: txn.type,
          view_in_explorer: getExplorerLink("eth", txn.txHash)
        }));
        res.status(200).json({
          statusCode: 200,
          response: apiResponse
        });
      } else if (ticker.toLowerCase() === "trx") {
       const response = await TRON.getTransactions(address);
       const apiResponse = response.payload.map((item: any) => ({
        hash: item.txID,
        from: item.raw_data.contract[0].from,
        to: item.raw_data.contract[0].to,
        date: new Date(item.raw_data.timestamp),
        amount: item.raw_data.contract[0].value,
        fee: item.net_fee / (10 ** 6),
        status: item.ret[0].contractRet === "SUCCESS" ? "Confirmed" : "Pending",
        view_in_explorer: getExplorerLink(ticker, item.txID)
       }));
       res.status(200).json({
        statusCode: 200,
        response: apiResponse
       });
			}
		} catch (error) {
			res.status(error.code || 500)
    .send(error.message);
		}
	}
	static async refreshPrices(req: express.Request, res: express.Response): Promise<any> {
		try {
			const currencyConverter = await CurrencyConverter.getInstance();
			const priceMap = currencyConverter.getAllPricesUSD();
			let respObj = {};
			priceMap.forEach((value,key) => {
				respObj[key] = value;
			})
			res.status(200).json({
				statusCode: 200,
				response: respObj
			});
		} catch (error) {
			res.status(error.code || 500)
    .send(error.message);
		}
	}

	static async refreshPrice(req: express.Request, res: express.Response): Promise<any> {
		try {
			let currencyConverter = await CurrencyConverter.getInstance();
      const {ticker} = req.params;
			if(ticker.startsWith("0x")) {
        const values = await currencyConverter.getTokenPriceInUSD(ticker);
        res.status(200).json({
          statusCode: 200,
          response: values
        });
      } else {
        const value = currencyConverter.getPriceInUSD(ticker);
        res.status(200).json({
          statusCode: 200,
          response: value
        });
      }
		} catch (error) {
			res.status(error.code || 500)
    .send(error.message);
		}
 }
 
 // static async getErc20Price(req: express.Request, res: express.Response): Promise<any> {
 //  try {
 //   const currencyConverter = await CurrencyConverter.getInstance();
 //   const { contract } = req.params;
 //   res.status(200).json({
 //    statusCode: 200,
 //    response: await currencyConverter.getERC20InUSD(contract)
 //   });
 //  } catch (error) {
 //   res.status(500).json({
 //    statusCode: 500,
 //    response: error.message
 //   });
 //  }
 // }

	static async getEstimatedTransactionFee(req: express.Request, res: express.Response) : Promise<any> {
		try {
			const {ticker} = req.params;
			const fromAddress: string = req.body.fromAddress;
			const toAddress: string =  req.body.toAddress;
      const value: number = req.body.value;
      const contract: string = req.body.contract;
      const txFee: any = (ticker.toLowerCase() === "erc-20")
       ? await TransactionFeeService.getERC20TransactionFee(fromAddress,toAddress,contract,value)
			 : await TransactionFeeService.getTransactionFee(ticker,fromAddress,toAddress,value);
			res.status(200).json({
				statusCode: 200,
				txFee
			});
		} catch (error) {
			res.status(500)
    .send(error.message);
 }
}
 
 static async getERC20Tokens(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<any> {
  try {
   const { wallet } = req;
   const tokensResponse = await ETH.getERC20Tokens(wallet.eth.address);

   if (tokensResponse.statusCode >= 400)
    throw new CustomError(tokensResponse.statusCode, tokensResponse.payload || errorCodes[tokensResponse.payload]);

   const response = tokensResponse.payload.length > 0 ? [
    ...tokensResponse.payload.map(async (token: any) => {
     const contractDetails = await rp.get("https://api.coingecko.com/api/v3/coins/ethereum/contract/" + token.contract, {
      simple: false,
      json: true,
      resolveWithFullResponse: true
     });
     
     if (contractDetails.statusCode >= 400)
      throw new CustomError(contractDetails.statusCode, "Could not retrieve image for " + token.contract);
     
     return {
      ...token,
      image: contractDetails.body.image
     }
    })
   ] : [];

   res.status(200).json({
    statusCode: 200,
    response
   });
  } catch (error) {
   res.status(error.code || 500)
    .send(error.message);
  }
 }

 static async transferERC20Token(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<any> {
  try {
   const { wallet } = req;
   const transferTokenResponse = await ETH.transferERC20(
    wallet.eth.address, 
    req.body.to, 
    req.body.contract, 
    wallet.eth.pk,
    req.body.tokens,
    req.body.gasPrice,
    req.body.gasLimit
   );

   if (transferTokenResponse.statusCode >= 400)
    throw new CustomError(transferTokenResponse.statusCode, transferTokenResponse.payload || errorCodes[transferTokenResponse.statusCode]);

   const response = {
    message: "Successfully transferred token.",
    txHash: transferTokenResponse.payload.hex,
    view_in_explorer: getExplorerLink("eth", transferTokenResponse.payload.hex)
   };

   res.status(200).json({
    statusCode: 200,
    response
   });
  } catch (error) {
   res.status(error.code || 500)
    .send(error.message);
  }
 }

 static async getETHTransactionDetails(req: express.Request & { wallet: Wallet; }, res: express.Response) {
  try {
   const { wallet, params } = req;
   const txn = await ETH.getTransactionDetails(params.txHash, wallet.eth.address);
   res.status(200).json({
    statusCode: 200,
    response: { ...txn.payload }
   });
  } catch (error) {
   res.status(error.code || 500)
    .send(error.message);
  }
 }

 static async importCoin(req: express.Request & { wallet: Wallet; }, res: express.Response): Promise<any> {
  try {
   const { wallet, body } = req;
   const { privateKey, type } = body;
   
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

   res.status(200).json({
    statusCode: 200,
    response: {
     wallet: await WalletAdaptor.convert(newWallet),
     token
    }
   });
  } catch (error) {
   res.status(error.code || 500)
    .send(error.message);
  }
 }

 static async importByPrivateKey(req: express.Request, res: express.Response) {
  try {
   const wallet = await DBWallet.findByPrivateKey(req.body.privateKey);

   if (!wallet)
    throw new CustomError(404, "Wallet not found");

   const token = Tokenizers.generateToken({
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    defiAccessKey: wallet.eth.pk
   });
   res.status(200).json({
    statusCode: 200,
    response: {
     token,
     wallet: await WalletAdaptor.convert(wallet)
    }
   });
  } catch (error) {
   res.status(error.code || 500)
    .send(error.message);
  }
 }
}
