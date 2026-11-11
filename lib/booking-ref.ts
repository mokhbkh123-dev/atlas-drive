import { randomBytes } from "node:crypto";

/**
 * I/O/0/1 removed: a reference is read aloud on the phone by this agency, and
 * 32 symbols divide 256 exactly, so indexing random bytes stays unbiased.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SUFFIX_LENGTH = 7;

/**
 * Public booking reference: `AD` + YYMMDD + 7 crypto-random characters.
 * The date half stays readable for staff; the suffix carries the entropy, so
 * guessing one reservation does not reveal its neighbours.
 */
export function generateRef(prefix = "AD"): string {
  const date = new Date();
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  let suffix = "";
  for (const byte of randomBytes(SUFFIX_LENGTH)) {
    suffix += ALPHABET[byte % ALPHABET.length];
  }

  return `${prefix}${y}${m}${d}-${suffix}`;
}
