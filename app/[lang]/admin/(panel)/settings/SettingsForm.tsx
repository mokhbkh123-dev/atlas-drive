"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDict, type Locale } from "@/i18n";

type Field = {
  key: string;
  label: string;
  hint: string;
  value: string;
  stored: boolean;
};

export default function SettingsForm({ lang, fields }: { lang: Locale; fields: Field[] }) {
  const dict = getDict(lang);
  const t = dict.admin.settings;
  const router = useRouter();

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((field) => [field.key, field.value]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = fields.some((field) => values[field.key] !== field.value);

  const submit = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      if (res.ok) {
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

  return (
    <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-5">
      <h2 className="text-sm font-semibold text-[#f4f5f7]">{t.contactTitle}</h2>
      <p className="mt-1 text-xs text-[#8190a1]">{t.clearedHint}</p>

      <div className="mt-4 space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={field.key} className="text-xs font-medium text-[#b5c0cd]">
                {field.label}
              </label>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  field.stored ? "bg-[#27d99a]/10 text-[#27d99a]" : "bg-white/5 text-[#8190a1]"
                }`}
              >
                {field.stored ? t.sourceStored : t.sourceDefault}
              </span>
            </div>
            <input
              id={field.key}
              name={field.key}
              type="text"
              value={values[field.key]}
              onChange={(event) => {
                setValues((current) => ({ ...current, [field.key]: event.target.value }));
                setSaved(false);
              }}
              className="mt-1.5 w-full rounded border border-[#202c3a] bg-[#0a1017] px-3 py-2 text-sm text-[#f4f5f7] outline-none focus:border-[#e5b94f]"
            />
            <p className="mt-1 text-[11px] text-[#8190a1]">{field.hint}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-[#fa655e]/10 px-3 py-2 text-xs text-[#fa655e]">{error}</p>
      )}
      {saved && !error && (
        <p className="mt-4 rounded-md bg-[#27d99a]/10 px-3 py-2 text-xs text-[#27d99a]">{t.saved}</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={saving || !dirty}
          className="rounded bg-[#e5b94f] px-4 py-2 text-xs font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f6d57a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? t.saving : t.save}
        </button>
        {!dirty && !saved && (
          <span className="text-[11px] text-[#8190a1]">{t.noChanges}</span>
        )}
      </div>
    </div>
  );
}
