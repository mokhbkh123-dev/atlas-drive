/**
 * Single source of truth for the coloured category badge used on the public
 * fleet cards, car detail page and destinations band.
 *
 * Keys are the raw `Car.category` values stored in the database (French
 * canonical values, plus the English labels an agent may type in the admin).
 *
 * Values are the `--badge-*` tokens declared in app/globals.css, so the badge
 * keeps its hue family in day mode and lifts to a lighter tint (with dark
 * text) in night mode without this file knowing about either scheme.
 */
const CATEGORY_BADGE_COLORS: Record<string, string> = {
  Sport: "var(--badge-sport)",
  SUV: "var(--badge-suv)",
  "4x4": "var(--badge-suv)",
  Berline: "var(--badge-sedan)",
  Sedan: "var(--badge-sedan)",
  Supercar: "var(--badge-supercar)",
  Luxury: "var(--badge-luxury)",
  Premium: "var(--badge-luxury)",
  Economy: "var(--badge-economy)",
  Utilitaire: "var(--badge-utility)",
  Utility: "var(--badge-utility)",
  Van: "var(--badge-utility)",
};

const DEFAULT_BADGE_COLOR = "var(--badge-default)";

/** Lowercased keys, so `MANUAL`-style admin input still finds its colour. */
const BADGE_COLORS_BY_LOWER = new Map(
  Object.entries(CATEGORY_BADGE_COLORS).map(([key, color]) => [key.toLowerCase(), color])
);

export function categoryBadgeColor(category: string): string {
  return (
    CATEGORY_BADGE_COLORS[category] ??
    BADGE_COLORS_BY_LOWER.get(category.trim().toLowerCase()) ??
    DEFAULT_BADGE_COLOR
  );
}
