import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { resolveLocale } from "@/i18n";

/** Public website shell: dark theme, site navbar and footer. */
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);

  return (
    <div className="flex min-h-full flex-col bg-black text-white overflow-x-hidden">
      <Navbar lang={lang} />
      <main className="flex-1 pt-20">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}
