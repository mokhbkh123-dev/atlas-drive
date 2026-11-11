"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Languages } from "lucide-react";

import Dropdown, { DropdownItem } from "@/components/admin/ui/dropdown";
import { getDict, languageNames, locales, type Locale } from "@/i18n";

/** Remember the choice for future visits (read by proxy.ts). */
function persistLocale(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
}

/** Admin topbar language switcher — preserves the current page and filters (spec §20). */
export default function AdminLanguageSwitcher({ lang }: { lang: Locale }) {
  return (
    <Suspense fallback={<AdminSwitcher lang={lang} query="" />}>
      <QueryAwareAdminSwitcher lang={lang} />
    </Suspense>
  );
}

function QueryAwareAdminSwitcher({ lang }: { lang: Locale }) {
  const searchParams = useSearchParams();
  const serialized = searchParams?.toString() ?? "";
  return <AdminSwitcher lang={lang} query={serialized ? `?${serialized}` : ""} />;
}

function AdminSwitcher({ lang, query }: { lang: Locale; query: string }) {
  const pathname = usePathname();
  const dict = getDict(lang);

  // Current path without the /xx locale prefix.
  const pathWithoutLocale = pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, "") || "/";
  const base = pathWithoutLocale === "/" ? "" : pathWithoutLocale;

  return (
    <Dropdown
      label={dict.common.switchLanguage}
      trigger={({ onClick, "aria-expanded": expanded }) => (
        <button
          type="button"
          onClick={onClick}
          aria-expanded={expanded}
          aria-label={dict.common.switchLanguage}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-ink"
        >
          <Languages className="h-4.5 w-4.5" aria-hidden />
        </button>
      )}
    >
      {(close) => (
        <>
          {locales.map((locale) => (
            <DropdownItem
              key={locale}
              href={`/${locale}${base}${query}`}
              onClick={() => {
                persistLocale(locale);
                close();
              }}
              className={locale === lang ? "bg-admin-bg font-semibold" : undefined}
            >
              {languageNames[locale]}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  );
}
