import express from "express";
import config from "./config";

let app: express.Application = express();
const port = process.env.PORT || 7890

app = config(app);

app.listen(port, () => console.log(`Server listening on port ${port}`));

// Export app for tests
export default app;
