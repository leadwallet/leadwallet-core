import express from "express";

export const timeout = (timeout: number = 40000) => {
 return (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
 ) => {
  req.setTimeout(timeout, () => {
   res.status(503).json({
    statusCode: 503,
    response: "Request has timed out."
   });
  });
  res.setTimeout(timeout, () => {
   res.status(503).json({
    statusCode: 503,
    response: "Response has timed out."
   });
  });
  next();
 };
};
