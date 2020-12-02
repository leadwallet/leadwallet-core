import express from "express";
import DelayedResponse from "http-delayed-response";
// import { CustomError } from "../custom";

export const timeout = (
 interval: number = 10000,
 initialDelay: number = 10000
) => {
 return (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
 ) => {
  try {
   const delayed = new DelayedResponse(req, res, next);
   let pollCount = 0;
   // delayed.on("done", (results: any) => res.json(results));
   // res.on("finish", () => {
   //  console.log(res);
   //  // delayed.end(null, { data });
   // });
   delayed
    .json()
    .on("poll", () => {
     // console.log(res);
     pollCount = pollCount + 1;

     if (pollCount === 3)
      delayed.end(null, {
       statusCode: 200,
       response: "Your request is being processed behind the scenes."
      });
    })
    .start(interval, initialDelay);
   // delayed.end(null, { status: "ok" });
  } catch (error) {
   res.status(error.code || 500).send(error.message);
  }
 };
};
