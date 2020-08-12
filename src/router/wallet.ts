import { Router } from "express";
import { WalletController } from "../controllers";

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

export default router;
