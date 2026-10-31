const B = "http://localhost:3000";

async function run() {
  const check = (name, ok, extra = "") =>
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);

  const locales = [
    ["fr", "Nos catégories", "Voir les voitures", false],
    ["en", "Our categories", "Explore cars", false],
    ["ar", "فئاتنا", "استكشف السيارات", true],
  ];
  for (const [lang, eyebrow, cta, rtl] of locales) {
    const r = await fetch(`${B}/${lang}`);
    const h = await r.text();
    check(`${lang} home 200`, r.status === 200);
    check(`${lang} categories eyebrow`, h.includes(eyebrow));
    check(`${lang} categories CTA`, h.includes(cta));
    check(`${lang} category links`, h.includes(`/${lang}/cars?category=Berline`));
    if (rtl) check(`${lang} RTL`, h.includes('dir="rtl"'));
    check(
      `${lang} counts rendered`,
      /\d+ (véhicules disponibles|cars available|سيارات متاحة)/.test(h)
    );
  }

  let r = await fetch(`${B}/fr/cars?category=Berline`);
  let h = await r.text();
  check("filter category=Berline 200", r.status === 200);
  check("Berline shows Audi RS6", h.includes("Audi RS6"));
  check("Berline hides Lamborghini", !h.includes("Lamborghini Hurac"));
  check("active filter chip", h.includes("Filtre actif"));

  r = await fetch(`${B}/fr/cars?maxPrice=2500`);
  h = await r.text();
  let count = (h.match(/href="\/fr\/cars\/[a-z0-9-]+"/g) || []).length;
  check("maxPrice=2500 returns 3 cars", count === 3, `found ${count}`);

  r = await fetch(`${B}/fr/cars?transmission=Automatique`);
  h = await r.text();
  count = (h.match(/href="\/fr\/cars\/[a-z0-9-]+"/g) || []).length;
  check("transmission=Automatique returns 6 cars", count === 6, `found ${count}`);
}

run().catch((e) => {
  console.error("error:", e.message);
  process.exit(1);
});
