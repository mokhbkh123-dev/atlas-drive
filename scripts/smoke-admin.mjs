/**
 * Smoke test for the admin auth flow (run against `npm run start`).
 *   node scripts/smoke-admin.mjs
 */
const BASE = "http://localhost:3000";

function fmt(res) {
  return `${res.status} ${res.url || ""} ${res.headers.get("location") || ""}`;
}

async function run() {
  const results = [];
  const ok = (name, pass, extra = "") =>
    results.push(`${pass ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);

  // 1. Locale redirect on /admin
  let res = await fetch(`${BASE}/admin`, { redirect: "manual" });
  ok("proxy /admin → locale redirect", res.status === 307 || res.status === 308, fmt(res));

  // 2. Unauthenticated /fr/admin → login
  res = await fetch(`${BASE}/fr/admin`, { redirect: "manual" });
  ok(
    "unauthenticated /fr/admin → login",
    res.status === 307 && (res.headers.get("location") || "").includes("/fr/admin/login"),
    fmt(res)
  );

  // 3. API without session → 401
  res = await fetch(`${BASE}/api/admin/cars`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    redirect: "manual",
  });
  ok("POST /api/admin/cars unauthenticated → 401", res.status === 401, String(res.status));

  // 4. Bad credentials → 401 INVALID_CREDENTIALS
  res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "nobody@example.com", password: "wrong" }),
  });
  const bad = await res.json().catch(() => ({}));
  ok("bad credentials → 401", res.status === 401 && bad.code === "INVALID_CREDENTIALS", String(res.status));

  // 5. Good credentials → session cookie
  res = await fetch(`${BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@atlasdrive.ma", password: "AtlasDrive#2026" }),
  });
  const good = await res.json().catch(() => ({}));
  const cookie = (res.headers.get("set-cookie") || "").split(";")[0];
  ok(
    "valid credentials → success + cookie",
    res.status === 200 && good.success === true && cookie.startsWith("ad_session="),
    `${res.status} cookie=${cookie.slice(0, 24)}...`
  );

  const authed = { headers: { cookie }, redirect: "manual" };

  // 6. Authenticated /fr/admin → 200
  res = await fetch(`${BASE}/fr/admin`, authed);
  const html = await res.text();
  ok("authenticated /fr/admin → 200", res.status === 200, String(res.status));
  ok("dashboard HTML contains admin shell", html.includes("ATLAS DRIVE"));

  // 7. /fr/admin/login while authenticated → redirect to /fr/admin
  res = await fetch(`${BASE}/fr/admin/login`, authed);
  ok(
    "authenticated /fr/admin/login → redirect /fr/admin",
    res.status === 307 && (res.headers.get("location") || "").endsWith("/fr/admin"),
    fmt(res)
  );

  // 8. Notifications API works with session
  res = await fetch(`${BASE}/api/admin/notifications?limit=5`, authed);
  const notif = await res.json().catch(() => ({}));
  ok(
    "GET /api/admin/notifications → 200 + shape",
    res.status === 200 && Array.isArray(notif.notifications) && typeof notif.unread === "number",
    String(res.status)
  );

  // 9. Search API with session
  res = await fetch(`${BASE}/api/admin/search?q=BMW`, authed);
  const search = await res.json().catch(() => ({}));
  ok("GET /api/admin/search → 200 + groups", res.status === 200 && Array.isArray(search.groups), String(res.status));

  // 10. Logout revokes session
  res = await fetch(`${BASE}/api/admin/auth/logout`, { method: "POST", headers: { cookie } });
  ok("logout → 200", res.status === 200, String(res.status));
  res = await fetch(`${BASE}/fr/admin`, authed);
  ok(
    "session revoked → redirect login",
    res.status === 307 && (res.headers.get("location") || "").includes("/login"),
    fmt(res)
  );

  // 11. Arabic RTL page renders
  res = await fetch(`${BASE}/ar/admin/login`);
  const arHtml = await res.text();
  ok("ar/admin/login renders RTL", res.status === 200 && arHtml.includes('dir="rtl"'), String(res.status));

  // 12. Public site intact
  res = await fetch(`${BASE}/fr`);
  ok("public /fr still 200", res.status === 200, String(res.status));

  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}

run().catch((e) => {
  console.error("smoke error:", e.message);
  process.exit(1);
});
