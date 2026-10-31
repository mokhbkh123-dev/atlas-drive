import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, hasLocale, locales } from "./i18n/config";

const SESSION_COOKIE = "ad_session";

/** Pick the best supported locale from the Accept-Language header. */
function negotiateLocale(request: NextRequest): string {
  // Preference persisted by the language switcher.
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && hasLocale(cookieLocale)) return cookieLocale;

  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const preferences = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const quality = qParam ? parseFloat(qParam.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality: isNaN(quality) ? 0 : quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of preferences) {
    const base = tag.split("-")[0];
    const match = locales.find((locale) => locale === base);
    if (match) return match;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  const locale = pathnameHasLocale
    ? pathname.slice(1).split("/")[0]
    : negotiateLocale(request);
  const basePath = pathnameHasLocale
    ? pathname
    : pathname === "/"
      ? `/${locale}`
      : `/${locale}${pathname}`;

  // Admin gate: cookie presence check only — layouts and API routes perform
  // the authoritative session lookup against the database.
  if (basePath === `/${locale}/admin` || basePath.startsWith(`/${locale}/admin/`)) {
    const sub = basePath.slice(`/${locale}/admin`.length) || "/";
    const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    if (!hasSessionCookie && !sub.startsWith("/login")) {
      request.nextUrl.pathname = `/${locale}/admin/login`;
      request.nextUrl.search = `?next=${encodeURIComponent(basePath)}`;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  if (pathnameHasLocale) return;

  request.nextUrl.pathname = basePath;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
