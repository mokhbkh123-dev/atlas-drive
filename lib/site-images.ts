import "server-only";
import { existsSync } from "fs";
import path from "path";

/**
 * Resolve a `/public` asset only when the file actually exists, so a missing
 * image degrades to a styled fallback instead of a broken thumbnail.
 */
export function publicAsset(src: string): string | null {
  const relative = src.replace(/^\/+/, "");
  return existsSync(path.join(process.cwd(), "public", relative)) ? `/${relative}` : null;
}
