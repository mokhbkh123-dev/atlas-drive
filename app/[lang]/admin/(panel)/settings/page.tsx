import { requireModule } from "@/lib/rbac";
import { getDict, resolveLocale } from "@/i18n";
import { readSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);
  await requireModule(lang, "settings");

  const stored = await readSettings();

  // What the public pages fall back to when the owner never set a value.
  const defaults = {
    whatsapp_number:
      process.env.WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    contact_email: dict.contact.emailValue,
    contact_address: dict.contact.addressValue,
    contact_hours: dict.contact.hoursValue,
  } as const;

  const t = dict.admin.settings;
  const fields = (Object.keys(defaults) as (keyof typeof defaults)[]).map((key) => ({
    key,
    label: t.fields[key],
    hint: t.hints[key],
    value: stored[key] ?? defaults[key],
    stored: Boolean(stored[key]),
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#f4f5f7]">{t.title}</h1>
      </div>

      <SettingsForm lang={lang} fields={fields} />

      <div className="rounded-xl border border-[#202c3a] bg-[#0d141e] p-5">
        <h2 className="mb-3 text-sm font-semibold text-[#f4f5f7]">{t.readOnlyTitle}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-b border-[#202c3a] pb-2">
            <span className="text-[#8190a1]">{t.siteUrl}</span>
            <span className="text-[#f4f5f7]" dir="ltr">
              {siteUrl || t.envNotSet}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8190a1]">{t.currency}</span>
            <span className="text-[#f4f5f7]">{t.currencyValue}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#8190a1]">{t.readOnlyHint}</p>
      </div>
    </div>
  );
}
