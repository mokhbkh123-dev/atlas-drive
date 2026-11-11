import { notFound } from "next/navigation";

import {
  defaultLocale,
  dirOf,
  hasLocale,
  intlLocaleOf,
  languageNames,
  locales,
  type Locale,
} from "./config";

import { apiErrors } from "./sections/apiErrors";
import { common } from "./sections/common";
import { enums } from "./sections/enums";
import { footer } from "./sections/footer";
import { meta } from "./sections/meta";
import { navbar } from "./sections/navbar";
import { home } from "./sections/home";
import { destinations } from "./sections/destinations";
import { gallery } from "./sections/gallery";
import { services } from "./sections/services";
import { about } from "./sections/about";
import { contact } from "./sections/contact";
import { cars } from "./sections/cars";
import { search } from "./sections/search";
import { booking } from "./sections/booking";
import { faq } from "./sections/faq";
import { terms } from "./sections/terms";
import { privacy } from "./sections/privacy";
import { admin } from "./sections/admin";
import { auth } from "./sections/auth";
import { adminLayout } from "./sections/adminLayout";
import { dashboard } from "./sections/dashboard";
import { fleet } from "./sections/fleet";
import { reservations } from "./sections/reservations";
import { customers } from "./sections/customers";
import { calendar } from "./sections/calendar";
import { availability } from "./sections/availability";
import { payments } from "./sections/payments";
import { invoices } from "./sections/invoices";
import { expenses } from "./sections/expenses";
import { maintenance } from "./sections/maintenance";
import { locations } from "./sections/locations";
import { reports } from "./sections/reports";
import { promotions } from "./sections/promotions";
import { reviews } from "./sections/reviews";
import { staff } from "./sections/staff";
import { notifications } from "./sections/notifications";
import { content } from "./sections/content";
import { activityLogs } from "./sections/activityLogs";
import { settings } from "./sections/settings";

export {
  defaultLocale,
  dirOf,
  hasLocale,
  intlLocaleOf,
  languageNames,
  locales,
};
export type { Locale };

const sections = {
  apiErrors,
  common,
  enums,
  footer,
  meta,
  navbar,
  home,
  destinations,
  gallery,
  services,
  about,
  contact,
  cars,
  search,
  booking,
  faq,
  terms,
  privacy,
  admin,
  auth,
  adminLayout,
  dashboard,
  fleet,
  reservations,
  customers,
  calendar,
  availability,
  payments,
  invoices,
  expenses,
  maintenance,
  locations,
  reports,
  promotions,
  reviews,
  staff,
  notifications,
  content,
  activityLogs,
  settings,
};

export type Dictionary = {
  [K in keyof typeof sections]: (typeof sections)[K]["fr"];
};

function build(locale: Locale): Dictionary {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(sections) as (keyof typeof sections)[]) {
    out[key] = sections[key][locale];
  }
  return out as Dictionary;
}

const dictionaries: Record<Locale, Dictionary> = {
  fr: build("fr"),
  en: build("en"),
  ar: build("ar"),
};

/** Synchronous dictionary lookup — safe in Server *and* Client components. */
export function getDict(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Resolve and validate the `[lang]` route param of a page.
 * Throws the not-found boundary for unsupported locales.
 */
export async function resolveLocale(
  params: Promise<{ lang: string }>
): Promise<Locale> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return lang;
}

/**
 * `Car.category`, `Car.transmission` and `Car.fuelType` are free-text columns,
 * so the admin has accumulated several spellings of the same concept
 * (`MANUAL` vs `Manuelle`, `DIESEL` vs `Diesel`). Every key here is the
 * lowercased, accent-stripped form of a raw value; the target is the canonical
 * key used by the `enums` dictionaries.
 */
const ENUM_ALIASES: Partial<Record<keyof Dictionary["enums"], Record<string, string>>> = {
  category: {
    sport: "Sport",
    suv: "SUV",
    "4x4": "SUV",
    berline: "Berline",
    sedan: "Berline",
    supercar: "Supercar",
    utility: "Utility",
    utilitaire: "Utility",
    van: "Utility",
  },
  transmission: {
    automatique: "Automatique",
    auto: "Automatique",
    manuelle: "Manuelle",
    manual: "Manuelle",
    manuel: "Manuelle",
  },
  fuel: {
    essence: "Essence",
    petrol: "Essence",
    gasoline: "Essence",
    diesel: "Diesel",
    hybride: "Hybride",
    hybrid: "Hybride",
    electrique: "Électrique",
  },
};

function enumLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Map a raw database value onto its canonical enum key; unknown values pass through. */
export function canonicalEnum(
  group: keyof Dictionary["enums"],
  value: string
): string {
  return ENUM_ALIASES[group]?.[enumLookupKey(value)] ?? value;
}

/**
 * Translate a database value (category, transmission, fuel, statuses).
 * Unknown values fall through unchanged.
 */
export function tEnum(
  dict: Dictionary,
  group: keyof Dictionary["enums"],
  value: string
): string {
  const map = dict.enums[group] as Record<string, string | undefined>;
  return map[canonicalEnum(group, value)] ?? value;
}

// Pickup cities travel in the URL as a destination slug so the value survives a
// language change; every locale's own spelling is registered as an alias so
// links written before that still resolve.
const CITY_ALIASES = new Map<string, string>();
for (const section of Object.values(destinations)) {
  for (const item of section.items) {
    CITY_ALIASES.set(enumLookupKey(item.slug), item.slug);
    CITY_ALIASES.set(enumLookupKey(item.name), item.slug);
  }
}

/** Localized spelling of a `?city=` value; unknown places pass through. */
export function cityName(dict: Dictionary, value: string): string {
  const slug = CITY_ALIASES.get(enumLookupKey(value));
  if (!slug) return value;
  return dict.destinations.items.find((item) => item.slug === slug)?.name ?? value;
}

/** Canonical `?city=` value, so links written with a translated name still match the select. */
export function citySlug(value: string): string {
  return CITY_ALIASES.get(enumLookupKey(value)) ?? value;
}

/**
 * `?city=` from a link. A served destination becomes its canonical slug so the
 * select and the localized label resolve; any other place is kept as plain text
 * because the agency picks up outside the destinations pages too. Markup and
 * control characters are stripped, so a hand-written value cannot render as
 * chrome or as an endless string.
 */
export function cityParam(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  if (!cleaned) return undefined;
  return CITY_ALIASES.get(enumLookupKey(cleaned)) ?? cleaned;
}
