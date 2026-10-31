import crypto from "node:crypto";
import { cache } from "react";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE = "ad_session";
export const SESSION_TTL_DAYS = 7;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sessionId: string;
};

// --- password hashing (scrypt, no external dependency) ----------------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = (stored || "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return (
      candidate.length === expected.length &&
      crypto.timingSafeEqual(candidate, expected)
    );
  } catch {
    return false;
  }
}

// --- sessions ---------------------------------------------------------------

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createSession(
  userId: string,
  userAgent?: string | null
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  );
  await prisma.session.create({
    data: { tokenHash: sha256(token), userId, userAgent: userAgent ?? null, expiresAt },
  });
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
    store.delete(SESSION_COOKIE);
  }
}

/**
 * Validate the session cookie against the database.
 * Cached per-request by React `cache()` so layouts and helpers share one lookup.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (!session.user.isActive) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
  };
});

/** Authenticate an email/password pair. Returns the user or null. */
export async function login(
  email: string,
  password: string,
  userAgent?: string | null
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !user.isActive) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  const token = await createSession(user.id, userAgent);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await setSessionCookie(token);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sessionId: "new",
  };
}
