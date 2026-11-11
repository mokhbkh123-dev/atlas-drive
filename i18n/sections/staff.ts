import type { Locale } from "../config";

const fr = {
  title: "Utilisateurs",
  subtitle: "Les comptes qui ont accès au tableau de bord, avec leur rôle et leurs permissions.",
  add: "Nouvel utilisateur",
  back: "Retour",
  newTitle: "Créer un compte",
  columns: {
    name: "Nom",
    email: "E-mail",
    role: "Rôle",
    status: "Statut",
    createdAt: "Créé le",
    lastLogin: "Dernière connexion",
  },
  empty: "Aucun utilisateur trouvé.",
  status: {
    active: "Actif",
    inactive: "Inactif",
  },
  form: {
    cardTitle: "Informations de l'utilisateur",
    name: "Nom complet",
    email: "Adresse e-mail",
    password: "Mot de passe",
    role: "Rôle",
    active: "Compte actif",
    passwordHint: "8 caractères minimum.",
    cancel: "Annuler",
    save: "Enregistrer",
  },
  messages: {
    created: "Utilisateur créé avec succès.",
  },
  // The API answers with these stable codes; they are never shown raw.
  errors: {
    MISSING_FIELDS: "Nom, e-mail et mot de passe sont requis.",
    PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères.",
    EMAIL_TAKEN: "Un compte existe déjà avec cet e-mail.",
    INVALID_EMAIL: "Adresse e-mail invalide.",
    NAME_TOO_LONG: "Le nom est trop long.",
    UNAUTHORIZED: "Session expirée, reconnectez-vous.",
    FORBIDDEN: "Votre rôle ne permet pas de créer des comptes.",
  },
};

/**
 * Staff & role management.
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const staff: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Users",
    subtitle: "The accounts that can reach the dashboard, with their role and permissions.",
    add: "New user",
    back: "Back",
    newTitle: "Create an account",
    columns: {
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      createdAt: "Created",
      lastLogin: "Last sign-in",
    },
    empty: "No user found.",
    status: {
      active: "Active",
      inactive: "Inactive",
    },
    form: {
      cardTitle: "User information",
      name: "Full name",
      email: "Email address",
      password: "Password",
      role: "Role",
      active: "Active account",
      passwordHint: "At least 8 characters.",
      cancel: "Cancel",
      save: "Save",
    },
    messages: {
      created: "User created successfully.",
    },
    errors: {
      MISSING_FIELDS: "Name, email and password are required.",
      PASSWORD_TOO_SHORT: "The password must be at least 8 characters.",
      EMAIL_TAKEN: "An account already uses this email.",
      INVALID_EMAIL: "Invalid email address.",
      NAME_TOO_LONG: "The name is too long.",
      UNAUTHORIZED: "Your session expired, please sign in again.",
      FORBIDDEN: "Your role cannot create accounts.",
    },
  },
  ar: {
    title: "المستخدمون",
    subtitle: "الحسابات التي ولج لوحة القيادة، مع دورها وصلاحياتها.",
    add: "مستخدم جديد",
    back: "رجوع",
    newTitle: "إنشاء حساب",
    columns: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      role: "الدور",
      status: "الحالة",
      createdAt: "تاريخ الإنشاء",
      lastLogin: "آخر دخول",
    },
    empty: "لا يوجد مستخدم.",
    status: {
      active: "نشط",
      inactive: "غير نشط",
    },
    form: {
      cardTitle: "معلومات المستخدم",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      role: "الدور",
      active: "حساب نشط",
      passwordHint: "8 أحرف على الأقل.",
      cancel: "إلغاء",
      save: "حفظ",
    },
    messages: {
      created: "تم إنشاء المستخدم بنجاح.",
    },
    errors: {
      MISSING_FIELDS: "الاسم والبريد وكلمة المرور مطلوبة.",
      PASSWORD_TOO_SHORT: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
      EMAIL_TAKEN: "يوجد حساب بهذا البريد بالفعل.",
      INVALID_EMAIL: "عنوان البريد غير صالح.",
      NAME_TOO_LONG: "الاسم طويل جدا.",
      UNAUTHORIZED: "انتهت الجلسة، أعد تسجيل الدخول.",
      FORBIDDEN: "دورك لا يسمح بإنشاء الحسابات.",
    },
  },
};
