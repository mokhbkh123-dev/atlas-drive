/**
 * Server-side validation for vehicle create/update payloads.
 * Shared by the fleet API routes so clients can never bypass the rules.
 */

export const CAR_CATEGORIES = ["Sport", "SUV", "Berline", "Supercar"] as const;
export const CAR_TRANSMISSIONS = ["Automatique", "Manuelle"] as const;
export const CAR_FUELS = ["Essence", "Diesel", "Hybride", "Électrique"] as const;
export const CAR_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type CarCategory = (typeof CAR_CATEGORIES)[number];
export type CarTransmission = (typeof CAR_TRANSMISSIONS)[number];
export type CarFuel = (typeof CAR_FUELS)[number];
export type CarStatusValue = (typeof CAR_STATUSES)[number];

export type CarImagePayload = {
  url: string;
  alt: string | null;
};

export type CarPayload = {
  brand: string;
  model: string;
  name: string;
  year: number | null;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  dailyPrice: number;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  deposit: number;
  description: string | null;
  plateNumber: string | null;
  vin: string | null;
  airConditioning: boolean;
  mileage: number | null;
  features: string[];
  locationId: string | null;
  status: CarStatusValue;
  images: CarImagePayload[];
};

export type CarParseResult =
  | { ok: true; value: CarPayload }
  | { ok: false; message: string };

const IMAGE_URL_PATTERN = /^(https?:\/\/[^\s]+|\/[^\s]*)$/i;

function fail(message: string): CarParseResult {
  return { ok: false, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  values: readonly T[],
  value: string
): value is T {
  return (values as readonly string[]).includes(value);
}

export function parseCarPayload(input: unknown): CarParseResult {
  if (!isRecord(input)) {
    return fail("Corps de requête invalide");
  }

  const text = (key: string): string =>
    typeof input[key] === "string" ? (input[key] as string).trim() : "";

  const numberFrom = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }
    return Number.NaN;
  };

  const brand = text("brand");
  const model = text("model");
  const name = text("name");
  if (!brand || !model || !name) {
    return fail("Marque, modèle et nom sont obligatoires");
  }

  const category = text("category");
  if (!isOneOf(CAR_CATEGORIES, category)) {
    return fail("Catégorie invalide");
  }

  const transmission = text("transmission");
  if (!isOneOf(CAR_TRANSMISSIONS, transmission)) {
    return fail("Transmission invalide");
  }

  const fuelType = text("fuelType");
  if (!isOneOf(CAR_FUELS, fuelType)) {
    return fail("Carburant invalide");
  }

  const seats = numberFrom(input.seats);
  if (!Number.isInteger(seats) || seats < 1) {
    return fail("Le nombre de places doit être au moins 1");
  }

  const doors = numberFrom(input.doors);
  if (!Number.isInteger(doors) || doors < 1) {
    return fail("Le nombre de portes doit être au moins 1");
  }

  let year: number | null = null;
  if (
    input.year !== undefined &&
    input.year !== null &&
    input.year !== ""
  ) {
    year = numberFrom(input.year);
    if (!Number.isInteger(year) || year < 1950 || year > 2100) {
      return fail("L'année doit être comprise entre 1950 et 2100");
    }
  }

  const dailyPrice = numberFrom(input.dailyPrice);
  if (!Number.isFinite(dailyPrice) || dailyPrice < 0) {
    return fail("Le prix journalier doit être un montant positif ou nul");
  }

  const optionalPrice = (
    key: string,
    label: string
  ): number | null | CarParseResult => {
    const raw = input[key];
    if (raw === undefined || raw === null || raw === "") return null;
    const value = numberFrom(raw);
    if (!Number.isFinite(value) || value < 0) {
      return fail(`${label} doit être un montant positif ou nul`);
    }
    return value;
  };

  const weeklyPrice = optionalPrice("weeklyPrice", "Le prix hebdomadaire");
  if (weeklyPrice !== null && typeof weeklyPrice === "object") return weeklyPrice;

  const monthlyPrice = optionalPrice("monthlyPrice", "Le prix mensuel");
  if (monthlyPrice !== null && typeof monthlyPrice === "object") return monthlyPrice;

  let deposit = 0;
  if (input.deposit !== undefined && input.deposit !== null && input.deposit !== "") {
    deposit = numberFrom(input.deposit);
    if (!Number.isFinite(deposit) || deposit < 0) {
      return fail("La caution doit être un montant positif ou nul");
    }
  }

  let mileage: number | null = null;
  if (
    input.mileage !== undefined &&
    input.mileage !== null &&
    input.mileage !== ""
  ) {
    mileage = numberFrom(input.mileage);
    if (!Number.isInteger(mileage) || mileage < 0) {
      return fail("Le kilométrage doit être un entier positif ou nul");
    }
  }

  if (
    input.airConditioning !== undefined &&
    input.airConditioning !== null &&
    typeof input.airConditioning !== "boolean"
  ) {
    return fail("Valeur de climatisation invalide");
  }
  const airConditioning = input.airConditioning === true;

  const statusRaw = text("status") || "DRAFT";
  if (!isOneOf(CAR_STATUSES, statusRaw)) {
    return fail("Statut invalide");
  }

  let features: string[] = [];
  if (input.features !== undefined && input.features !== null) {
    if (!Array.isArray(input.features)) {
      return fail("La liste des équipements est invalide");
    }
    const seen = new Set<string>();
    for (const item of input.features) {
      if (typeof item !== "string") continue;
      const label = item.trim();
      if (!label || seen.has(label)) continue;
      if (label.length > 100) {
        return fail("Un équipement ne peut pas dépasser 100 caractères");
      }
      seen.add(label);
    }
    features = Array.from(seen);
    if (features.length > 50) {
      return fail("Trop d'équipements (50 maximum)");
    }
  }

  const images: CarImagePayload[] = [];
  if (input.images !== undefined && input.images !== null) {
    if (!Array.isArray(input.images)) {
      return fail("La liste des images est invalide");
    }
    for (const raw of input.images) {
      if (!isRecord(raw)) {
        return fail("Image invalide");
      }
      const url = typeof raw.url === "string" ? raw.url.trim() : "";
      const alt =
        typeof raw.alt === "string" && raw.alt.trim()
          ? raw.alt.trim()
          : null;
      if (!url) return fail("L'URL de l'image est requise");
      if (url.length > 2000 || !IMAGE_URL_PATTERN.test(url)) {
        return fail("URL d'image invalide");
      }
      if (alt && alt.length > 250) {
        return fail("Le texte alternatif est trop long");
      }
      images.push({ url, alt });
    }
    if (images.length > 20) {
      return fail("Trop d'images (20 maximum)");
    }
  }

  const description = text("description");
  if (description.length > 5000) {
    return fail("La description est trop longue");
  }

  const plateNumber = text("plateNumber");
  if (plateNumber.length > 32) {
    return fail("L'immatriculation est trop longue");
  }

  const vin = text("vin");
  if (vin.length > 64) {
    return fail("Le numéro VIN est trop long");
  }

  const locationId = text("locationId");

  return {
    ok: true,
    value: {
      brand,
      model,
      name,
      year,
      category,
      transmission,
      fuelType,
      seats,
      doors,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      deposit,
      description: description || null,
      plateNumber: plateNumber || null,
      vin: vin || null,
      airConditioning,
      mileage,
      features,
      locationId: locationId || null,
      status: statusRaw,
      images,
    },
  };
}

/** Extract Prisma's error code without importing the runtime namespace. */
export function prismaErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return null;
}
