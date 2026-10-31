"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";

import Dropdown, { DropdownItem } from "@/components/admin/ui/dropdown";
import { getDict, languageNames, locales, type Locale } from "@/i18n";

/** Remember the choice for future visits (read by proxy.ts). */
function persistLocale(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
}

/** Admin topbar language switcher — preserves the current page (spec §20). */
export default function AdminLanguageSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const dict = getDict(lang);

  // Current path without the /xx locale prefix.
  const pathWithoutLocale = pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, "") || "/";

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
              href={`/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`}
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
