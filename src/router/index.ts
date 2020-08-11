import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
 res.status(200).json({
  code: 200,
  response: {
   message: "Welcome to the Lead Wallet core API",
   path: req.path,
   method: req.method
  }
 });
});

export default router;
