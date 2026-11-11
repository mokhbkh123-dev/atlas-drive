"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ImageOff, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { getDict, type Locale } from "@/i18n";
import { calculateRentalDuration } from "@/lib/booking-pricing";

type Car = {
  id: string;
  name: string | null;
  brand: string;
  model: string;
  images?: { url: string; isPrimary: boolean }[];
};

export default function BookingForm({
  cars,
  selectedCarId,
  lang,
  whatsappNumber,
  initialPickupAt = "",
  initialReturnAt = "",
  initialPickupLocation = "",
}: {
  cars: Car[];
  selectedCarId?: string;
  lang: Locale;
  whatsappNumber: string | null;
  initialPickupAt?: string;
  initialReturnAt?: string;
  initialPickupLocation?: string;
}) {
  const dict = getDict(lang);
  const [formData, setFormData] = useState({
    carId: selectedCarId || "",
    firstName: "",
    lastName: "",
    customerPhone: "",
    pickupAt: initialPickupAt,
    returnAt: initialReturnAt,
    pickupLocation: initialPickupLocation,
    returnLocation: "",
    customerNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCar = cars.find((c) => c.id === formData.carId);

  // Duration only: the total is priced on the server, never shown here.
  const rental = calculateRentalDuration(formData.pickupAt, formData.returnAt);
  const days = rental.days;

  const handleWhatsAppBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!formData.carId) {
      setError(dict.booking?.errors?.selectCar || "Please select a car");
      setLoading(false);
      return;
    }
    if (!formData.firstName.trim()) {
      setError(dict.booking?.errors?.firstName || "First name is required");
      setLoading(false);
      return;
    }
    if (!formData.lastName.trim()) {
      setError(dict.booking?.errors?.lastName || "Last name is required");
      setLoading(false);
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError(dict.booking?.errors?.phone || "Phone number is required");
      setLoading(false);
      return;
    }
    if (!formData.pickupAt) {
      setError(dict.booking?.errors?.pickupDate || "Pickup date is required");
      setLoading(false);
      return;
    }
    if (!formData.returnAt) {
      setError(dict.booking?.errors?.returnDate || "Return date is required");
      setLoading(false);
      return;
    }
    if (!formData.pickupLocation.trim()) {
      setError(dict.booking?.errors?.pickupLocation || "Pickup location is required");
      setLoading(false);
      return;
    }

    const pickup = new Date(formData.pickupAt);
    const ret = new Date(formData.returnAt);
    if (ret <= pickup) {
      setError(dict.booking?.errors?.invalidDates || "Return date must be after pickup date");
      setLoading(false);
      return;
    }

    if (!rental.meetsMinimum) {
      setError(dict.booking.errors.minDuration);
      setLoading(false);
      return;
    }

    if (!selectedCar) {
      setError(dict.booking?.errors?.selectCar || "Please select a car");
      setLoading(false);
      return;
    }

    // The owner WhatsApp number must be configured server-side.
    // Never invent a fallback number: block the request instead.
    if (!whatsappNumber) {
      setError(dict.booking.whatsappMissing);
      setLoading(false);
      return;
    }

    // Save booking request to DB first if possible
    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: formData.carId,
          customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          customerPhone: formData.customerPhone.trim(),
          customerEmail: null,
          pickupAt: formData.pickupAt,
          returnAt: formData.returnAt,
          pickupLocation: formData.pickupLocation.trim(),
          returnLocation: formData.returnLocation.trim() || formData.pickupLocation.trim(),
          customerNotes: formData.customerNotes.trim() || null,
        }),
      });
    } catch (err) {
      // Continue to WhatsApp even if saving fails
      console.error("Failed to save booking request:", err);
    }

    const carName = selectedCar.name || `${selectedCar.brand} ${selectedCar.model}`;

    let message = "";
    if (lang === "ar") {
      message = `طلب حجز جديد – ATLAS DRIVE\n\nمعلومات العميل:\n- الاسم الأول: ${formData.firstName.trim()}\n- اسم العائلة: ${formData.lastName.trim()}\n- رقم الهاتف: ${formData.customerPhone.trim()}\n\nتفاصيل السيارة:\n- السيارة: ${carName}\n\nتفاصيل الحجز:\n- تاريخ الاستلام: ${formData.pickupAt}\n- تاريخ العودة: ${formData.returnAt}\n- مكان الاستلام: ${formData.pickupLocation.trim()}\n- مكان العودة: ${formData.returnLocation.trim() || formData.pickupLocation.trim()}\n- مدة الإيجار: ${days} يوم\n\nملاحظات إضافية:\n${formData.customerNotes.trim() || "لا يوجد"}\n\nيرجى التواصل مع العميل لتأكيد التوفر والسعر وإنهاء الحجز.`;
    } else if (lang === "en") {
      message = `NEW CAR BOOKING REQUEST – ATLAS DRIVE\n\nCustomer Information:\n- First Name: ${formData.firstName.trim()}\n- Last Name: ${formData.lastName.trim()}\n- Phone Number: ${formData.customerPhone.trim()}\n\nCar Details:\n- Car: ${carName}\n\nBooking Details:\n- Pickup Date: ${formData.pickupAt}\n- Return Date: ${formData.returnAt}\n- Pickup Location: ${formData.pickupLocation.trim()}\n- Return Location: ${formData.returnLocation.trim() || formData.pickupLocation.trim()}\n- Rental Duration: ${days} day(s)\n\nAdditional Notes:\n${formData.customerNotes.trim() || "None"}\n\nPlease contact the customer to confirm availability and the final rate, then finalize the reservation.`;
    } else {
      message = `NOUVELLE DEMANDE DE RÉSERVATION – ATLAS DRIVE\n\nInformations Client:\n- Prénom: ${formData.firstName.trim()}\n- Nom: ${formData.lastName.trim()}\n- Téléphone: ${formData.customerPhone.trim()}\n\nDétails du Véhicule:\n- Véhicule: ${carName}\n\nDétails de Réservation:\n- Date de prise en charge: ${formData.pickupAt}\n- Date de retour: ${formData.returnAt}\n- Lieu de prise en charge: ${formData.pickupLocation.trim()}\n- Lieu de retour: ${formData.returnLocation.trim() || formData.pickupLocation.trim()}\n- Durée de location: ${days} jour(s)\n\nNotes supplémentaires:\n${formData.customerNotes.trim() || "Aucune"}\n\nMerci de contacter le client pour confirmer la disponibilité et le tarif final, puis finaliser la réservation.`;
    }

    const encodedMessage = encodeURIComponent(message);
    const normalizedNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${normalizedNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    setLoading(false);
  };

  const carImage = selectedCar?.images?.find((img) => img.isPrimary) || selectedCar?.images?.[0];
  const carLabel = selectedCar?.name || (selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : "");

  return (
    <form
      onSubmit={handleWhatsAppBooking}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start"
    >
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 lg:col-span-2"
        >
          {error}
        </div>
      )}

      <div className="card-site space-y-8 p-5 sm:p-7 lg:p-8">
        {/* Vehicle */}
        <section aria-labelledby="booking-vehicle">
          <div className="flex items-center justify-between gap-3">
            <h2 id="booking-vehicle" className="eyebrow">
              {dict.booking.labels.car}
            </h2>
            <Link
              href={`/${lang}/cars`}
              className="inline-flex min-h-8 items-center text-[10px] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:text-bronze-dark"
            >
              {dict.home.fleetSeeAll}
            </Link>
          </div>

          {selectedCar ? (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-bronze/30 bg-bronze-soft p-3">
              {carImage ? (
                <img
                  src={carImage.url}
                  alt={carLabel}
                  className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-cream-2">
                  <ShieldCheck className="h-5 w-5 text-bronze" aria-hidden />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{carLabel}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <label htmlFor="carId" className="sr-only">
                {dict.booking.labels.car}
              </label>
              <select
                id="carId"
                required
                value={formData.carId}
                onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                className="field"
              >
                <option value="">{dict.booking.carPlaceholder}</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name || `${car.brand} ${car.model}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        <div className="rule-gold" aria-hidden />

        {/* Personal details */}
        <section aria-labelledby="booking-contact" className="space-y-5">
          <h2 id="booking-contact" className="eyebrow">
            {dict.booking.firstName} · {dict.booking.lastName}
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="field-label mb-2">
                {dict.booking.firstName || "First Name"} <span className="text-bronze">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                required
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="field-label mb-2">
                {dict.booking.lastName || "Last Name"} <span className="text-bronze">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                required
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="customerPhone" className="field-label mb-2">
              {dict.booking.labels.phone} <span className="text-bronze">*</span>
            </label>
            <input
              type="tel"
              id="customerPhone"
              required
              autoComplete="tel"
              inputMode="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="field"
            />
          </div>
        </section>

        <div className="rule-gold" aria-hidden />

        {/* Dates & locations */}
        <section aria-labelledby="booking-rental" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="booking-rental" className="eyebrow">
              {dict.booking.labels.pickupAt} · {dict.booking.labels.returnAt}
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-bronze" aria-hidden />
              {dict.booking.minDurationHint}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pickupAt" className="field-label mb-2">
                {dict.booking.labels.pickupAt} <span className="text-bronze">*</span>
              </label>
              <input
                type="date"
                id="pickupAt"
                required
                value={formData.pickupAt}
                onChange={(e) => {
                  setFormData({ ...formData, pickupAt: e.target.value });
                  if (error) setError("");
                }}
                className="field [color-scheme:light]"
              />
            </div>
            <div>
              <label htmlFor="returnAt" className="field-label mb-2">
                {dict.booking.labels.returnAt} <span className="text-bronze">*</span>
              </label>
              <input
                type="date"
                id="returnAt"
                required
                value={formData.returnAt}
                onChange={(e) => {
                  setFormData({ ...formData, returnAt: e.target.value });
                  if (error) setError("");
                }}
                className="field [color-scheme:light]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pickupLocation" className="field-label mb-2">
                <MapPin className="h-3.5 w-3.5 text-bronze" aria-hidden />
                {dict.booking.labels.pickupLocation} <span className="text-bronze">*</span>
              </label>
              <input
                type="text"
                id="pickupLocation"
                required
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="returnLocation" className="field-label mb-2">
                {dict.booking.labels.returnLocation}{" "}
                <span className="normal-case tracking-normal text-muted/70">
                  ({lang === "ar" ? "اختياري" : lang === "en" ? "optional" : "facultatif"})
                </span>
              </label>
              <input
                type="text"
                id="returnLocation"
                value={formData.returnLocation}
                onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
                className="field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="customerNotes" className="field-label mb-2">
              {dict.booking.labels.notes}
            </label>
            <textarea
              id="customerNotes"
              rows={3}
              value={formData.customerNotes}
              onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
              className="field resize-y"
            />
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        {selectedCar && (
          <div className="card-site overflow-hidden">
            <div className="relative aspect-[16/9] bg-cream-2">
              {carImage ? (
                <img
                  src={carImage.url}
                  alt={carLabel}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageOff className="h-8 w-8 text-line-strong" aria-hidden />
                </div>
              )}
            </div>
            <div className="border-t border-line px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bronze">
                {dict.booking.labels.car}
              </p>
              <p className="mt-1 truncate text-base font-semibold text-ink">{carLabel}</p>
            </div>
          </div>
        )}

        <div className="card-site p-5">
          <h3 className="eyebrow">{dict.booking.summary.heading}</h3>

          {formData.pickupAt && formData.returnAt ? (
            <div className="mt-4 space-y-2.5 text-sm">
              <p className="font-medium text-ink">
                {dict.booking.summary.days.replace("{days}", String(days))}
              </p>
              <p className="border-t border-line pt-3 text-xs leading-5 text-muted">
                {dict.booking.summary.priceOnRequest}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">{dict.booking.minDurationHint}</p>
          )}

          {formData.pickupAt && formData.returnAt && (
            <>
              {!rental.validRange ? (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800">
                  {dict.booking.errors.invalidDates}
                </p>
              ) : !rental.meetsMinimum ? (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800">
                  {dict.booking.errors.minDuration}
                </p>
              ) : null}
            </>
          )}

          <p className="mt-4 border-t border-line pt-3 text-[11px] leading-5 text-muted">
            {dict.booking.whatsappNote}
          </p>

          {!whatsappNumber && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
              {dict.booking.whatsappMissing}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !whatsappNumber}
            className="btn-primary mt-5 w-full !text-[11px] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {loading
              ? dict.booking.submitting
              : dict.booking.whatsappButton || "Confirm Booking via WhatsApp"}
            {!loading && <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />}
          </button>
        </div>
      </aside>
    </form>
  );
}
