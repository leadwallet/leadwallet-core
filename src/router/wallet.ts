import { Router } from "express";
import { WalletController } from "../controllers";
import { WalletMiddleware } from "../middlewares";

const router = Router();

router.get("/", (req, res) => {
 res.status(200).json({
  code: 200,
  response: {
   message: "Welcome to the Lead Wallet core wallet API",
   path: req.path,
   method: req.method
  }
 });
});

router.post("/create", WalletController.createWalletFaster);
router.get(
 "/retrieve",
 WalletMiddleware.getKeyPair,
 WalletController.getWallet
);
router.post(
 "/import",
 WalletMiddleware.recoverWallet,
 WalletController.importWallet
);
router.post(
 "/send_token",
 WalletMiddleware.getKeyPair,
 WalletMiddleware.getWalletFromRequest,
 WalletController.sendToken
);
router.get(
 "/update",
 WalletMiddleware.getKeyPair,
 WalletMiddleware.getWalletFromRequest,
 WalletController.updateWalletFaster
);
router.get("/transactions/:ticker/:address", WalletController.getTransactions);
router.get("/price/:ticker", WalletController.refreshPrice);
router.get("/prices", WalletController.refreshPrices);
router.post(
 "/transaction/fee/:ticker",
 WalletController.getEstimatedTransactionFee
);

router.get(
 "/erc20",
 WalletMiddleware.getKeyPair,
 WalletMiddleware.getWalletFromRequest,
 WalletController.getERC20Tokens
);

router.post(
 "/transferERC20",
 WalletMiddleware.getKeyPair,
 WalletMiddleware.getWalletFromRequest,
 WalletController.transferERC20Token
);

router.get(
 "/getEthTx/:txHash",
 WalletMiddleware.getKeyPair,
 WalletMiddleware.getWalletFromRequest,
 WalletController.getETHTransactionDetails
);

router.patch(
 "/import_coin",
 WalletMiddleware.getKeyPair,
 WalletMiddleware.getWalletFromRequest,
 WalletController.importCoin
);

router.post("/import_by_key", WalletController.importByPrivateKey);

router.get("/supported_erc20_tokens", WalletController.getSupportedERC20Tokens);
// router.get(
//  "/price/erc20/:contract",
//  WalletController.getErc20Price
// );

export default router;
