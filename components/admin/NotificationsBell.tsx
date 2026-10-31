"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";

import Dropdown from "@/components/admin/ui/dropdown";
import { getDict, type Locale } from "@/i18n";

type Notif = {
  id: string;
  type: string;
  params: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

function labelFor(
  dict: ReturnType<typeof getDict>,
  n: Notif
): string {
  const base =
    dict.notifications.types[n.type as keyof typeof dict.notifications.types] ??
    n.type;
  try {
    const params = n.params ? (JSON.parse(n.params) as Record<string, string>) : null;
    if (params?.ref) return `${base} · ${params.ref}`;
    if (params?.car) return `${base} · ${params.car}`;
    return base;
  } catch {
    return base;
  }
}

/** In-app notifications dropdown with read/unread states (spec §16). */
export default function NotificationsBell({
  lang,
  initialUnread,
}: {
  lang: Locale;
  initialUnread: number;
}) {
  const dict = getDict(lang);
  const router = useRouter();
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<Notif[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setUnread(initialUnread), [initialUnread]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=8");
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function markAllRead() {
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setUnread(0);
    setItems((list) =>
      list
        ? list.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
        : list
    );
    router.refresh();
  }

  return (
    <Dropdown
      label={dict.adminLayout.notifications.label}
      panelClassName="w-96 max-w-[calc(100vw-2rem)]"
      trigger={({ onClick, "aria-expanded": expanded }) => (
        <button
          type="button"
          onClick={() => {
            onClick();
            if (!items) load();
          }}
          aria-expanded={expanded}
          aria-label={dict.adminLayout.notifications.label}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-ink"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-admin-red px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      )}
    >
      {() => (
        <div>
          <div className="flex items-center justify-between border-b border-admin-line px-4 py-2.5">
            <p className="text-sm font-semibold text-admin-ink">
              {dict.adminLayout.notifications.title}
            </p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-admin-red hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                {dict.adminLayout.notifications.markAllRead}
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && !items ? (
              <p className="px-4 py-6 text-center text-sm text-admin-muted">
                {dict.adminLayout.search.loading}
              </p>
            ) : !items || items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-admin-muted">
                {dict.adminLayout.notifications.empty}
              </p>
            ) : (
              items.map((n) => {
                const body = (
                  <span className="block">
                    <span className="block text-sm font-medium text-admin-ink">
                      {labelFor(dict, n)}
                    </span>
                    <span className="mt-0.5 block text-xs text-admin-muted">
                      {new Date(n.createdAt).toLocaleString(lang === "ar" ? "ar-MA" : lang)}
                    </span>
                  </span>
                );
                const cls = `block border-b border-admin-line/60 px-4 py-3 transition-colors hover:bg-admin-bg ${
                  n.readAt ? "opacity-60" : "border-s-2 border-s-admin-red"
                }`;
                return n.link ? (
                  <Link
                    key={n.id}
                    href={n.link.startsWith(`/${lang}`) ? n.link : `/${lang}${n.link}`}
                    className={cls}
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={n.id} className={cls}>
                    {body}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </Dropdown>
  );
}
