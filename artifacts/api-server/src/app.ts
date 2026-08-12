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
import { generalLimiter, authLimiter, strictLimiter } from "./middlewares/rateLimiter";
import router from "./routes";
import { logger } from "./lib/logger";

function createApp(): Express {
  const app: Express = express();

  // Skip pinoHttp in test environment to avoid logger mock issues
  if (process.env.NODE_ENV !== "test") {
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
  }

  // Clerk proxy must come before body parsers
  app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

  // CORS configuration - restrict to allowed origins in production
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:5173", "http://localhost:3000"];

  app.use(
    cors({
      credentials: true,
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn({ origin }, "CORS blocked request from unauthorized origin");
          callback(new Error("Not allowed by CORS"));
        }
      },
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply general rate limiting to all routes (except health check)
  app.use(generalLimiter);

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

  // Apply stricter rate limiting to auth endpoints
  app.use("/api/auth", authLimiter);
  app.use("/api/sign-in", authLimiter);
  app.use("/api/sign-up", authLimiter);

  // Apply strict rate limiting to sensitive operations
  app.use("/api/tenants", strictLimiter);
  app.use("/api/users", strictLimiter);

  app.use("/api", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await new Promise<void>((resolve, reject) => {
        router(req, res, (err?: unknown) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
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

  return app;
}

export { createApp };

const app = createApp();
export default app;
