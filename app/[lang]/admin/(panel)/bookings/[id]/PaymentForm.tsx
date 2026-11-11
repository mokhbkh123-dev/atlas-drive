"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDict, tEnum, type Locale } from "@/i18n";
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input, Select } from "@/components/admin/ui";

const METHODS = ["CASH", "BANK_TRANSFER", "CARD", "CHECK", "OTHER"];

export default function PaymentForm({
  lang,
  bookingId,
  remaining,
}: {
  lang: Locale;
  bookingId: string;
  remaining: number;
}) {
  const dict = getDict(lang);
  const t = dict.admin.bookingPayments;
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [paidAt, setPaidAt] = useState(today);
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method, paidAt, reference }),
      });
      if (res.ok) {
        setAmount("");
        setReference("");
        setSaved(true);
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(
          data?.code
            ? dict.apiErrors[data.code as keyof typeof dict.apiErrors] ?? data.error
            : data?.error || dict.apiErrors.GENERIC_ERROR
        );
      }
    } catch (err) {
      console.error(err);
      setError(dict.apiErrors.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const invalid = !(Number(amount) > 0) || Number(amount) > remaining + 0.001;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.add}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.amountLabel} htmlFor="payment-amount">
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0"
              max={remaining}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>

          <Field label={t.methodLabel} htmlFor="payment-method">
            <Select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {METHODS.map((value) => (
                <option key={value} value={value}>
                  {tEnum(dict, "paymentMethod", value)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.dateLabel} htmlFor="payment-date">
            <Input
              id="payment-date"
              type="date"
              max={today}
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
            />
          </Field>

          <Field label={t.referenceLabel} htmlFor="payment-reference">
            <Input
              id="payment-reference"
              type="text"
              maxLength={60}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </Field>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-admin-danger/30 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger"
          >
            {error}
          </p>
        ) : null}
        {saved && !error ? (
          <p role="status" className="rounded-lg border border-admin-success/30 bg-admin-success/10 px-4 py-3 text-sm text-admin-success">
            {t.saved}
          </p>
        ) : null}

        <Button onClick={submit} disabled={saving || invalid}>
          {saving ? t.saving : t.save}
        </Button>
      </CardContent>
    </Card>
  );
}
