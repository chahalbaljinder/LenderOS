#!/usr/bin/env node
/**
 * One-time local setup: start Postgres, install deps, push schema, seed demo data.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFile, waitForPostgres } from "./lib/env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const envExamplePath = path.join(root, ".env.example");

function run(command, args, options = {}) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureEnvFile() {
  if (existsSync(envPath)) {
    console.log("Using existing .env");
    return;
  }

  if (!existsSync(envExamplePath)) {
    console.error("Missing .env.example — cannot bootstrap environment.");
    process.exit(1);
  }

  copyFileSync(envExamplePath, envPath);
  console.log("Created .env from .env.example");
  console.log(
    "Update CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, and VITE_CLERK_PUBLISHABLE_KEY before signing in.",
  );
}

console.log("LenderOS — local setup\n");

ensureEnvFile();
loadEnvFile(envPath);

run("docker", ["compose", "up", "-d"]);
waitForPostgres(process.env.DATABASE_URL);

run("pnpm", ["install"]);
run("pnpm", ["run", "db:push"]);
run("pnpm", ["run", "db:seed"]);

console.log("\nSetup complete.");
console.log("Next: pnpm dev");
console.log("Then open http://localhost:5173");
