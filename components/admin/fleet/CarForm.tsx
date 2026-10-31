"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Select,
  Textarea,
  cn,
  useToast,
} from "@/components/admin/ui";
import { getDict, tEnum, type Locale } from "@/i18n";

import {
  CAR_CATEGORIES,
  CAR_FUELS,
  CAR_STATUSES,
  CAR_TRANSMISSIONS,
} from "./car-schema";
import { fleetError, isSafeImageUrl } from "./helpers";
import type {
  CarFormCar,
  CarFormImage,
  FleetLocationOption,
} from "./types";

type FormValues = {
  brand: string;
  model: string;
  name: string;
  year: string;
  category: string;
  transmission: string;
  fuelType: string;
  seats: string;
  doors: string;
  plateNumber: string;
  vin: string;
  internalCode: string;
  internalNotes: string;
  operationalStatus: string;
  airConditioning: boolean;
  mileage: string;
  dailyPrice: string;
  weeklyPrice: string;
  monthlyPrice: string;
  deposit: string;
  description: string;
  status: string;
  locationId: string;
};

function initialValues(car?: any): FormValues {
  return {
    brand: car?.brand ?? "",
    model: car?.model ?? "",
    name: car?.name ?? "",
    year: car?.year != null ? String(car.year) : "",
    category: car?.category ?? "",
    transmission: car?.transmission ?? "",
    fuelType: car?.fuelType ?? "",
    seats: car?.seats != null ? String(car.seats) : "",
    doors: car?.doors != null ? String(car.doors) : "",
    plateNumber: car?.plateNumber ?? "",
    vin: car?.vin ?? "",
    internalCode: car?.internalCode ?? "",
    internalNotes: car?.internalNotes ?? "",
    operationalStatus: car?.operationalStatus ?? "AVAILABLE",
    airConditioning: car?.airConditioning ?? false,
    mileage: car?.mileage != null ? String(car.mileage) : "",
    dailyPrice: car ? String(car.dailyPrice) : "",
    weeklyPrice: car?.weeklyPrice != null ? String(car.weeklyPrice) : "",
    monthlyPrice: car?.monthlyPrice != null ? String(car.monthlyPrice) : "",
    deposit: car ? String(car.deposit) : "",
    description: car?.description ?? "",
    status: car?.status ?? "DRAFT",
    locationId: car?.locationId ?? "",
  };
}

function TextField({
  id,
  label,
  error,
  className,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <Input id={id} className={className} {...props} />
    </Field>
  );
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <span className="flex h-full w-full items-center justify-center text-admin-muted">
        <ImageIcon className="h-5 w-5" aria-hidden />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function CarForm({
  lang,
  car,
}: {
  lang: Locale;
  car?: CarFormCar;
}) {
  const router = useRouter();
  const toast = useToast();
  const dict = getDict(lang);
  const t = dict.fleet.form;
  const v = t.validation;
  const isEdit = Boolean(car);

  const [values, setValues] = useState<FormValues>(() => initialValues(car));
  const [features, setFeatures] = useState<string[]>(() => car?.features ?? []);
  const [images, setImages] = useState<CarFormImage[]>(() =>
    (car?.images ?? []).map((image) => ({
      url: image.url,
      alt: image.alt ?? "",
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [locations, setLocations] = useState<FleetLocationOption[] | null>(
    null
  );
  const [locationsFailed, setLocationsFailed] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadLocations() {
      try {
        const response = await fetch("/api/admin/locations");
        if (!response.ok) throw new Error("request failed");
        const data = (await response.json()) as {
          locations?: FleetLocationOption[];
        };
        if (active) setLocations(data.locations ?? []);
      } catch {
        if (active) {
          setLocations([]);
          setLocationsFailed(true);
        }
      }
    }
    void loadLocations();
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function updateImage(index: number, patch: Partial<CarFormImage>) {
    setImages((previous) =>
      previous.map((image, i) => (i === index ? { ...image, ...patch } : image))
    );
    setImageErrors((previous) => {
      if (!previous[index]) return previous;
      const next = { ...previous };
      delete next[index];
      return next;
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((previous) => {
      const target = index + direction;
      if (target < 0 || target >= previous.length) return previous;
      const next = [...previous];
      const current = next[index];
      next[index] = next[target];
      next[target] = current;
      return next;
    });
    setImageErrors({});
  }

  function removeImage(index: number) {
    setImages((previous) => previous.filter((_, i) => i !== index));
    setImageErrors({});
  }

  function updateFeature(index: number, value: string) {
    setFeatures((previous) =>
      previous.map((feature, i) => (i === index ? value : feature))
    );
  }

  function cancel() {
    router.push(car ? `/${lang}/admin/cars/${car.id}` : `/${lang}/admin/cars`);
  }

  function validate(): {
    valid: boolean;
    cleanedImages: CarFormImage[];
  } {
    const next: Record<string, string> = {};

    if (!values.brand.trim()) next.brand = v.required;
    if (!values.model.trim()) next.model = v.required;
    if (!values.name.trim()) next.name = v.required;
    if (!values.category) next.category = v.required;
    if (!values.transmission) next.transmission = v.required;
    if (!values.fuelType) next.fuelType = v.required;

    const year = values.year.trim();
    if (year) {
      const parsed = Number(year);
      if (!Number.isInteger(parsed) || parsed < 1950 || parsed > 2100) {
        next.year = v.year;
      }
    }

    const integerAtLeastOne = (key: "seats" | "doors") => {
      const value = values[key].trim();
      if (!value) {
        next[key] = v.required;
        return;
      }
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1) {
        next[key] = v.positiveInteger;
      }
    };
    integerAtLeastOne("seats");
    integerAtLeastOne("doors");

    const nonNegative = (
      key: "dailyPrice" | "weeklyPrice" | "monthlyPrice" | "deposit",
      required = false
    ) => {
      const value = values[key].trim();
      if (!value) {
        if (required) next[key] = v.required;
        return;
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0) {
        next[key] = v.nonNegative;
      }
    };
    nonNegative("dailyPrice", true);
    nonNegative("weeklyPrice");
    nonNegative("monthlyPrice");
    nonNegative("deposit");

    const mileage = values.mileage.trim();
    if (mileage) {
      const parsed = Number(mileage);
      if (!Number.isInteger(parsed) || parsed < 0) {
        next.mileage = v.integer;
      }
    }

    const nextImageErrors: Record<number, string> = {};
    const cleanedImages: CarFormImage[] = [];
    images.forEach((image, index) => {
      const url = image.url.trim();
      const alt = image.alt.trim();
      if (!url) {
        if (alt) nextImageErrors[index] = v.imageUrlRequired;
        return;
      }
      if (!isSafeImageUrl(url)) {
        nextImageErrors[index] = v.url;
        return;
      }
      cleanedImages.push({ url, alt });
    });

    setErrors(next);
    setImageErrors(nextImageErrors);

    return {
      valid:
        Object.keys(next).length === 0 &&
        Object.keys(nextImageErrors).length === 0,
      cleanedImages,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const { valid, cleanedImages } = validate();
    if (!valid) {
      setFormError(v.generic);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        brand: values.brand.trim(),
        model: values.model.trim(),
        name: values.name.trim(),
        year: values.year.trim() ? Number(values.year) : null,
        category: values.category,
        transmission: values.transmission,
        fuelType: values.fuelType,
        seats: Number(values.seats),
        doors: Number(values.doors),
        plateNumber: values.plateNumber.trim() || null,
        vin: values.vin.trim() || null,
        airConditioning: values.airConditioning,
        mileage: values.mileage.trim() ? Number(values.mileage) : null,
        dailyPrice: Number(values.dailyPrice),
        weeklyPrice: values.weeklyPrice.trim()
          ? Number(values.weeklyPrice)
          : null,
        monthlyPrice: values.monthlyPrice.trim()
          ? Number(values.monthlyPrice)
          : null,
        deposit: values.deposit.trim() ? Number(values.deposit) : 0,
        description: values.description.trim() || null,
        features: features.map((feature) => feature.trim()).filter(Boolean),
        locationId: values.locationId || null,
        status: values.status,
        images: cleanedImages.map((image) => ({
          url: image.url,
          alt: image.alt || null,
        })),
      };

      const response = await fetch(
        car ? `/api/admin/cars/${car.id}` : "/api/admin/cars",
        {
          method: car ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        const message = fleetError(dict, data.code, data.error);
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success(isEdit ? t.success.updated : t.success.created);
      router.push(`/${lang}/admin/cars`);
      router.refresh();
    } catch {
      const message = fleetError(dict, "SERVER_ERROR");
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const statusOptions = CAR_STATUSES.filter(
    (value) => value !== "ARCHIVED" || car?.status === "ARCHIVED"
  );

  const locationMissing =
    car?.locationId &&
    car.locationName &&
    !(locations ?? []).some((location) => location.id === car.locationId);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#b91c1c]"
        >
          {formError}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.sections.identity}</CardTitle>
            <p className="mt-1 text-xs text-admin-muted">
              {t.sections.identityHint}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            id="car-brand"
            label={`${t.fields.brand} *`}
            error={errors.brand}
            value={values.brand}
            onChange={(event) => update("brand", event.target.value)}
            placeholder={t.placeholders.brand}
            maxLength={120}
            autoComplete="off"
          />
          <TextField
            id="car-model"
            label={`${t.fields.model} *`}
            error={errors.model}
            value={values.model}
            onChange={(event) => update("model", event.target.value)}
            placeholder={t.placeholders.model}
            maxLength={120}
            autoComplete="off"
          />
          <TextField
            id="car-name"
            label={`${t.fields.name} *`}
            error={errors.name}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder={t.placeholders.name}
            maxLength={200}
            autoComplete="off"
          />
          <TextField
            id="car-year"
            label={t.fields.year}
            error={errors.year}
            type="number"
            min={1950}
            max={2100}
            step={1}
            value={values.year}
            onChange={(event) => update("year", event.target.value)}
            placeholder="2024"
            inputMode="numeric"
          />
          <Field
            label={`${t.fields.category} *`}
            htmlFor="car-category"
            error={errors.category}
          >
            <Select
              id="car-category"
              value={values.category}
              onChange={(event) => update("category", event.target.value)}
            >
              <option value="">{t.placeholders.select}</option>
              {CAR_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {tEnum(dict, "category", value)}
                </option>
              ))}
            </Select>
          </Field>
          <TextField
            id="car-plate"
            label={t.fields.plateNumber}
            value={values.plateNumber}
            onChange={(event) => update("plateNumber", event.target.value)}
            placeholder={t.placeholders.plateNumber}
            maxLength={32}
            autoComplete="off"
          />
          <TextField
            id="car-vin"
            label={t.fields.vin}
            value={values.vin}
            onChange={(event) => update("vin", event.target.value)}
            placeholder={t.placeholders.vin}
            maxLength={64}
            autoComplete="off"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.sections.specs}</CardTitle>
            <p className="mt-1 text-xs text-admin-muted">
              {t.sections.specsHint}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label={`${t.fields.transmission} *`}
            htmlFor="car-transmission"
            error={errors.transmission}
          >
            <Select
              id="car-transmission"
              value={values.transmission}
              onChange={(event) => update("transmission", event.target.value)}
            >
              <option value="">{t.placeholders.select}</option>
              {CAR_TRANSMISSIONS.map((value) => (
                <option key={value} value={value}>
                  {tEnum(dict, "transmission", value)}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label={`${t.fields.fuelType} *`}
            htmlFor="car-fuel"
            error={errors.fuelType}
          >
            <Select
              id="car-fuel"
              value={values.fuelType}
              onChange={(event) => update("fuelType", event.target.value)}
            >
              <option value="">{t.placeholders.select}</option>
              {CAR_FUELS.map((value) => (
                <option key={value} value={value}>
                  {tEnum(dict, "fuel", value)}
                </option>
              ))}
            </Select>
          </Field>
          <TextField
            id="car-seats"
            label={`${t.fields.seats} *`}
            error={errors.seats}
            type="number"
            min={1}
            step={1}
            value={values.seats}
            onChange={(event) => update("seats", event.target.value)}
            placeholder="5"
            inputMode="numeric"
          />
          <TextField
            id="car-doors"
            label={`${t.fields.doors} *`}
            error={errors.doors}
            type="number"
            min={1}
            step={1}
            value={values.doors}
            onChange={(event) => update("doors", event.target.value)}
            placeholder="5"
            inputMode="numeric"
          />
          <TextField
            id="car-mileage"
            label={t.fields.mileage}
            error={errors.mileage}
            type="number"
            min={0}
            step={1}
            value={values.mileage}
            onChange={(event) => update("mileage", event.target.value)}
            placeholder="0"
            inputMode="numeric"
          />
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-admin-ink">
              {t.fields.airConditioning}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={values.airConditioning}
                aria-label={t.fields.airConditioning}
                onClick={() =>
                  update("airConditioning", !values.airConditioning)
                }
                className={cn(
                  "inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy/30",
                  values.airConditioning ? "bg-admin-navy" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 rounded-full bg-admin-surface shadow transition-all",
                    values.airConditioning ? "ms-auto" : "me-auto"
                  )}
                />
              </button>
              <span className="text-sm text-admin-muted">
                {values.airConditioning
                  ? t.airConditioningOn
                  : t.airConditioningOff}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.sections.pricing}</CardTitle>
            <p className="mt-1 text-xs text-admin-muted">
              {t.sections.pricingHint}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            id="car-daily-price"
            label={`${t.fields.dailyPrice} *`}
            error={errors.dailyPrice}
            type="number"
            min={0}
            step="0.01"
            value={values.dailyPrice}
            onChange={(event) => update("dailyPrice", event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
          <TextField
            id="car-weekly-price"
            label={t.fields.weeklyPrice}
            error={errors.weeklyPrice}
            type="number"
            min={0}
            step="0.01"
            value={values.weeklyPrice}
            onChange={(event) => update("weeklyPrice", event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
          <TextField
            id="car-monthly-price"
            label={t.fields.monthlyPrice}
            error={errors.monthlyPrice}
            type="number"
            min={0}
            step="0.01"
            value={values.monthlyPrice}
            onChange={(event) => update("monthlyPrice", event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
          <TextField
            id="car-deposit"
            label={t.fields.deposit}
            error={errors.deposit}
            type="number"
            min={0}
            step="0.01"
            value={values.deposit}
            onChange={(event) => update("deposit", event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.sections.features}</CardTitle>
            <p className="mt-1 text-xs text-admin-muted">
              {t.sections.featuresHint}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.length === 0 ? (
            <p className="text-sm text-admin-muted">{t.noFeatures}</p>
          ) : null}
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={feature}
                onChange={(event) =>
                  updateFeature(index, event.target.value)
                }
                placeholder={t.placeholders.feature}
                aria-label={`${t.fields.features} ${index + 1}`}
                maxLength={100}
              />
              <Button
                variant="ghost"
                size="sm"
                aria-label={t.removeFeature}
                title={t.removeFeature}
                onClick={() =>
                  setFeatures((previous) =>
                    previous.filter((_, i) => i !== index)
                  )
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFeatures((previous) => [...previous, ""])}
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t.addFeature}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.sections.description}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="car-description"
            rows={5}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder={t.placeholders.description}
            maxLength={5000}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.sections.location}</CardTitle>
            <p className="mt-1 text-xs text-admin-muted">
              {t.sections.locationHint}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Field
            label={t.fields.location}
            htmlFor="car-location"
            className="max-w-md"
          >
            <Select
              id="car-location"
              value={values.locationId}
              disabled={locations === null}
              onChange={(event) => update("locationId", event.target.value)}
            >
              {locations === null ? (
                <option value="">{t.locationLoading}</option>
              ) : null}
              <option value="">{t.noLocation}</option>
              {locationMissing && car?.locationId && car.locationName ? (
                <option value={car.locationId}>{car.locationName}</option>
              ) : null}
              {(locations ?? []).map((location) => (
                <option key={location.id} value={location.id}>
                  {location.city
                    ? `${location.name} — ${location.city}`
                    : location.name}
                </option>
              ))}
            </Select>
          </Field>
          {locationsFailed ? (
            <p className="mt-2 text-xs text-amber-700">{t.locationError}</p>
          ) : locations !== null && locations.length === 0 ? (
            <p className="mt-2 text-xs text-admin-muted">{t.locationEmpty}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.sections.media}</CardTitle>
            <p className="mt-1 text-xs text-admin-muted">
              {t.sections.mediaHint}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {images.length === 0 ? (
            <p className="text-sm text-admin-muted">{t.noImages}</p>
          ) : null}

          {images.map((image, index) => (
            <div
              key={index}
              className="rounded-lg border border-admin-line bg-slate-50/40 p-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-admin-line bg-slate-100">
                  <ImagePreview
                    src={image.url.trim()}
                    alt={image.alt || dict.fleet.detail.gallery.alt}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Field
                    label={t.fields.imageUrl}
                    htmlFor={`car-image-url-${index}`}
                    error={imageErrors[index]}
                  >
                    <Input
                      id={`car-image-url-${index}`}
                      value={image.url}
                      onChange={(event) =>
                        updateImage(index, { url: event.target.value })
                      }
                      placeholder={t.placeholders.imageUrl}
                      maxLength={2000}
                      autoComplete="off"
                    />
                  </Field>
                  <Field
                    label={t.fields.imageAlt}
                    htmlFor={`car-image-alt-${index}`}
                  >
                    <Input
                      id={`car-image-alt-${index}`}
                      value={image.alt}
                      onChange={(event) =>
                        updateImage(index, { alt: event.target.value })
                      }
                      placeholder={t.placeholders.imageAlt}
                      maxLength={250}
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-1 sm:flex-col sm:items-end">
                  {index === 0 ? (
                    <Badge tone="navy">{t.primaryImage}</Badge>
                  ) : null}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t.moveUp}
                      title={t.moveUp}
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t.moveDown}
                      title={t.moveDown}
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t.removeImage}
                      title={t.removeImage}
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setImages((previous) => [...previous, { url: "", alt: "" }])
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t.addImage}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.sections.status}</CardTitle>
            <p className="mt-1 text-xs text-admin-muted">
              {t.sections.statusHint}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Field
            label={t.fields.status}
            htmlFor="car-status"
            className="max-w-md"
          >
            <Select
              id="car-status"
              value={values.status}
              onChange={(event) => update("status", event.target.value)}
            >
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {tEnum(dict, "carStatus", value)}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="secondary" onClick={cancel} disabled={saving}>
          {t.cancel}
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? t.saving : isEdit ? t.save : t.create}
        </Button>
      </div>
    </form>
  );
}
