import type { Metadata } from "next";
import { Inter } from "next/font/google";

import AdminShell from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/ui";
import { ensureDailyNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { getDict, resolveLocale } from "@/i18n";

// Spec §3: Inter (or similar) for the administration interface.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Admin panel shell. Auth-sensitive pages must stay dynamic — static
 * prerendering would bypass the session check entirely.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = await resolveLocale(params);
  return { title: getDict(lang).adminLayout.meta.title };
}

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const user = await requireUser(lang); // redirects to /admin/login

  // Lazy operational reminders (upcoming pickups/returns, overdue…).
  await ensureDailyNotifications();
  const unread = await prisma.notification.count({ where: { readAt: null } });

  return (
    <div className={`${inter.variable} font-inter bg-[#080d14] text-[#f4f5f7] min-h-screen`}>
      <ToastProvider>
        <AdminShell
          lang={lang}
          user={{ name: user.name, email: user.email, role: user.role }}
          unread={unread}
        >
          {children}
        </AdminShell>
      </ToastProvider>
    </div>
  );
}
