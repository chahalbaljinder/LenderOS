import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const serverStartTime = Date.now();

async function checkDatabaseHealth(): Promise<"ok" | "degraded" | "down"> {
  try {
    await db.execute(sql`SELECT 1`);
    return "ok";
  } catch (error) {
    logger.error({ err: error }, "Database health check failed");
    return "down";
  }
}

function getUptimeSeconds(): number {
  return Math.floor((Date.now() - serverStartTime) / 1000);
}

router.get("/healthz", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const databaseStatus = await checkDatabaseHealth();
    const uptime = getUptimeSeconds();

    const overallStatus = databaseStatus === "ok" ? "ok" : "degraded";

    const healthData = {
      status: overallStatus,
      api: "ok",
      database: databaseStatus,
      uptime,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.1.0",
    };

    const validatedData = HealthCheckResponse.parse(healthData);

    const statusCode = overallStatus === "ok" ? 200 : 503;
    res.status(statusCode).json(validatedData);
  } catch (error) {
    next(error);
  }
});

export default router;
