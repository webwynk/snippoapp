import "dotenv/config";
import app from "./app.js";
import { getDataFilePath, initStore } from "./store.js";

const port = Number(process.env.PORT || 4000);
const isProduction = process.env.NODE_ENV === "production";

async function main() {
  if (!isProduction && !process.env.JWT_SECRET) {
    console.warn(
      "[warn] JWT_SECRET is not set. Using a development fallback secret. Set JWT_SECRET for stable sessions."
    );
  }

  await initStore();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
    console.log(`Data file: ${getDataFilePath()}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
