import express from "express";

export const timeout = (timeout: number = 40000) => {
 return (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
 ) => {
  const space = " ";
  let isFinished = false;
  let isDataSent = false;

  res.on("finish", () => {
   isFinished = true;
  });

  res.on("end", () => {
   isFinished = true;
  });

  res.on("close", () => {
   isFinished = true;
  });

  res.on("data", data => {
   if (data !== space) isDataSent = true;
  });

  const waitAndSend = () => {
   setTimeout(() => {
    if (!isFinished && !isDataSent) {
     if (!res.headersSent) res.writeHead(202);

     res.write(space);
     waitAndSend();
    }
   }, timeout);
  };

  waitAndSend();
  next();
 };
};
