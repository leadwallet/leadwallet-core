import express from "express";

export const timeout = (timeout: number = 40000) => {
 return (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
 ) => {
  req.setTimeout(timeout, () => console.log("Request has timed out"));
  res.setTimeout(timeout, () => console.log("Request has timed out"));
  next();
 };
};
