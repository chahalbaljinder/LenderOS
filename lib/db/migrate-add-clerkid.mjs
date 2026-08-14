#!/usr/bin/env node
import { Pool } from "pg";

const pool = new Pool({ connectionString: "postgresql://lenderos:lenderos@localhost:5432/lenderos" });

async function main() {
  console.log("Adding clerk_id column to customers table...");
  try {
    await pool.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;");
    console.log("✓ clerk_id column added to customers");
  } catch (e) {
    if (e.message.includes("already exists")) {
      console.log("✓ clerk_id column already exists");
    } else {
      console.error("Error adding clerk_id:", e.message);
      throw e;
    }
  }

  console.log("Creating invitations table...");
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        tenant_id TEXT NOT NULL REFERENCES tenants(id),
        role TEXT NOT NULL,
        invited_by TEXT NOT NULL REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','pending','accepted','provisioned','active','expired','cancelled','revoked')),
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        accepted_at TIMESTAMPTZ,
        provisioned_at TIMESTAMPTZ,
        clerk_user_id TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✓ invitations table created");
  } catch (e) {
    console.error("Error creating invitations table:", e.message);
    throw e;
  }

  await pool.end();
  console.log("Migration complete!");
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});