import { Router } from "express";
import walletRouter from "./wallet";

const router = Router();

router.get("/", (req, res) => {
 res.status(200).json({
  code: 200,
  response: {
   message: "Welcome to the Lead Wallet core main API",
   path: req.path,
   method: req.method
  }
 });
});

router.use("/wallet", walletRouter);

export default router;
