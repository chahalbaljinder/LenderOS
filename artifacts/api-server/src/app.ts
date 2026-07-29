import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Clerk proxy must come before body parsers
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rawClerkKey = process.env.CLERK_PUBLISHABLE_KEY;
const isClerkKeyValid =
  rawClerkKey &&
  rawClerkKey !== "pk_test_your_key_here" &&
  !rawClerkKey.includes("your_key_here") &&
  rawClerkKey.startsWith("pk_");

if (isClerkKeyValid) {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        rawClerkKey,
      ),
    })),
  );
} else {
  logger.warn("CLERK_PUBLISHABLE_KEY missing or placeholder; running API in local mode");
}


app.use("/api", router);

export default app;
