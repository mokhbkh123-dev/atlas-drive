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
import { gallery } from "./sections/gallery";
import { services } from "./sections/services";
import { about } from "./sections/about";
import { contact } from "./sections/contact";
import { cars } from "./sections/cars";
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
  gallery,
  services,
  about,
  contact,
  cars,
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
 * Translate a database value (category, transmission, fuel, statuses).
 * Unknown values fall through unchanged.
 */
export function tEnum(
  dict: Dictionary,
  group: keyof Dictionary["enums"],
  value: string
): string {
  const map = dict.enums[group] as Record<string, string | undefined>;
  return map[value] ?? value;
}
