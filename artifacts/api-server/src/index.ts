import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

console.log(`Attempting to listen on port ${port}...`);
const server = app.listen(port, (err) => {
  if (err) {
    console.error("Error listening on port:", err);
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  console.log(`Server listening on port ${port}`);
  logger.info({ port }, "Server listening");
});

server.on('listening', () => {
  console.log('Server "listening" event fired');
  const addr = server.address();
  console.log('Server address:', addr);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

console.log('Server setup complete, waiting for connections...');

// Prevent process from exiting
setInterval(() => {}, 1000);

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ err: reason }, "Unhandled Rejection at:", promise);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception");
  process.exit(1);
});
