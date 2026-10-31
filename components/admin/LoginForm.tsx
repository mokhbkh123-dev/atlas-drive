"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { Button, Input, Label } from "@/components/admin/ui";
import { getDict, type Locale } from "@/i18n";

type ErrorKey =
  | "generic"
  | "MISSING_FIELDS"
  | "INVALID_CREDENTIALS"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export default function LoginForm({
  lang,
  next,
}: {
  lang: Locale;
  next?: string;
}) {
  const dict = getDict(lang);
  const t = dict.auth;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const key: ErrorKey =
          typeof data.code === "string" && data.code in t.errors
            ? (data.code as ErrorKey)
            : "generic";
        setError(t.errors[key]);
        return;
      }
      // Persist the admin language choice as well.
      document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`;
      router.push(next && next.startsWith("/") ? next : `/${lang}/admin`);
      router.refresh();
    } catch {
      setError(t.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">{t.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">{t.password}</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            dir="ltr"
            className="pe-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t.hidePassword : t.showPassword}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-admin-muted transition-colors hover:text-admin-ink"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-[#b91c1c]">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogIn className="h-4 w-4" aria-hidden />
        )}
        {loading ? t.submitting : t.submit}
      </Button>

      <p className="text-center text-xs text-admin-muted">{t.sessionNote}</p>
    </form>
  );
}
