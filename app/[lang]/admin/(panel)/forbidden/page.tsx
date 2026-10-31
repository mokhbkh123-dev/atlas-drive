import Link from "next/link";
import { ShieldOff } from "lucide-react";

import { requireUser } from "@/lib/rbac";
import { getDict, resolveLocale } from "@/i18n";

/** Rendered when a signed-in user's role lacks access to a module (spec §15). */
export default async function ForbiddenPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  await requireUser(lang); // authenticated users only (layout also enforces)
  const dict = getDict(lang);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#b91c1c]">
          <ShieldOff className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-admin-ink">
          {dict.auth.forbidden.title}
        </h1>
        <p className="mt-2 text-sm text-admin-muted">
          {dict.auth.forbidden.description}
        </p>
        <Link
          href={`/${lang}/admin`}
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-admin-navy px-4 text-sm font-medium text-white transition-colors hover:bg-admin-navy-2"
        >
          {dict.auth.forbidden.back}
        </Link>
      </div>
    </div>
  );
}
