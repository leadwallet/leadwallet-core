import express from "express";

const app: express.Application = express();
const port = process.env.PORT || 7890

app.listen(port, () => console.log(`Server listening on port ${port}`));

// Export app for tests
export default app;
