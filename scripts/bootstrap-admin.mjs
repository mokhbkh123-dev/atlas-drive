/**
 * Creates (or resets) the first SUPER_ADMIN account from .env credentials.
 * There is no public admin registration — this script is the only way in.
 *
 *   node scripts/bootstrap-admin.mjs          # create if missing
 *   node scripts/bootstrap-admin.mjs --reset  # reset password of existing admin
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = require(path.join(root, "node_modules", "better-sqlite3"))(
  path.join(root, "dev.db")
);

// --- env -------------------------------------------------------------------
const envPath = path.join(root, ".env");
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const email = env.ADMIN_EMAIL;
const password = env.ADMIN_PASSWORD;
const name = env.ADMIN_NAME || "ATLAS DRIVE";
if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  process.exit(1);
}
if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters");
  process.exit(1);
}

// --- scrypt (must match lib/auth.ts exactly) --------------------------------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}
function verifyPassword(pw, stored) {
  const [scheme, salt, hash] = (stored || "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = crypto.scryptSync(pw, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

const now = new Date().toISOString();
const existing = db
  .prepare("SELECT id, passwordHash FROM User WHERE email = ?")
  .get(email);

if (existing && !process.argv.includes("--reset")) {
  if (verifyPassword(password, existing.passwordHash)) {
    console.log(`Admin already exists and matches .env: ${email}`);
    process.exit(0);
  }
  console.error(
    `A user with ${email} exists but the .env password does not match.\n` +
      `Run with --reset to set the ADMIN_PASSWORD from .env.`
  );
  process.exit(1);
}

if (existing) {
  db.prepare("UPDATE User SET passwordHash = ?, updatedAt = ? WHERE id = ?").run(
    hashPassword(password),
    now,
    existing.id
  );
  console.log(`Password reset for admin: ${email}`);
} else {
  const id = crypto.randomBytes(12).toString("hex");
  db.prepare(
    `INSERT INTO User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'SUPER_ADMIN', 1, ?, ?)`
  ).run(id, name, email, hashPassword(password), now, now);
  console.log(`Created SUPER_ADMIN: ${email}`);
}
