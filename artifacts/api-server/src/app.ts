import express, { type Express, type NextFunction, type Request, type Response } from "express";
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
import { getDemoFallbackResponse, shouldUseDemoFallback } from "./lib/demoData";

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


app.use("/api", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await new Promise<void>((resolve, reject) => {
      router.handle(req, res, (err?: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    if (shouldUseDemoFallback(error)) {
      const fallback = getDemoFallbackResponse(req);
      if (fallback) {
        logger.warn({ req: req.path, error: error instanceof Error ? error.message : String(error) }, "Using demo fallback for API request");
        res.status(fallback.statusCode).json(fallback.body);
        return;
      }
    }

    logger.error({ err: error, req: req.path }, "Unhandled API request error");
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Express error middleware caught a failure");
  if (!res.headersSent) {
    res.status(500).json({
      error: "Internal server error",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default app;
