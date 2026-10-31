"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input, Select, Textarea, useToast } from "@/components/admin/ui";
import { getDict, tEnum, type Locale } from "@/i18n";

type CarOption = {
  id: string;
  name: string;
  brand: string;
  model: string;
  plateNumber: string | null;
};

const TYPES = ["OIL", "TIRE", "INSPECTION", "REPAIR", "INSURANCE", "REGISTRATION", "OTHER"];
const STATUSES = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function carLabel(c: CarOption) {
  const base = c.name || `${c.brand} ${c.model}`;
  const extra = c.plateNumber || c.id.slice(0, 8);
  return `${base} · ${extra}`;
}

export default function MaintenanceForm({ lang, cars }: { lang: Locale; cars: CarOption[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const dict = getDict(lang);
  const t = dict.maintenance;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    carId: cars[0]?.id ?? "",
    type: "OIL",
    status: "SCHEDULED",
    startAt: "",
    endAt: "",
    nextServiceAt: "",
    mileage: "",
    cost: "",
    provider: "",
    description: "",
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mileage: form.mileage ? Number(form.mileage) : null,
          cost: form.cost ? form.cost : "0",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error");
      }
      toast(t.toast.created);
      router.push(`/${lang}/admin/maintenance`);
      router.refresh();
    } catch (err: any) {
      toast(err.message || t.toast.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t.form.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field htmlFor="maintenance-car" label={t.fields.vehicle}>
            <Select id="maintenance-car" value={form.carId} onChange={(e) => setForm((f) => ({ ...f, carId: e.target.value }))}>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {carLabel(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field htmlFor="maintenance-type" label={t.fields.type}>
            <Select id="maintenance-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {TYPES.map((v) => (
                <option key={v} value={v}>
                  {tEnum(dict, "maintenanceType", v)}
                </option>
              ))}
            </Select>
          </Field>
          <Field htmlFor="maintenance-status" label={t.fields.status}>
            <Select id="maintenance-status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {STATUSES.map((v) => (
                <option key={v} value={v}>
                  {tEnum(dict, "maintenanceStatus", v)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
            <Field htmlFor="maintenance-start" label={t.fields.startAt}>
              <Input id="maintenance-start" type="date" value={form.startAt} onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))} required />
            </Field>
            <Field htmlFor="maintenance-end" label={t.fields.endAt}>
              <Input id="maintenance-end" type="date" value={form.endAt} onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))} required />
            </Field>
          </div>
          <Field htmlFor="maintenance-next" label={t.fields.nextServiceAt}>
            <Input id="maintenance-next" type="date" value={form.nextServiceAt} onChange={(e) => setForm((f) => ({ ...f, nextServiceAt: e.target.value }))} />
          </Field>
          <Field htmlFor="maintenance-mileage" label={t.fields.mileage}>
            <Input id="maintenance-mileage" type="number" value={form.mileage} onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))} />
          </Field>
          <Field htmlFor="maintenance-cost" label={t.fields.cost}>
            <Input id="maintenance-cost" type="number" step="0.01" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
          </Field>
          <Field htmlFor="maintenance-provider" label={t.fields.provider}>
            <Input id="maintenance-provider" value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))} />
          </Field>
          <div className="md:col-span-2">
            <Field htmlFor="maintenance-desc" label={t.fields.description}>
              <Textarea id="maintenance-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field htmlFor="maintenance-notes" label={t.fields.notes}>
              <Textarea id="maintenance-notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={loading || !form.carId || !form.startAt || !form.endAt}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t.save}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
