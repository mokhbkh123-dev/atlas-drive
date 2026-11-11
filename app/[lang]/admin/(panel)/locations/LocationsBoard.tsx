"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Star, Trash2, X } from "lucide-react";

import { getDict, type Locale } from "@/i18n";
import ConfirmDialog from "@/components/admin/ui/confirm-dialog";

export type LocationRow = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  isPrimary: boolean;
  carCount: number;
};

type Draft = Omit<LocationRow, "id" | "carCount">;

const EMPTY_DRAFT: Draft = {
  name: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  isActive: true,
  isPrimary: false,
};

const inputClass =
  "w-full rounded border border-[#202c3a] bg-[#0a1017] px-3 py-2 text-sm text-[#f4f5f7] outline-none focus:border-[#e5b94f]";

export default function LocationsBoard({
  lang,
  rows,
}: {
  lang: Locale;
  rows: LocationRow[];
}) {
  const t = getDict(lang).locations;
  const router = useRouter();

  // "new" is a created-but-not-yet-saved row; any other value is an existing id.
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState<LocationRow | null>(null);

  const openNew = () => {
    setEditing("new");
    setDraft({ ...EMPTY_DRAFT, isPrimary: rows.length === 0 });
    setError("");
    setNotice("");
  };

  const openEdit = (row: LocationRow) => {
    setEditing(row.id);
    setDraft({
      name: row.name,
      city: row.city,
      address: row.address,
      phone: row.phone,
      email: row.email,
      isActive: row.isActive,
      isPrimary: row.isPrimary,
    });
    setError("");
    setNotice("");
  };

  const setField = (key: keyof Draft, value: string | boolean) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const create = editing === "new";
      const response = await fetch(
        create ? "/api/admin/locations" : `/api/admin/locations/${editing}`,
        {
          method: create ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          (data?.code && t.errors[data.code as keyof typeof t.errors]) ||
            data?.error ||
            t.errors.NOT_FOUND
        );
        return;
      }
      setNotice(create ? t.messages.created : t.messages.saved);
      setEditing(null);
      setDraft(EMPTY_DRAFT);
      router.refresh();
    } catch {
      setError(t.errors.NOT_FOUND);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirming) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/locations/${confirming.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNotice(t.messages.removed);
        setConfirming(null);
        router.refresh();
      } else {
        setConfirming(null);
        const data = await response.json().catch(() => null);
        setError(
          (data?.code && t.errors[data.code as keyof typeof t.errors]) ||
            t.errors.NOT_FOUND
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#8190a1]">
          {t.columns.agency} · {rows.length}
        </p>
        {editing === null && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-lg bg-[#e5b94f] px-3 py-2 text-sm font-medium text-black hover:bg-[#f6d57a]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t.add}
          </button>
        )}
      </div>

      {notice && (
        <p className="rounded border border-[#27d99a]/40 bg-[#27d99a]/10 px-3 py-2 text-xs text-[#27d99a]">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded border border-[#fa655e]/40 bg-[#fa655e]/10 px-3 py-2 text-xs text-[#fa655e]">
          {error}
        </p>
      )}

      {editing !== null && (
        <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="loc-name" className="mb-1.5 block text-xs text-[#b5c0cd]">
                {t.fields.name}
              </label>
              <input
                id="loc-name"
                className={inputClass}
                value={draft.name}
                maxLength={80}
                onChange={(event) => setField("name", event.target.value)}
              />
              <p className="mt-1 text-[11px] text-[#8190a1]">{t.hints.name}</p>
            </div>
            <div>
              <label htmlFor="loc-city" className="mb-1.5 block text-xs text-[#b5c0cd]">
                {t.fields.city}
              </label>
              <input
                id="loc-city"
                className={inputClass}
                value={draft.city}
                maxLength={60}
                onChange={(event) => setField("city", event.target.value)}
              />
              <p className="mt-1 text-[11px] text-[#8190a1]">{t.hints.city}</p>
            </div>
            <div>
              <label htmlFor="loc-address" className="mb-1.5 block text-xs text-[#b5c0cd]">
                {t.fields.address}
              </label>
              <input
                id="loc-address"
                className={inputClass}
                value={draft.address}
                maxLength={200}
                onChange={(event) => setField("address", event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="loc-phone" className="mb-1.5 block text-xs text-[#b5c0cd]">
                  {t.fields.phone}
                </label>
                <input
                  id="loc-phone"
                  className={inputClass}
                  value={draft.phone}
                  maxLength={30}
                  onChange={(event) => setField("phone", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="loc-email" className="mb-1.5 block text-xs text-[#b5c0cd]">
                  {t.fields.email}
                </label>
                <input
                  id="loc-email"
                  type="email"
                  className={inputClass}
                  value={draft.email}
                  maxLength={120}
                  onChange={(event) => setField("email", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5">
            <label className="flex items-start gap-2 text-xs text-[#b5c0cd]">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={draft.isActive}
                onChange={(event) => setField("isActive", event.target.checked)}
              />
              <span>
                {t.fields.active}
                <span className="block text-[11px] text-[#8190a1]">{t.hints.active}</span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs text-[#b5c0cd]">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={draft.isPrimary}
                onChange={(event) => setField("isPrimary", event.target.checked)}
              />
              <span>
                {t.fields.primary}
                <span className="block text-[11px] text-[#8190a1]">{t.hints.primary}</span>
              </span>
            </label>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-[#e5b94f] px-4 py-2 text-sm font-medium text-black hover:bg-[#f6d57a] disabled:opacity-50"
            >
              <Check className="h-4 w-4" aria-hidden />
              {editing === "new" ? t.actions.create : t.actions.save}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setDraft(EMPTY_DRAFT);
                setError("");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#202c3a] px-4 py-2 text-sm text-[#b5c0cd] hover:bg-[#111b27]"
            >
              <X className="h-4 w-4" aria-hidden />
              {t.actions.cancel}
            </button>
          </div>
        </div>
      )}

      {rows.length === 0 && editing === null ? (
        <p className="rounded-xl border border-dashed border-[#202c3a] px-6 py-12 text-center text-sm text-[#8190a1]">
          {t.empty}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#202c3a] bg-[#0d141e]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#111b27]">
                <tr>
                  {[t.columns.agency, t.columns.city, t.columns.contact, t.columns.cars, t.columns.status, t.columns.actions].map(
                    (label) => (
                      <th key={label} className="px-4 py-3 text-start font-medium text-[#b5c0cd]">
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202c3a]">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111b27]/60">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-[#f4f5f7]">
                        {row.name}
                        {row.isPrimary && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e5b94f]/10 px-2 py-0.5 text-[11px] text-[#e5b94f]">
                            <Star className="h-3 w-3" aria-hidden />
                            {t.fields.primary}
                          </span>
                        )}
                      </span>
                      {row.address ? (
                        <span className="mt-0.5 block text-xs text-[#8190a1]">{row.address}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-[#b5c0cd]">{row.city || "—"}</td>
                    <td className="px-4 py-3 text-[#b5c0cd]">
                      {row.phone || row.email ? (
                        <span className="block">
                          {row.phone}
                          {row.phone && row.email ? " · " : ""}
                          {row.email}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#b5c0cd]">
                      {row.carCount === 0
                        ? "—"
                        : (row.carCount === 1 ? t.hints.carsAttached : t.hints.carsAttachedPlural).replace(
                            "{count}",
                            String(row.carCount)
                          )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                          row.isActive ? "bg-[#27d99a]/10 text-[#27d99a]" : "bg-white/5 text-[#8190a1]"
                        }`}
                      >
                        {row.isActive ? t.status.visible : t.status.hidden}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label={`${t.actions.edit} ${row.name}`}
                          className="rounded border border-[#202c3a] p-1.5 text-[#b5c0cd] hover:border-[#e5b94f] hover:text-[#e5b94f]"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(row)}
                          aria-label={`${t.actions.remove} ${row.name}`}
                          className="rounded border border-[#202c3a] p-1.5 text-[#b5c0cd] hover:border-[#fa655e] hover:text-[#fa655e]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={remove}
        loading={busy}
        title={t.confirm.title}
        description={
          confirming && confirming.carCount > 0
            ? t.hints.detachWarning.replace("{count}", String(confirming.carCount))
            : confirming?.name
        }
        confirmLabel={t.confirm.confirm}
        cancelLabel={t.confirm.cancel}
      />
    </div>
  );
}
