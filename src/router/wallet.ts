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

router.post(
  "/transferERC721",
  WalletMiddleware.getKeyPair,
  WalletMiddleware.getWalletFromRequest,
  WalletController.transferERC721Token
);

router.post(
  "/transferTRXAsset",
  WalletMiddleware.getKeyPair,
  WalletMiddleware.getWalletFromRequest,
  WalletController.transferTrxAssets
);

router.post(
  "/transferBEP20Asset",
  WalletMiddleware.getKeyPair,
  WalletMiddleware.getWalletFromRequest,
  WalletController.transferBEP20Assets
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

router.post(
  "/addERC20",
  WalletMiddleware.getKeyPair,
  WalletMiddleware.getWalletFromRequest,
  WalletController.addCustomERC20Token
);

router.post(
  "/addERC721",
  WalletMiddleware.getKeyPair,
  WalletMiddleware.getWalletFromRequest,
  WalletController.addCustomERC721Token
);

router.post(
  "/addTRC",
  WalletMiddleware.getKeyPair,
  WalletMiddleware.getWalletFromRequest,
  WalletController.addCustomTRCToken
);

router.post(
  "/addBEP20",
  WalletMiddleware.getKeyPair,
  WalletMiddleware.getWalletFromRequest,
  WalletController.addCustomBEP20Token
);

router.get(
  "/getCollectibles",
  WalletMiddleware.getKeyPair,
  WalletMiddleware.getWalletFromRequest,
  WalletController.getCollectibles
);

router.get(
  "/supported_trc_10_tokens",
  WalletController.getSupportedTRC10Tokens
);
// router.get(
//  "/price/erc20/:contract",
//  WalletController.getErc20Price
// );

export default router;
