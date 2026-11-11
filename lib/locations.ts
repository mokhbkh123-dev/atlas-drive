/**
 * Shared validation for the agency/location records the owner enters in the
 * admin panel. Both the create route and the update route go through this so a
 * hand-crafted request cannot store a city the public filter would then echo.
 */

export type LocationInput = {
  name?: string;
  city?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
  isPrimary?: boolean;
};

/** A create payload always ends up with every column filled in. */
export type LocationDraft = Required<LocationInput>;

export type LocationErrorCode =
  | "NAME_REQUIRED"
  | "CITY_REQUIRED"
  | "FIELD_TOO_LONG"
  | "INVALID_EMAIL"
  | "INVALID_PHONE";

export type LocationValidation =
  | { ok: true; data: LocationInput }
  | { ok: false; code: LocationErrorCode };

const PHONE_PATTERN = /^[+0-9 ()/.-]{6,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Control characters and angle brackets would be echoed back into the chrome. */
function cleanText(value: unknown): string {
  return typeof value === "string"
    ? // eslint-disable-next-line no-control-regex
      value.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim()
    : "";
}

/** Cities are free text, so `Casablanca`, `casablanca` and `CASABLANA` are one place. */
export function cityKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export type CityFacet = { key: string; label: string; ids: string[] };

/** Group the active agencies by city, keeping the owner's own spelling as label. */
export function cityFacets(
  locations: { id: string; city: string | null }[]
): CityFacet[] {
  const facets = new Map<string, CityFacet>();
  for (const location of locations) {
    const city = cleanText(location.city);
    if (!city) continue;
    const key = cityKey(city);
    const facet = facets.get(key) ?? { key, label: city, ids: [] };
    facet.ids.push(location.id);
    facets.set(key, facet);
  }
  return [...facets.values()].sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

/**
 * Options for the search bar. Real agencies drive the list as soon as the owner
 * records them; until then the destination pages are offered so the field still
 * feeds the booking request, and the fleet page says it cannot filter by place.
 */
export function citySelectOptions(
  facets: CityFacet[],
  destinations: { slug: string; name: string }[]
): { value: string; label: string }[] {
  if (facets.length > 0) {
    return facets.map((facet) => ({ value: facet.label, label: facet.label }));
  }
  return destinations.map((item) => ({ value: item.slug, label: item.name }));
}

function readField(body: Record<string, unknown>, key: string, partial: boolean) {
  if (partial && !(key in body)) return undefined;
  return cleanText(body[key]);
}

/**
 * `partial: true` is the PATCH path: a key the form did not send is left out of
 * the returned data, so an update cannot silently wipe the other fields.
 */
export function validateLocation(
  body: Record<string, unknown>,
  options: { partial: false }
): { ok: true; data: LocationDraft } | { ok: false; code: LocationErrorCode };
export function validateLocation(
  body: Record<string, unknown>,
  options: { partial: true }
): LocationValidation;
export function validateLocation(
  body: Record<string, unknown>,
  options: { partial: boolean }
): LocationValidation | { ok: true; data: LocationDraft } {
  const { partial } = options;
  const data: LocationInput = {};

  const name = readField(body, "name", partial);
  if (name !== undefined) {
    if (!name) return { ok: false, code: "NAME_REQUIRED" };
    if (name.length > 80) return { ok: false, code: "FIELD_TOO_LONG" };
    data.name = name;
  }

  const city = readField(body, "city", partial);
  if (city !== undefined) {
    if (!city) return { ok: false, code: "CITY_REQUIRED" };
    if (city.length > 60) return { ok: false, code: "FIELD_TOO_LONG" };
    data.city = city;
  }

  const address = readField(body, "address", partial);
  if (address !== undefined) {
    if (address.length > 200) return { ok: false, code: "FIELD_TOO_LONG" };
    data.address = address || null;
  }

  const phone = readField(body, "phone", partial);
  if (phone !== undefined) {
    if (phone && !PHONE_PATTERN.test(phone)) return { ok: false, code: "INVALID_PHONE" };
    data.phone = phone || null;
  }

  const email = readField(body, "email", partial);
  if (email !== undefined) {
    if (email && !EMAIL_PATTERN.test(email)) return { ok: false, code: "INVALID_EMAIL" };
    data.email = email || null;
  }

  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.isPrimary === "boolean") data.isPrimary = body.isPrimary;

  if (partial) return { ok: true, data };

  return {
    ok: true,
    data: {
      name: data.name!,
      city: data.city!,
      address: data.address ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      isActive: data.isActive ?? true,
      isPrimary: data.isPrimary ?? false,
    },
  };
}
