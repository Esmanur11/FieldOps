const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
};

export function suggestUsername(fullName: string): string {
  const normalized = fullName
    .split("")
    .map((ch) => TURKISH_CHAR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase();

  return normalized.split(/\s+/).filter(Boolean).join(".");
}

function secureRandomInt(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function pick(chars: string): string {
  return chars[secureRandomInt(chars.length)];
}

// Matches CreateUserRequestValidator: 12+ chars, at least one upper/lower/digit/special.
// Ambiguous-looking characters (I/O/0/1) are excluded from the charset entirely.
export function generateStrongPassword(length = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*-_=+";
  const all = upper + lower + digits + special;

  const required = [pick(upper), pick(lower), pick(digits), pick(special)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => pick(all));
  const combined = [...required, ...rest];

  for (let i = combined.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join("");
}
