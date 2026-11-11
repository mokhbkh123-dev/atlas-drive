import { redirect } from "next/navigation";
import { Car } from "lucide-react";

import LoginForm from "@/components/admin/LoginForm";
import AdminLanguageSwitcher from "@/components/admin/LanguageSwitcher";
import { getSession } from "@/lib/auth";
import { getDict, resolveLocale } from "@/i18n";

export const dynamic = "force-dynamic";

/**
 * Standalone login screen — sits outside the (panel) route group so it never
 * renders the admin shell (and never loops through its auth redirect).
 */
export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  // Already authenticated? Straight to the dashboard.
  const user = await getSession();
  if (user) redirect(`/${lang}/admin`);

  const { next } = await searchParams;
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <div className="font-inter relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-4">
      {/* Luxury car backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(10%) contrast(110%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/95"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(201,169,97,0.18),transparent)]"
      />

      <div className="absolute end-4 top-4">
        <AdminLanguageSwitcher lang={lang} />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-admin-gold to-[#b8943a] shadow-lg shadow-admin-gold/30">
            <Car className="h-7 w-7 text-black" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-[0.25em] uppercase text-white">
            {dict.adminLayout.brand}
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.4em] text-admin-gold/80">
            {dict.adminLayout.panelBadge}
          </p>
        </div>

        <div className="rounded-2xl border border-admin-line bg-admin-surface-elevated/95 p-6 shadow-[0_40px_120px_-60px_rgba(201,169,97,0.5)] backdrop-blur">
          <h2 className="mb-1 text-lg font-semibold text-admin-ink">
            {dict.auth.title}
          </h2>
          <p className="mb-5 text-sm text-admin-muted">{dict.auth.subtitle}</p>
          <LoginForm lang={lang} next={safeNext} />
        </div>
      </div>
    </div>
  );
}
