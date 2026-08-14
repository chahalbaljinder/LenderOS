import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

export function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export async function waitForPostgres(_connectionString, attempts = 30) {
  console.log("Waiting for PostgreSQL...");

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = spawnSync(
      "docker",
      [
        "compose",
        "exec",
        "-T",
        "postgres",
        "pg_isready",
        "-U",
        "lenderos",
        "-d",
        "lenderos",
      ],
      {
        stdio: "ignore",
        shell: process.platform === "win32",
      },
    );

    if (result.status === 0) {
      console.log("PostgreSQL is ready.");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("PostgreSQL did not become ready in time.");
}
