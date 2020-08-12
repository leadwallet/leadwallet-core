import express from "express";
import logger from "morgan";
import router from "../router";

export default (app: express.Application): express.Application => {
 app.use(express.json());
 app.use(express.urlencoded({
  extended: false
 }));
 app.use(logger("dev"));
 app.use("/api/v1", router);
 return app;
};
