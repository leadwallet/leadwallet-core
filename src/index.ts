import express from "express";
import mongoose from "mongoose";
import config from "./config";
import { Environment } from "./env";

let app: express.Application = express();
const port = process.env.PORT || 7890

app = config(app);

app.listen(port, async () => {
 console.log(`Server listening on port ${port} in ${process.env.NODE_ENV}`);
 const mongo = await mongoose.connect(Environment.MONGO_URI[process.env.NODE_ENV], {
  useNewUrlParser: true,
  useFindAndModify: false
 });
 if (mongo)
  console.log("Connected to mongodb");
});

// Export app for tests
export default app;
