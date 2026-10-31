"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input, Select, useToast } from "@/components/admin/ui";
import { getDict, tEnum, type Locale } from "@/i18n";

const ROLES = ["AGENT", "MANAGER", "FLEET_MANAGER", "FINANCE", "SUPER_ADMIN"];

export default function StaffForm({ lang }: { lang: Locale }) {
  const router = useRouter();
  const { toast } = useToast();
  const dict = getDict(lang);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "AGENT",
    isActive: true,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error");
      }
      toast("Utilisateur créé avec succès");
      router.push(`/${lang}/admin/staff`);
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field htmlFor="staff-name" label="Nom complet">
            <Input
              id="staff-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </Field>
          <Field htmlFor="staff-email" label="Adresse email">
            <Input
              id="staff-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </Field>
          <Field htmlFor="staff-password" label="Mot de passe">
            <Input
              id="staff-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
          </Field>
          <Field htmlFor="staff-role" label="Rôle">
            <Select
              id="staff-role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              {ROLES.map((v) => (
                <option key={v} value={v}>
                  {tEnum(dict, "role", v)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              id="staff-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-[#35404d] bg-[#0d141e] text-[#e5b94f] focus:ring-[#e5b94f]/20"
            />
            <label htmlFor="staff-active" className="text-sm text-[#f4f5f7]">
              Compte actif
            </label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !form.name || !form.email || !form.password}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
