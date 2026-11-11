"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";

import type { Locale } from "@/i18n/config";

/**
 * No contact-message API route exists in this app, so the form composes a
 * mailto: link instead of submitting. These two strings have no dictionary
 * key yet (i18n/sections/contact.ts only covers labels + address/email/hours).
 */
const FALLBACK_STRINGS: Record<Locale, { message: string; note: string }> = {
  fr: {
    message: "Message",
    note: "Votre message s'ouvre dans votre application e-mail, prérempli et adressé à l'agence. Rien n'est envoyé automatiquement.",
  },
  en: {
    message: "Message",
    note: "Your message opens in your email app, prefilled and addressed to the agency. Nothing is sent automatically.",
  },
  ar: {
    message: "الرسالة",
    note: "تُفتح رسالتكم في تطبيق البريد الإلكتروني لديكم، مُعبأة ومُوجهة إلى الوكالة. لا يُرسل أي شيء تلقائيًا.",
  },
};

export default function ContactForm({
  lang,
  agencyEmail,
  subject,
  labels,
}: {
  lang: Locale;
  agencyEmail: string;
  subject: string;
  labels: {
    intro: string;
    name: string;
    email: string;
    submit: string;
  };
}) {
  const copy = FALLBACK_STRINGS[lang];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const body = [
    `${labels.name}: ${name.trim() || "-"}`,
    `${labels.email}: ${email.trim() || "-"}`,
    "",
    `${copy.message}:`,
    message.trim() || "-",
  ].join("\n");

  const mailtoHref = `mailto:${agencyEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        window.location.href = mailtoHref;
      }}
      className="space-y-5"
    >
      <p className="text-sm leading-6 text-muted">{labels.intro}</p>

      <div>
        <label htmlFor="contact-name" className="field-label">
          {labels.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="field mt-2"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="field-label">
          {labels.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="field mt-2"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="field-label">
          {copy.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="field mt-2 resize-y"
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {labels.submit}
      </button>

      <p className="flex items-start gap-2 text-xs leading-5 text-muted">
        <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze" aria-hidden />
        <span>
          {copy.note}{" "}
          <a
            href={`mailto:${agencyEmail}`}
            className="font-semibold text-bronze-dark underline underline-offset-4 transition-colors hover:text-ink"
          >
            {agencyEmail}
          </a>
        </span>
      </p>
    </form>
  );
}
