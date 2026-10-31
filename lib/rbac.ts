import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { getSession, type SessionUser } from "@/lib/auth";
import { can, type ModuleId } from "@/lib/access";
import type { UserRole } from "@prisma/client";

export { can, MODULES, modulesFor } from "@/lib/access";
export type { ModuleId } from "@/lib/access";

// --- page helpers (server components) ---------------------------------------

/** Redirects to /{lang}/admin/login when there is no valid session. */
export async function requireUser(lang: string): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/${lang}/admin/login`);
  return user;
}

/** requireUser + module authorization; unauthorized users see /admin/forbidden. */
export async function requireModule(
  lang: string,
  module: ModuleId
): Promise<SessionUser> {
  const user = await requireUser(lang);
  if (!can(user.role, module)) redirect(`/${lang}/admin/forbidden`);
  return user;
}

// --- API helpers (route handlers) -------------------------------------------

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Non authentifié", code: "UNAUTHORIZED" },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    { error: "Accès refusé", code: "FORBIDDEN" },
    { status: 403 }
  );
}

export type ApiAuth =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse };

/**
 * Authenticate + authorize an API route for a module.
 *
 *   const auth = await apiAuth("fleet");
 *   if (!auth.ok) return auth.response;
 *   // auth.user is SessionUser
 */
export async function apiAuth(module: ModuleId): Promise<ApiAuth> {
  const user = await getSession();
  if (!user) return { ok: false, response: unauthorizedResponse() };
  if (!can(user.role, module)) return { ok: false, response: forbiddenResponse() };
  return { ok: true, user };
}

/** Additional fine-grained role gate inside an already authorized route. */
export function requireRoles(
  user: SessionUser,
  ...roles: UserRole[]
): NextResponse | null {
  if (!roles.includes(user.role)) return forbiddenResponse();
  return null;
}
