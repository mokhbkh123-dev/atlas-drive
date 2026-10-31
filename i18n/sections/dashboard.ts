import type { Locale } from "../config";

const fr = {
  title: "Tableau de bord",
  subtitle: "Vue d'ensemble de l'activité, des réservations et de la flotte",
  range: {
    today: "Aujourd'hui",
    last7: "7 jours",
    last30: "30 jours",
    thisMonth: "Ce mois",
    custom: "Personnalisé",
    from: "Du",
    to: "Au",
    apply: "Appliquer",
    separator: "au",
    invalid: "La date de début doit précéder la date de fin.",
  },
  error: {
    title: "Impossible de charger le tableau de bord",
    description:
      "Une erreur est survenue lors de la récupération des données. Veuillez réessayer.",
    retry: "Réessayer",
  },
  kpi: {
    revenue: "Recettes encaissées",
    revenueHint: "Paiements encaissés sur la période",
    outstanding: "Impayés",
    outstandingHint: "{count} réservation(s) active(s) avec un solde",
    bookings: "Réservations",
    bookingsHint: "Réservations créées sur la période",
    utilization: "Taux d'utilisation",
    utilizationHint: "{rented} jours-véhicules loués sur {total}",
    fleet: "Flotte",
    fleetHint: "Véhicules publiés",
    rentedNow: "Loués",
    availableNow: "Disponibles",
    maintenanceNow: "En entretien",
    newCustomers: "Nouveaux clients",
    newCustomersHint: "{count} clients au total",
    vsPrevious: "vs période précédente",
    noBookings: "Aucune réservation sur la période",
    currentSnapshot: "Situation actuelle",
  },
  charts: {
    noData: "Aucune donnée pour cette période",
    revenueTrend: {
      title: "Évolution des recettes",
      subtitle: "Paiements encaissés par jour",
    },
    bookingsPerDay: {
      title: "Réservations par jour",
      subtitle: "Nouvelles réservations créées",
    },
    statusDistribution: {
      title: "Répartition par statut",
      subtitle: "Réservations de la période",
    },
    topVehicles: {
      title: "Top 5 véhicules",
      subtitle: "Par recettes encaissées",
    },
    sources: {
      title: "Sources de réservation",
      subtitle: "Origine des réservations",
    },
    utilization: {
      title: "Utilisation de la flotte",
      subtitle: "Jours-véhicules loués sur la période",
      rentedDays: "jours loués",
      capacityDays: "jours disponibles",
      rate: "taux d'utilisation",
    },
  },
  sections: {
    viewAll: "Tout voir",
    pickups: {
      title: "Départs du jour",
      empty: "Aucun départ prévu aujourd'hui",
    },
    returns: {
      title: "Retours du jour",
      empty: "Aucun retour prévu aujourd'hui",
    },
    pending: {
      title: "En attente de confirmation",
      empty: "Aucune demande en attente",
    },
    overdue: {
      title: "Retards de retour",
      empty: "Aucun retard de retour",
    },
    unpaid: {
      title: "Soldes impayés",
      empty: "Aucun solde impayé",
    },
    maintenance: {
      title: "Entretien à surveiller",
      empty: "Aucun entretien en cours",
    },
    recentBookings: {
      title: "Dernières réservations",
      empty: "Aucune réservation récente",
    },
    activity: {
      title: "Activité récente",
      empty: "Aucune activité récente",
    },
    pickupDue: "Départ prévu",
    returnDue: "Retour prévu",
    overdueSince: "En retard depuis le",
    balance: "Solde dû",
    system: "Système",
  },
  quickActions: {
    title: "Actions rapides",
    newReservation: "Nouvelle réservation",
    addVehicle: "Ajouter un véhicule",
    customers: "Clients",
    calendar: "Calendrier",
    availability: "Disponibilités",
    fleet: "Flotte",
  },
  timeAgo: {
    justNow: "à l'instant",
    minutes: "il y a {count} min",
    hours: "il y a {count} h",
    days: "il y a {count} j",
  },
};

/**
 * Admin dashboard (KPIs, charts, operational overview).
 * Keys must stay in sync with the `fr` base dictionary.
 */
export const dashboard: Record<Locale, typeof fr> = {
  fr,
  en: {
    title: "Dashboard",
    subtitle: "Overview of activity, bookings and fleet",
    range: {
      today: "Today",
      last7: "7 days",
      last30: "30 days",
      thisMonth: "This month",
      custom: "Custom",
      from: "From",
      to: "To",
      apply: "Apply",
      separator: "to",
      invalid: "The start date must be before the end date.",
    },
    error: {
      title: "Unable to load the dashboard",
      description: "Something went wrong while fetching the data. Please try again.",
      retry: "Try again",
    },
    kpi: {
      revenue: "Revenue collected",
      revenueHint: "Payments collected in this period",
      outstanding: "Outstanding",
      outstandingHint: "{count} active booking(s) with a balance",
      bookings: "Bookings",
      bookingsHint: "Bookings created in this period",
      utilization: "Utilization rate",
      utilizationHint: "{rented} vehicle-days rented out of {total}",
      fleet: "Fleet",
      fleetHint: "Published vehicles",
      rentedNow: "Rented",
      availableNow: "Available",
      maintenanceNow: "In maintenance",
      newCustomers: "New customers",
      newCustomersHint: "{count} customers in total",
      vsPrevious: "vs previous period",
      noBookings: "No bookings in this period",
      currentSnapshot: "Current snapshot",
    },
    charts: {
      noData: "No data for this period",
      revenueTrend: {
        title: "Revenue trend",
        subtitle: "Payments collected per day",
      },
      bookingsPerDay: {
        title: "Bookings per day",
        subtitle: "New bookings created",
      },
      statusDistribution: {
        title: "Status distribution",
        subtitle: "Bookings in this period",
      },
      topVehicles: {
        title: "Top 5 vehicles",
        subtitle: "By collected revenue",
      },
      sources: {
        title: "Booking sources",
        subtitle: "Where bookings come from",
      },
      utilization: {
        title: "Fleet utilization",
        subtitle: "Vehicle-days rented in this period",
        rentedDays: "days rented",
        capacityDays: "days available",
        rate: "utilization rate",
      },
    },
    sections: {
      viewAll: "View all",
      pickups: {
        title: "Today's pickups",
        empty: "No pickups scheduled today",
      },
      returns: {
        title: "Returns due today",
        empty: "No returns due today",
      },
      pending: {
        title: "Pending confirmations",
        empty: "No pending requests",
      },
      overdue: {
        title: "Overdue returns",
        empty: "No overdue returns",
      },
      unpaid: {
        title: "Unpaid balances",
        empty: "No outstanding balance",
      },
      maintenance: {
        title: "Maintenance attention",
        empty: "No maintenance in progress",
      },
      recentBookings: {
        title: "Recent bookings",
        empty: "No recent bookings",
      },
      activity: {
        title: "Recent activity",
        empty: "No recent activity",
      },
      pickupDue: "Pickup due",
      returnDue: "Return due",
      overdueSince: "Overdue since",
      balance: "Balance due",
      system: "System",
    },
    quickActions: {
      title: "Quick actions",
      newReservation: "New booking",
      addVehicle: "Add vehicle",
      customers: "Customers",
      calendar: "Calendar",
      availability: "Availability",
      fleet: "Fleet",
    },
    timeAgo: {
      justNow: "just now",
      minutes: "{count} min ago",
      hours: "{count} h ago",
      days: "{count} d ago",
    },
  },
  ar: {
    title: "لوحة التحكم",
    subtitle: "نظرة عامة على النشاط والحجوزات والأسطول",
    range: {
      today: "اليوم",
      last7: "7 أيام",
      last30: "30 يومًا",
      thisMonth: "هذا الشهر",
      custom: "مخصص",
      from: "من",
      to: "إلى",
      apply: "تطبيق",
      separator: "إلى",
      invalid: "يجب أن يسبق تاريخ البداية تاريخ النهاية.",
    },
    error: {
      title: "تعذر تحميل لوحة التحكم",
      description: "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
    },
    kpi: {
      revenue: "الإيرادات المحصلة",
      revenueHint: "المدفوعات المحصلة خلال الفترة",
      outstanding: "المستحقات",
      outstandingHint: "{count} حجز نشط مع رصيد",
      bookings: "الحجوزات",
      bookingsHint: "الحجوزات المنشأة خلال الفترة",
      utilization: "معدل الاستخدام",
      utilizationHint: "{rented} يوم-سيارة مؤجرة من أصل {total}",
      fleet: "الأسطول",
      fleetHint: "السيارات المنشورة",
      rentedNow: "مؤجرة",
      availableNow: "متاحة",
      maintenanceNow: "في الصيانة",
      newCustomers: "عملاء جدد",
      newCustomersHint: "{count} عميلًا إجمالًا",
      vsPrevious: "مقارنة بالفترة السابقة",
      noBookings: "لا توجد حجوزات خلال هذه الفترة",
      currentSnapshot: "الوضع الحالي",
    },
    charts: {
      noData: "لا توجد بيانات لهذه الفترة",
      revenueTrend: {
        title: "تطور الإيرادات",
        subtitle: "المدفوعات المحصلة يوميًا",
      },
      bookingsPerDay: {
        title: "الحجوزات يوميًا",
        subtitle: "الحجوزات الجديدة المنشأة",
      },
      statusDistribution: {
        title: "التوزيع حسب الحالة",
        subtitle: "حجوزات الفترة",
      },
      topVehicles: {
        title: "أفضل 5 سيارات",
        subtitle: "حسب الإيرادات المحصلة",
      },
      sources: {
        title: "مصادر الحجز",
        subtitle: "مصدر الحجوزات",
      },
      utilization: {
        title: "استخدام الأسطول",
        subtitle: "أيام السيارات المؤجرة خلال الفترة",
        rentedDays: "أيام مؤجرة",
        capacityDays: "أيام متاحة",
        rate: "معدل الاستخدام",
      },
    },
    sections: {
      viewAll: "عرض الكل",
      pickups: {
        title: "مغادرات اليوم",
        empty: "لا مغادرات مبرمجة اليوم",
      },
      returns: {
        title: "إرجاعات اليوم",
        empty: "لا إرجاعات مستحقة اليوم",
      },
      pending: {
        title: "بانتظار التأكيد",
        empty: "لا طلبات معلقة",
      },
      overdue: {
        title: "تأخر الإرجاع",
        empty: "لا تأخير في الإرجاع",
      },
      unpaid: {
        title: "أرصدة غير مدفوعة",
        empty: "لا يوجد رصيد مستحق",
      },
      maintenance: {
        title: "صيانة تحتاج متابعة",
        empty: "لا صيانة قيد التنفيذ",
      },
      recentBookings: {
        title: "أحدث الحجوزات",
        empty: "لا حجوزات حديثة",
      },
      activity: {
        title: "النشاط الأخير",
        empty: "لا نشاط حديث",
      },
      pickupDue: "المغادرة المتوقعة",
      returnDue: "الإرجاع المتوقع",
      overdueSince: "متأخر منذ",
      balance: "الرصيد المستحق",
      system: "النظام",
    },
    quickActions: {
      title: "إجراءات سريعة",
      newReservation: "حجز جديد",
      addVehicle: "إضافة سيارة",
      customers: "العملاء",
      calendar: "التقويم",
      availability: "التوفر",
      fleet: "الأسطول",
    },
    timeAgo: {
      justNow: "الآن",
      minutes: "منذ {count} دقيقة",
      hours: "منذ {count} ساعة",
      days: "منذ {count} يوم",
    },
  },
};
