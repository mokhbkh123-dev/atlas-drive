import type { Locale } from "../config";

const fr = {
  meta: {
    title: "Connexion - ATLAS DRIVE Admin",
  },
  title: "Espace d'administration",
  subtitle: "Connectez-vous pour continuer",
  email: "Adresse e-mail",
  emailPlaceholder: "admin@atlasdrive.ma",
  password: "Mot de passe",
  showPassword: "Afficher le mot de passe",
  hidePassword: "Masquer le mot de passe",
  submit: "Se connecter",
  submitting: "Connexion en cours...",
  sessionNote: "Session de 7 jours. Contactez le super administrateur en cas d'oubli de mot de passe.",
  errors: {
    generic: "Une erreur est survenue. Veuillez réessayer.",
    MISSING_FIELDS: "Veuillez renseigner l'e-mail et le mot de passe.",
    INVALID_CREDENTIALS: "E-mail ou mot de passe incorrect.",
    RATE_LIMITED: "Trop de tentatives. Réessayez dans quelques minutes.",
    SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard.",
  },
  forbidden: {
    title: "Accès refusé",
    description: "Votre rôle ne vous permet pas d'accéder à cette section.",
    back: "Retour au tableau de bord",
  },
};

/**
 * Admin authentication (login, forbidden). Keys must stay in sync with the
 * `fr` base dictionary.
 */
export const auth: Record<Locale, typeof fr> = {
  fr,
  en: {
    meta: {
      title: "Sign in - ATLAS DRIVE Admin",
    },
    title: "Administration",
    subtitle: "Sign in to continue",
    email: "Email address",
    emailPlaceholder: "admin@atlasdrive.ma",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submit: "Sign in",
    submitting: "Signing in...",
    sessionNote: "Sessions last 7 days. Contact the super admin if you forgot your password.",
    errors: {
      generic: "Something went wrong. Please try again.",
      MISSING_FIELDS: "Please enter your email and password.",
      INVALID_CREDENTIALS: "Invalid email or password.",
      RATE_LIMITED: "Too many attempts. Please try again in a few minutes.",
      SERVER_ERROR: "Server error. Please try again later.",
    },
    forbidden: {
      title: "Access denied",
      description: "Your role does not allow access to this section.",
      back: "Back to dashboard",
    },
  },
  ar: {
    meta: {
      title: "تسجيل الدخول - لوحة تحكم ATLAS DRIVE",
    },
    title: "لوحة الإدارة",
    subtitle: "سجّل الدخول للمتابعة",
    email: "البريد الإلكتروني",
    emailPlaceholder: "admin@atlasdrive.ma",
    password: "كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    submit: "تسجيل الدخول",
    submitting: "جارٍ تسجيل الدخول...",
    sessionNote: "صلاحية الجلسة 7 أيام. تواصل مع المشرف العام في حال نسيان كلمة المرور.",
    errors: {
      generic: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      MISSING_FIELDS: "يرجى إدخال البريد الإلكتروني وكلمة المرور.",
      INVALID_CREDENTIALS: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      RATE_LIMITED: "محاولات كثيرة. يرجى المحاولة بعد قليل.",
      SERVER_ERROR: "خطأ في الخادم. يرجى المحاولة لاحقًا.",
    },
    forbidden: {
      title: "الدخول ممنوع",
      description: "دورك لا يسمح بالوصول إلى هذا القسم.",
      back: "العودة إلى لوحة التحكم",
    },
  },
};
