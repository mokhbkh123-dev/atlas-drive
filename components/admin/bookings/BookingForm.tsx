"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input, Select, Textarea, Label } from "@/components/admin/ui/input";
import type { Locale } from "@/i18n";

type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  plateNumber: string | null;
  dailyPrice: any;
  status: string;
};

type Props = {
  lang: Locale;
  cars: Car[];
};

const labels: Record<Locale, any> = {
  fr: {
    title: "Nouvelle réservation directe (Agence)",
    subtitle: "Enregistrer une location directement à l'agence",
    vehicle: "Véhicule (physique)",
    selectVehicle: "Sélectionner un véhicule",
    plate: "Immatriculation",
    customer: "Informations client",
    customerName: "Nom et prénom *",
    customerPhone: "Téléphone *",
    customerEmail: "Email",
    rental: "Détails de location",
    pickupAt: "Date/heure de prise en charge *",
    returnAt: "Date/heure de retour prévue *",
    pickupLocation: "Lieu de prise en charge *",
    returnLocation: "Lieu de retour *",
    pricing: "Tarification & paiement",
    dailyPrice: "Prix journalier (MAD)",
    discount: "Remise (MAD)",
    deposit: "Caution (MAD)",
    extrasTotal: "Extras (MAD)",
    paymentAmount: "Montant encaissé",
    paymentMethod: "Mode de paiement",
    paymentReference: "Référence paiement",
    source: "Source",
    status: "Statut",
    notes: "Notes",
    customerNotes: "Notes client",
    internalNotes: "Notes internes",
    cancel: "Annuler",
    save: "Enregistrer la location",
    saving: "Enregistrement...",
    required: "Champs obligatoires",
  },
  en: {
    title: "New direct rental (Agency)",
    subtitle: "Register a rental directly at the agency",
    vehicle: "Vehicle (physical)",
    selectVehicle: "Select a vehicle",
    plate: "Registration plate",
    customer: "Customer information",
    customerName: "Full name *",
    customerPhone: "Phone *",
    customerEmail: "Email",
    rental: "Rental details",
    pickupAt: "Pickup date/time *",
    returnAt: "Return date/time *",
    pickupLocation: "Pickup location *",
    returnLocation: "Return location *",
    pricing: "Pricing & payment",
    dailyPrice: "Daily price (MAD)",
    discount: "Discount (MAD)",
    deposit: "Deposit (MAD)",
    extrasTotal: "Extras (MAD)",
    paymentAmount: "Amount received",
    paymentMethod: "Payment method",
    paymentReference: "Payment reference",
    source: "Source",
    status: "Status",
    notes: "Notes",
    customerNotes: "Customer notes",
    internalNotes: "Internal notes",
    cancel: "Cancel",
    save: "Save rental",
    saving: "Saving...",
    required: "Required fields",
  },
  ar: {
    title: "إيجار مباشر (الوكالة)",
    subtitle: "تسجيل إيجار مباشرة في الوكالة",
    vehicle: "المركبة (فعلي)",
    selectVehicle: "اختر مركبة",
    plate: "رقم اللوحة",
    customer: "معلومات العميل",
    customerName: "الاسم الكامل *",
    customerPhone: "الهاتف *",
    customerEmail: "البريد الإلكتروني",
    rental: "تفاصيل الإيجار",
    pickupAt: "تاريخ/وقت الاستلام *",
    returnAt: "تاريخ/وقت الإرجاع المتوقع *",
    pickupLocation: "مكان الاستلام *",
    returnLocation: "مكان الإرجاع *",
    pricing: "التسعير والدفع",
    dailyPrice: "السعر اليومي (درهم)",
    discount: "خصم (درهم)",
    deposit: "التأمين (درهم)",
    extrasTotal: "إضافات (درهم)",
    paymentAmount: "المبلغ المستلم",
    paymentMethod: "طريقة الدفع",
    paymentReference: "مرجع الدفع",
    source: "المصدر",
    status: "الحالة",
    notes: "ملاحظات",
    customerNotes: "ملاحظات العميل",
    internalNotes: "ملاحظات داخلية",
    cancel: "إلغاء",
    save: "حفظ الإيجار",
    saving: "جارٍ الحفظ...",
    required: "حقول إلزامية",
  },
};

export default function BookingForm({ lang, cars }: Props) {
  const router = useRouter();
  const t = labels[lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    carId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    pickupAt: "",
    returnAt: "",
    pickupLocation: "Agence ATLAS DRIVE",
    returnLocation: "Agence ATLAS DRIVE",
    dailyPrice: "",
    discount: "0",
    deposit: "0",
    extrasTotal: "0",
    paymentAmount: "",
    paymentMethod: "CASH",
    paymentReference: "",
    source: "WALK_IN",
    status: "CONFIRMED",
    customerNotes: "",
    internalNotes: "",
  });

  const selectedCar = cars.find((c) => c.id === form.carId);
  const isRtl = lang === "ar";

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "carId") {
      const car = cars.find((c) => c.id === value);
      if (car && car.dailyPrice) {
        setForm((prev) => ({ ...prev, carId: value, dailyPrice: String(car.dailyPrice) }));
      }
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
        setLoading(false);
        return;
      }
      router.push(`/${lang}/admin/bookings`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">{t.vehicle}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>{t.selectVehicle} *</Label>
            <Select value={form.carId} onChange={(e) => update("carId", e.target.value)} required>
              <option value="">{t.selectVehicle}</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.brand} {car.model} - {car.name}
                </option>
              ))}
            </Select>
          </div>
          {selectedCar && selectedCar.plateNumber && (
            <div>
              <Label>{t.plate}</Label>
              <Input value={selectedCar.plateNumber} disabled />
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">{t.customer}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t.customerName}</Label>
            <Input value={form.customerName} onChange={(e) => update("customerName", e.target.value)} required />
          </div>
          <div>
            <Label>{t.customerPhone}</Label>
            <Input value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <Label>{t.customerEmail}</Label>
            <Input type="email" value={form.customerEmail} onChange={(e) => update("customerEmail", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">{t.rental}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t.pickupAt}</Label>
            <Input type="datetime-local" value={form.pickupAt} onChange={(e) => update("pickupAt", e.target.value)} required />
          </div>
          <div>
            <Label>{t.returnAt}</Label>
            <Input type="datetime-local" value={form.returnAt} onChange={(e) => update("returnAt", e.target.value)} required />
          </div>
          <div>
            <Label>{t.pickupLocation}</Label>
            <Input value={form.pickupLocation} onChange={(e) => update("pickupLocation", e.target.value)} required />
          </div>
          <div>
            <Label>{t.returnLocation}</Label>
            <Input value={form.returnLocation} onChange={(e) => update("returnLocation", e.target.value)} required />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">{t.pricing}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>{t.dailyPrice}</Label>
            <Input type="number" step="0.01" value={form.dailyPrice} onChange={(e) => update("dailyPrice", e.target.value)} />
          </div>
          <div>
            <Label>{t.discount}</Label>
            <Input type="number" step="0.01" value={form.discount} onChange={(e) => update("discount", e.target.value)} />
          </div>
          <div>
            <Label>{t.deposit}</Label>
            <Input type="number" step="0.01" value={form.deposit} onChange={(e) => update("deposit", e.target.value)} />
          </div>
          <div>
            <Label>{t.extrasTotal}</Label>
            <Input type="number" step="0.01" value={form.extrasTotal} onChange={(e) => update("extrasTotal", e.target.value)} />
          </div>
          <div>
            <Label>{t.paymentAmount}</Label>
            <Input type="number" step="0.01" value={form.paymentAmount} onChange={(e) => update("paymentAmount", e.target.value)} />
          </div>
          <div>
            <Label>{t.paymentMethod}</Label>
            <Select value={form.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)}>
              <option value="CASH">CASH</option>
              <option value="BANK_TRANSFER">BANK_TRANSFER</option>
              <option value="CARD">CARD</option>
              <option value="CHECK">CHECK</option>
              <option value="OTHER">OTHER</option>
            </Select>
          </div>
          <div>
            <Label>{t.paymentReference}</Label>
            <Input value={form.paymentReference} onChange={(e) => update("paymentReference", e.target.value)} />
          </div>
          <div>
            <Label>{t.source}</Label>
            <Select value={form.source} onChange={(e) => update("source", e.target.value)}>
              <option value="WALK_IN">WALK_IN</option>
              <option value="PHONE">PHONE</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
          </div>
          <div>
            <Label>{t.status}</Label>
            <Select value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PENDING">PENDING</option>
              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">{t.notes}</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>{t.customerNotes}</Label>
            <Textarea value={form.customerNotes} onChange={(e) => update("customerNotes", e.target.value)} />
          </div>
          <div>
            <Label>{t.internalNotes}</Label>
            <Textarea value={form.internalNotes} onChange={(e) => update("internalNotes", e.target.value)} />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>{loading ? t.saving : t.save}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>{t.cancel}</Button>
      </div>
    </form>
  );
}
