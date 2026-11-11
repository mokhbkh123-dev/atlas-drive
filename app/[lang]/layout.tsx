import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic, Playfair_Display } from "next/font/google";
import "../globals.css";
import { defaultLocale, dirOf, getDict, hasLocale, locales } from "@/i18n";

// Decides day/night before the first paint: a saved choice wins, otherwise the
// OS preference. Kept in sync with components/ThemeToggle.tsx.
const THEME_SCRIPT = `(function(){try{var k="atlas-theme";var s=localStorage.getItem(k);var d=s==="dark"||(!s&&window.matchMedia("(prefers-color-scheme: dark)").matches);var c=document.documentElement.classList;d?c.add("dark"):c.remove("dark")}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display serif for the public site's headings (admin keeps Inter).
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Arabic glyphs (Geist only ships latin subsets) — used as fallback for AR.
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // An unsupported [lang] renders the shell; the page itself responds 404.
  const locale = hasLocale(lang) ? lang : defaultLocale;

  return (
    <html
      lang={locale}
      dir={dirOf[locale]}
      // Tells Next to skip smooth scrolling during route transitions.
      data-scroll-behavior="smooth"
      // The script in <head> writes class="dark" before hydration sees the DOM.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${notoArabic.variable} h-full antialiased`}
    >
      <head>
        {/* Plain inline script: it runs while the HTML is parsed, before paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
