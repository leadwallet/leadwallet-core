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

router.post("/create", WalletController.createWallet);
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
 WalletController.updateWallet
);
router.get(
	"/transactions/:ticker/:address",
	WalletController.getTransactions
);
router.get(
    "/price/:ticker",
    WalletController.refreshPrice
)
router.get(
    "/prices",
    WalletController.refreshPrices
)
export default router;
