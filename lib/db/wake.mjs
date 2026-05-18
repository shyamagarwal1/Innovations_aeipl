/**
 * Wakes a suspended Neon endpoint before drizzle-kit runs.
 * Neon free-tier endpoints suspend after inactivity; the pg driver fails
 * immediately on a suspended endpoint instead of waiting for it to resume.
 * This script uses @neondatabase/serverless (HTTP-based) which handles the
 * cold-start transparently, then exits so drizzle-kit can connect normally.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

try {
  const sql = neon(url);
  await sql`SELECT 1`;
  console.log("[wake] Database endpoint is ready.");
} catch (err) {
  console.error("[wake] Could not wake database endpoint:", err.message);
  process.exit(1);
}
