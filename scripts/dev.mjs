#!/usr/bin/env node
/**
 * Start API server + frontend together for local development.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { loadEnvFile } from "./lib/env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");

if (!existsSync(envPath)) {
  console.error("Missing .env file. Run `pnpm setup` first.");
  process.exit(1);
}

loadEnvFile(envPath);

const apiPort = process.env.PORT ?? "5000";
const webPort = process.env.VITE_PORT ?? "5173";
const basePath = process.env.BASE_PATH ?? "/";
const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? `http://localhost:${apiPort}`;

const sharedEnv = {
  ...process.env,
  NODE_ENV: "development",
  PORT: apiPort,
  BASE_PATH: basePath,
  VITE_PORT: webPort,
  API_PROXY_TARGET: apiProxyTarget,
};

const children = [];

function start(label, command, args, cwd, env) {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[${label}] stopped (${signal})`);
    } else if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("LenderOS — local development\n");
console.log(`API:      http://localhost:${apiPort}/api/healthz`);
console.log(`Frontend: http://localhost:${webPort}\n`);

start(
  "api-build",
  "pnpm",
  ["run", "build"],
  path.join(root, "artifacts", "api-server"),
  sharedEnv,
).on("exit", (code) => {
  if (code !== 0) {
    shutdown(code ?? 1);
    return;
  }

  start(
    "api",
    "node",
    ["--enable-source-maps", "./dist/index.mjs"],
    path.join(root, "artifacts", "api-server"),
    sharedEnv,
  );

  start(
    "web",
    "pnpm",
    ["exec", "vite", "--config", "vite.config.ts", "--host", "0.0.0.0"],
    path.join(root, "artifacts", "lending-os"),
    sharedEnv,
  );
});
