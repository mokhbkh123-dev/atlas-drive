"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Textarea,
  useToast,
} from "@/components/admin/ui";
import { getDict, type Locale } from "@/i18n";

type FormState = {
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  notes: string;
};

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  licenseNumber: "",
  notes: "",
};

export default function CustomerForm({ lang }: { lang: Locale }) {
  const router = useRouter();
  const { toast } = useToast();
  const dict = getDict(lang);
  const t = dict.customers as Record<string, unknown>;
  const label = (key: string, fallback: string) =>
    typeof t[key] === "string" ? (t[key] as string) : fallback;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Le nom est obligatoire";
    if (!form.phone.trim()) next.phone = "Le téléphone est obligatoire";
    else if (form.phone.replace(/\D/g, "").length < 6) next.phone = "Numéro invalide";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Adresse email invalide";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur");
      }
      toast("Client enregistré avec succès");
      router.push(`/${lang}/admin/customers`);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Informations du client</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field htmlFor="customer-name" label={label("name", "Nom complet")} error={errors.name}>
            <Input
              id="customer-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ex. Youssef Bennani"
              autoComplete="name"
              required
            />
          </Field>

          <Field
            htmlFor="customer-phone"
            label={label("phone", "Téléphone")}
            error={errors.phone}
            hint="Numéro utilisé pour identifier le client"
          >
            <Input
              id="customer-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+212 6 12 34 56 78"
              autoComplete="tel"
              inputMode="tel"
              required
            />
          </Field>

          <Field htmlFor="customer-email" label={label("email", "Adresse email")} error={errors.email}>
            <Input
              id="customer-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="client@example.com"
              autoComplete="email"
            />
          </Field>

          <Field
            htmlFor="customer-license"
            label={label("licenseNumber", "Numéro de permis")}
            hint="Facultatif"
          >
            <Input
              id="customer-license"
              value={form.licenseNumber}
              onChange={(e) => update("licenseNumber", e.target.value)}
              placeholder="Permis de conduire"
            />
          </Field>

          <Field
            htmlFor="customer-notes"
            label={label("notes", "Notes")}
            className="md:col-span-2"
            hint="Informations internes (facultatif)"
          >
            <Textarea
              id="customer-notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Préférences, remarques, historique…"
            />
          </Field>

          <div className="flex justify-end gap-2 md:col-span-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !form.name.trim() || !form.phone.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
