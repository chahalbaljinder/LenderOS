import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import supertest from "supertest";
import express from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const { mockDbExecute, mockLogger } = vi.hoisted(() => {
  const execute = vi.fn();
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn((...args) => console.error("LOGGER ERROR:", ...args)),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn(function () {
      return logger;
    }),
  };
  return { mockDbExecute: execute, mockLogger: logger };
});

vi.mock("@workspace/db", () => ({
  db: {
    execute: mockDbExecute,
  },
}));

vi.mock("../lib/logger", () => ({
  logger: mockLogger,
}));

let app: express.Express;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  mockDbExecute.mockResolvedValue({ rows: [{ "?column?": 1 }] });

  const { default: healthRouter } = await import("./health");
  const { createApp } = await import("../app");

  app = createApp();
  app.use("/api", healthRouter);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/healthz", () => {
  it("should return healthy status when database is accessible", async () => {
    mockDbExecute.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await supertest(app).get("/api/healthz").expect(200);

    const parsed = HealthCheckResponse.parse(response.body);
    expect(parsed.status).toBe("ok");
    expect(parsed.api).toBe("ok");
    expect(parsed.database).toBe("ok");
    expect(parsed.uptime).toBeGreaterThanOrEqual(0);
    expect(parsed.timestamp).toBeDefined();
    expect(parsed.version).toBeDefined();
  });

  it("should return degraded status when database is unavailable", async () => {
    mockDbExecute.mockRejectedValueOnce(new Error("Connection refused"));

    const response = await supertest(app).get("/api/healthz").expect(503);

    const parsed = HealthCheckResponse.parse(response.body);
    expect(parsed.status).toBe("degraded");
    expect(parsed.api).toBe("ok");
    expect(parsed.database).toBe("down");
    expect(parsed.uptime).toBeGreaterThanOrEqual(0);
    expect(parsed.timestamp).toBeDefined();
  });

  it("should return valid ISO 8601 timestamp", async () => {
    mockDbExecute.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await supertest(app).get("/api/healthz").expect(200);

    const timestamp = response.body.timestamp;
    expect(() => new Date(timestamp)).not.toThrow();
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it("should include version in response", async () => {
    mockDbExecute.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await supertest(app).get("/api/healthz").expect(200);

    expect(response.body.version).toBeDefined();
    expect(typeof response.body.version).toBe("string");
  });
});

describe("Health check validation", () => {
  it("should validate response against HealthCheckResponse schema", async () => {
    mockDbExecute.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await supertest(app).get("/api/healthz").expect(200);

    expect(() => HealthCheckResponse.parse(response.body)).not.toThrow();
  });
});