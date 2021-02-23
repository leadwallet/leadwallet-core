import express from "express";
// import DelayedResponse from "http-delayed-response";
import { CustomError } from "../custom";

export const timeout = (timeout: number = 12000) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      res.setTimeout(timeout, () => {
        try {
          throw new CustomError(
            408,
            "Server did not respond on time but your request is still processed behind the scenes."
          );
        } catch (error) {
          res.status(error.code || 500).send(error.message);
        }
      });
      next();
    } catch (error) {
      res.status(error.code || 500).send(error.message);
    }
  };
};
