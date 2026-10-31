import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { getDict, resolveLocale } from "@/i18n";

const galleryImages = [
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2071&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1883&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
];

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = await resolveLocale(params);
  const dict = getDict(lang);

  return (
    <div className="bg-[#050505]">
      <section className="relative overflow-hidden border-b border-white/5 py-14 sm:py-20 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.14),transparent_70%)]" />
        <div className="container-luxe relative text-center">
          <p className="eyebrow eyebrow-center justify-center">{dict.gallery.eyebrow}</p>
          <h1 className="mt-5 text-balance text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-[0.95] tracking-tight">
            {dict.gallery.title}{" "}
            <span
              className={`text-gold ${
                lang === "ar" ? "" : "font-serif font-medium italic tracking-normal"
              }`}
            >
              {dict.gallery.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
            {dict.gallery.subtitle}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-luxe">
          <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3">
            {galleryImages.map((img, idx) => (
              <figure
                key={idx}
                className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-[#101010] sm:mb-4"
              >
                <img
                  src={img}
                  alt={`ATLAS DRIVE gallery ${idx + 1}`}
                  className="w-full transition-transform duration-700 hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center sm:mt-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {dict.about.eyebrow}
            </div>
            <Link href={`/${lang}/cars`} className="btn-gold">
              {dict.gallery.cta}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
