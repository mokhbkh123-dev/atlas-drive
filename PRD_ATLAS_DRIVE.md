# PRD — ATLAS DRIVE
## Plateforme professionnelle de location de voitures

**Version :** 1.1  
**Date :** 20 octobre 2026  
**Stack imposée :** Next.js + TypeScript  
**Langues :** Français et arabe  
**Marché cible :** Maroc  
**Devise :** MAD (dirham marocain)

---

## 1. Présentation du projet

ATLAS DRIVE est une plateforme web responsive de location de voitures destinée au marché marocain. Elle permet aux visiteurs de consulter les véhicules, de vérifier leur disponibilité, d'estimer le coût d'une location et d'envoyer une demande de réservation.

Une interface d'administration sécurisée permet au propriétaire ou à l'équipe de gérer les véhicules, les images, les réservations, les clients, les tarifs et les paramètres du site.

**Règle essentielle :** OpenCode doit travailler dans le dépôt existant lorsqu'il y en a un. Il ne doit jamais remplacer, supprimer ou réinitialiser le projet avant d'avoir inspecté ses fichiers, sa configuration et son état Git.

## 2. Objectifs

- Présenter la flotte de voitures de façon professionnelle.
- Permettre la recherche selon les dates, le lieu, le prix et les caractéristiques.
- Calculer le prix estimé de la location côté serveur.
- Enregistrer et gérer les demandes de réservation.
- Empêcher les doubles réservations d'un même véhicule.
- Fournir une administration permettant de gérer le site sans modifier le code.
- Optimiser l'expérience mobile, les performances, l'accessibilité et le SEO.
- Proposer une interface française et arabe avec prise en charge du RTL.

## 3. Utilisateurs et rôles

### Visiteur / client
- Consulter et filtrer les véhicules.
- Voir les caractéristiques et tarifs.
- Choisir les dates et lieux de prise en charge et de retour.
- Envoyer une demande de réservation.
- Consulter les conditions, les coordonnées et la FAQ.

### Administrateur
- Accéder à un tableau de bord protégé.
- Créer, modifier, publier, dépublier et archiver des véhicules.
- Gérer les images, tarifs, disponibilités, réservations et clients.
- Confirmer, refuser ou annuler les demandes.
- Modifier les paramètres publics du site et consulter des rapports simples.

### Agent (facultatif)
- Consulter et mettre à jour les réservations selon ses permissions.
- Enregistrer la remise et le retour d'un véhicule.
- Ne peut pas gérer les comptes administrateurs ni les paramètres de sécurité.

## 4. Périmètre MVP

### Inclus
- Site public responsive.
- Accueil, catalogue, détail d'un véhicule, réservation, confirmation, services, à propos, contact, FAQ, conditions et politique de confidentialité.
- Recherche et filtres.
- Formulaire de réservation et estimation du prix.
- Base de données persistante.
- Authentification et administration sécurisées.
- Gestion des véhicules, images et réservations.
- Validation côté serveur et états de réservation.
- SEO technique de base.
- Français et arabe avec RTL.
- États de chargement, absence de résultats, succès et erreur.

### Hors périmètre initial
- Application mobile native.
- Paiement en ligne avant le choix et la configuration d'un prestataire.
- Synchronisation avec des plateformes tierces.
- Programme de fidélité complexe.
- Gestion multi-agences avancée.

## 5. Stack et règles techniques

- Next.js avec App Router.
- TypeScript en mode strict.
- React.
- Tailwind CSS, sauf si le dépôt utilise déjà une solution cohérente.
- PostgreSQL recommandé pour la base relationnelle.
- Prisma recommandé comme ORM, après inspection de l'existant.
- Solution d'authentification maintenue et adaptée à la stack.
- Zod ou solution équivalente pour valider les données.
- Tests unitaires et/ou end-to-end adaptés au projet.

### Instructions obligatoires à OpenCode
1. Inspecter l'arborescence, `package.json`, scripts, routes, composants, styles, images, variables documentées et état Git.
2. Identifier la stack réellement installée et vérifier le démarrage actuel.
3. Préserver les fonctionnalités déjà opérationnelles, sauf nécessité démontrée.
4. Ne pas écraser de configuration, supprimer de données ou effectuer une migration risquée sans expliquer le besoin et demander confirmation si nécessaire.
5. Présenter un plan par étapes avant les changements majeurs.
6. Implémenter une étape à la fois, puis lancer lint, typecheck, tests et build lorsqu'ils sont disponibles.
7. Ne jamais prétendre qu'une fonctionnalité fonctionne sans l'avoir testée.
8. Ne pas inventer de clés API, secrets, comptes ou identifiants de paiement.
9. Après chaque étape, résumer les fichiers modifiés, les commandes exécutées, les tests et les problèmes restants.
10. Si une information manque, choisir une valeur par défaut sûre lorsque c'est possible et documenter l'hypothèse. Poser une question seulement si le travail est réellement bloqué ou si une décision irréversible est nécessaire.

### Organisation indicative
Adapter cette structure au dépôt existant, sans refonte inutile :
- `app/` : routes Next.js et pages.
- `app/admin/` : interface d'administration.
- `app/api/` : API nécessaire.
- `components/` : composants partagés.
- `lib/` : accès aux données, validation, sécurité et utilitaires.
- `prisma/` : schéma et migrations si Prisma est retenu.
- `public/` : ressources statiques.
- `tests/` : tests automatisés.

## 6. Identité visuelle et UX

Créer une identité automobile premium, moderne, nette et rassurante, sans surcharge visuelle.

Palette indicative : anthracite/noir, blanc, gris clair et une couleur d'accent distinctive (bleu profond ou or discret).

Exigences :
- Responsive mobile-first.
- Navigation simple et cohérente.
- Photos nettes et cadrées de façon homogène.
- Cartes de véhicules cohérentes et prix lisibles.
- Boutons d'action clairement identifiables.
- Formulaires avec libellés, validation et messages d'erreur compréhensibles.
- États de chargement, pages vides et erreurs utiles.
- Contrastes suffisants et navigation clavier de base.
- Aucun bouton ou lien présenté comme fonctionnel s'il ne l'est pas.

### Internationalisation
- Français par défaut, sauf si le projet existant définit une autre convention.
- Arabe avec `dir="rtl"` et alignement adapté.
- Centraliser les textes dans un système de traduction cohérent.
- Formater les dates, nombres et montants selon la langue et la devise.

## 7. Pages publiques

### Accueil — `/`
- En-tête avec logo, navigation, langue et action de réservation.
- Section principale avec proposition de valeur et formulaire de recherche.
- Véhicules vedettes provenant des données réelles.
- Avantages, services, étapes de réservation et FAQ courte.
- Coordonnées et pied de page.
- Témoignages uniquement s'ils sont réels ou clairement marqués comme exemples en développement.

### Catalogue — `/cars`
- Afficher les véhicules publiés.
- Recherche par marque ou modèle.
- Filtres par catégorie, prix journalier, transmission, carburant et nombre de places si les données existent.
- Tri par prix croissant ou décroissant.
- État clair si aucun résultat.
- Les véhicules non publiés ne doivent pas apparaître publiquement.

### Détail d'un véhicule — `/cars/[slug]`
Afficher le nom, la marque, le modèle, l'année si connue, les images, le prix journalier en MAD, les caractéristiques disponibles, la description, les conditions et l'action de réservation.

Critères : un slug invalide renvoie une page 404 ; une image manquante utilise un remplacement local ; les prix ne sont pas dupliqués en dur dans plusieurs composants.

### Réservation — `/booking` ou parcours associé
Champs : véhicule, date/heure de prise en charge, date/heure de retour, lieux, nom complet, téléphone, e-mail selon la politique retenue, notes facultatives et acceptation des conditions.

Comportement :
- Vérifier que le retour est postérieur à la prise en charge.
- Recalculer le tarif côté serveur à partir de données fiables.
- Vérifier la disponibilité côté serveur.
- Afficher un récapitulatif avant l'envoi.
- Enregistrer une demande avec une référence unique.
- Afficher une confirmation claire.
- Dans le MVP, une demande envoyée reste « en attente » jusqu'à confirmation réelle par l'agence.
- Ne pas demander ni stocker les données de carte bancaire.

### Confirmation — `/booking/confirmation`
Afficher la référence, le véhicule, les dates, les lieux, le montant estimé et le statut réel. Ne pas exposer les données privées à une personne qui connaît uniquement un identifiant séquentiel ; utiliser un jeton non devinable ou une authentification adaptée.

### Pages de contenu
- `/about` : présentation réelle de l'agence.
- `/services` : services effectivement proposés.
- `/contact` : coordonnées configurées et formulaire éventuel.
- `/faq` : réponses utiles.
- `/terms` : conditions de location à valider par le propriétaire.
- `/privacy` : politique de confidentialité à valider avant publication.

Ne pas inventer une adresse, un numéro de téléphone, des avis, certifications ou engagements commerciaux. Utiliser des paramètres configurables ou des données de démonstration explicitement identifiées.

## 8. Administration

Routes indicatives :
- `/admin`
- `/admin/cars`
- `/admin/cars/new`
- `/admin/bookings`
- `/admin/customers`
- `/admin/settings`

### Tableau de bord
Afficher selon les données disponibles : véhicules actifs, demandes en attente, réservations confirmées, locations en cours, prochaines prises en charge et recettes réellement encaissées. Distinguer les recettes encaissées des montants estimés.

### Gestion des véhicules
- Créer, modifier, publier, dépublier et archiver.
- Gérer nom, slug, marque, modèle, année, catégorie, prix journalier, description, caractéristiques et statut.
- Ajouter, supprimer et ordonner les images.
- Valider les données avant sauvegarde.
- Préférer l'archivage à la suppression destructive lorsqu'un historique de réservation existe.

### Gestion des réservations
- Liste filtrable et paginée.
- Détail d'une réservation.
- Confirmation, refus et annulation selon les règles définies.
- Historique des changements de statut.
- Contrôle des permissions pour chaque action.

### Paramètres
Nom de l'agence, coordonnées, horaires, langues, devise, politique de calcul des jours, options, prix additionnels et liens de contact.

## 9. Modèle de données indicatif

Adapter ce modèle à la base existante et éviter les tables redondantes.

### `User`
- `id`
- `name`
- `email` unique
- `passwordHash` ou référence au fournisseur d'authentification
- `role` : `ADMIN`, `AGENT`
- `createdAt`, `updatedAt`

### `Car`
- `id`, `slug` unique, `brand`, `model`, `name`
- `year` nullable, `category`, `transmission`, `fuelType`
- `seats`, `doors`, `dailyPrice`
- `description`, `status`, `createdAt`, `updatedAt`

### `CarImage`
- `id`, `carId`, `url` ou chemin de stockage
- `alt`, `sortOrder`, `isPrimary`

### `Booking`
- `id` et référence publique non devinable
- `customerName`, `customerPhone`, `customerEmail`
- `carId`, `pickupAt`, `returnAt`
- `pickupLocation`, `returnLocation`
- `dailyPriceSnapshot`, `extrasTotal`, `totalPrice`
- `status` : `PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `IN_PROGRESS`, `COMPLETED`
- `customerNotes`, `createdAt`, `updatedAt`

### `Payment` (facultatif pour le MVP)
- `id`, `bookingId`, `amount`, `currency`, `method`, `status`, `providerReference`, `createdAt`
- Ne jamais marquer un paiement comme réussi sans confirmation vérifiable du prestataire.

### `Maintenance` (si nécessaire)
- `id`, `carId`, `startAt`, `endAt`, `notes`, `status`

Principes :
- Un client peut avoir plusieurs réservations.
- Un véhicule peut avoir plusieurs images et périodes de maintenance.
- Le tarif appliqué à une réservation est conservé comme instantané.
- Utiliser une précision monétaire appropriée, sans calcul monétaire imprécis en nombres flottants.
- Traiter les dates de façon cohérente avec le fuseau horaire du Maroc.
- Ajouter les index nécessaires et documenter migrations, sauvegardes et restauration.

## 10. Disponibilité et doubles réservations

- Les contrôles côté client améliorent l'expérience mais ne remplacent jamais la validation serveur.
- Par défaut, `CONFIRMED` et `IN_PROGRESS` bloquent une période. Une demande `PENDING` ne la bloque que si une règle de réservation temporaire est activée.
- Deux périodes se chevauchent si `nouvellePriseEnCharge < retourExistant` et `nouveauRetour > priseEnChargeExistante`.
- Vérifier aussi les périodes de maintenance.
- Vérifier la disponibilité à la création et à la confirmation.
- Utiliser transaction et mécanisme de concurrence adapté à la base pour éviter deux confirmations concurrentes.
- Rendre configurables ou documenter les règles de délai entre locations, retard et prolongation.

## 11. Calcul du prix

Centraliser le calcul dans une fonction métier testée et recalculer côté serveur.

`Prix estimé = jours facturés × tarif journalier + options + frais configurés − réductions autorisées`

- Définir si une journée commencée est facturée ou si le calcul se fait par tranches de 24 heures.
- Définir les règles d'arrondi et le fuseau horaire.
- Détailler les composantes du prix.
- Ne jamais faire confiance au total envoyé par le navigateur.
- Distinguer prix estimé, prix confirmé, caution et paiement réellement encaissé.
- La caution, si elle existe, reste séparée du prix de location.

## 12. Images et ressources

- Conserver les images existantes qui fonctionnent.
- Vérifier les noms et la casse exacte des fichiers et extensions.
- Utiliser `next/image` lorsque c'est compatible avec la configuration.
- Configurer les domaines distants autorisés si nécessaire.
- Prévoir un remplacement visuel local pour les images manquantes.
- Optimiser le poids et les dimensions des photos.
- En production, stocker les images téléversées dans un stockage persistant, pas uniquement dans un système de fichiers éphémère.
- Valider le type, la taille et les permissions des fichiers envoyés.

## 13. Sécurité et confidentialité

- Protéger toutes les routes d'administration côté serveur.
- Vérifier les permissions pour chaque action sensible.
- Utiliser une authentification maintenue et des mots de passe hachés si l'application gère les mots de passe.
- Valider et normaliser toutes les entrées côté serveur.
- Limiter les requêtes sur les formulaires sensibles.
- Conserver les secrets dans les variables d'environnement.
- Ne jamais committer `.env`, mots de passe ou clés API ; fournir `.env.example` sans secrets réels.
- Ne pas révéler les détails internes dans les erreurs publiques.
- Journaliser les actions administratives importantes sans données sensibles inutiles.
- Prévoir sauvegarde et restauration.
- Faire valider les textes juridiques et les obligations applicables au Maroc avant la mise en production, notamment la protection des données personnelles.

## 14. SEO, accessibilité et performance

### SEO
- Titres et descriptions uniques.
- URLs stables et lisibles.
- Sitemap et `robots.txt`.
- Métadonnées Open Graph.
- Données structurées seulement si elles sont exactes et pertinentes.
- Pages 404 et URLs canoniques correctes.
- Ne pas indexer les pages privées et d'administration.

### Accessibilité
- HTML sémantique.
- Libellés explicites et erreurs associées aux champs.
- Navigation clavier et focus visibles.
- Contraste suffisant.
- Textes alternatifs pertinents.
- Ne pas communiquer un statut uniquement par la couleur.

### Performance
- Utiliser les composants serveur par défaut quand c'est pertinent.
- Réserver les composants client aux interactions nécessaires.
- Optimiser les images et limiter les dépendances inutiles.
- Paginer les longues listes et éviter les requêtes répétitives.
- Mesurer les performances plutôt que promettre un score arbitraire.

## 15. Notifications

MVP : message de confirmation à l'écran, référence unique et demande visible dans l'administration. Les e-mails ou messages WhatsApp ne doivent être activés qu'après configuration et test d'un fournisseur réel. Ne jamais prétendre qu'un message a été envoyé si le service n'est pas configuré ; en développement, marquer clairement les simulations.

## 16. Tests et critères d'acceptation

- [ ] Les pages publiques principales s'ouvrent.
- [ ] Le catalogue affiche uniquement les véhicules publiés.
- [ ] Les filtres fonctionnent ensemble.
- [ ] Le détail affiche les données correctes.
- [ ] Les formulaires invalides sont refusés avec des messages clairs.
- [ ] Le prix est recalculé côté serveur.
- [ ] Une demande valide est persistée et visible dans l'administration.
- [ ] Un administrateur peut confirmer ou refuser une demande.
- [ ] Un utilisateur non autorisé ne peut pas accéder aux fonctions d'administration.
- [ ] Deux réservations confirmées ne peuvent pas se chevaucher pour le même véhicule.
- [ ] Une voiture en maintenance ne peut pas être confirmée sur la période concernée.
- [ ] Les réservations passées conservent le tarif convenu.
- [ ] Les états de chargement, vide, succès et erreur sont gérés.
- [ ] Les images cassées disposent d'un remplacement.
- [ ] Les interfaces française et arabe fonctionnent, RTL inclus.
- [ ] Lint, TypeScript, tests et build passent lorsque les scripts correspondants existent.
- [ ] Aucun secret n'est inclus dans le dépôt.
- [ ] Les migrations et la procédure de sauvegarde sont documentées.

## 17. Déploiement sur Vercel (obligatoire)

Le projet doit être préparé pour être déployé et exécuté en production sur **Vercel**. Le déploiement ne doit être déclaré terminé qu'après vérification du build et des principales fonctionnalités en environnement de production.

### Exigences de déploiement
- Vérifier la compatibilité de la version de Next.js et des dépendances avec Vercel.
- Configurer le dépôt Git et importer le projet dans Vercel, en conservant les paramètres de build nécessaires au projet existant.
- Définir les variables d'environnement séparément pour `Development`, `Preview` et `Production`, selon les besoins.
- Fournir un fichier `.env.example` contenant uniquement les noms des variables nécessaires et des valeurs fictives, jamais de secrets réels.
- Utiliser une base de données hébergée et persistante compatible avec l'application. Ne pas dépendre du système de fichiers local de Vercel pour conserver les réservations ou les données.
- Stocker les photos téléversées dans un service de stockage persistant compatible avec la production ; ne pas compter sur le disque local de la fonction Vercel. Les images statiques livrées avec le site peuvent rester dans `public/`.
- Documenter la configuration de la base de données, les migrations et la procédure de déploiement. Exécuter les migrations de production uniquement avec une procédure sûre et vérifiée.
- Vérifier les paramètres de domaine, HTTPS, URL publique du site, métadonnées, sitemap et `robots.txt` avant la publication.
- S'assurer que les routes d'administration restent protégées en production et que les secrets ne sont jamais exposés au navigateur ou dans les journaux.
- Vérifier les journaux Vercel et corriger les erreurs de build, de démarrage et d'exécution.

### Procédure avant publication
1. Exécuter localement les scripts disponibles : lint, vérification TypeScript, tests et build.
2. Déployer d'abord sur un environnement **Preview** et tester les pages publiques, les images, l'authentification, l'administration et le parcours de réservation.
3. Vérifier la persistance réelle des données et le contrôle des doubles réservations avec la base de données de l'environnement concerné.
4. Configurer les variables de production et le domaine définitif, puis publier en production.
5. Effectuer un test rapide après déploiement et documenter l'URL publiée, les vérifications effectuées et les éventuels problèmes restants.

### Règles importantes
- Ne jamais inclure de clés API, mots de passe, secrets d'authentification ou chaîne de connexion réelle dans Git.
- Ne pas supposer qu'une base locale ou qu'un fichier local sera conservé après un déploiement.
- Ne pas lancer de migration destructive ni remplacer la configuration Vercel existante sans expliquer les conséquences et obtenir confirmation si nécessaire.
- Ne jamais prétendre que le site est déployé si le déploiement n'a pas réellement été effectué et vérifié.

## 18. Phases de livraison

### Phase 0 — Audit obligatoire
- Inspecter le dépôt, les routes, scripts, composants, styles, images, configuration et état Git.
- Identifier la stack réellement installée et les problèmes de démarrage.
- Ne modifier aucun fichier durant cette phase.
- Fournir un rapport d'audit et un plan d'action.

### Phase 1 — Base et interface publique
- Corriger les problèmes de démarrage identifiés.
- Construire ou améliorer l'accueil, le catalogue et les détails.
- Organiser les composants, styles, images et données.

### Phase 2 — Données et réservation
- Configurer la base et les migrations.
- Construire le formulaire, le calcul du prix et le contrôle des chevauchements.
- Enregistrer les demandes de réservation.

### Phase 3 — Administration
- Ajouter l'authentification et les permissions.
- Construire le tableau de bord et la gestion des véhicules, images et réservations.

### Phase 4 — Finition et publication
- Finaliser les traductions et notifications configurées.
- Vérifier SEO, sécurité, accessibilité et performance.
- Tester le build et préparer le déploiement.

## 19. Définition de « terminé »

Une fonctionnalité est terminée uniquement si :
1. Elle est implémentée dans le code.
2. Elle utilise les données prévues, et pas seulement des exemples statiques.
3. Les états de chargement, d'erreur et de succès sont gérés.
4. Les validations et permissions nécessaires sont en place.
5. Elle a été testée et le résultat est rapporté.

## 20. Première instruction à donner à OpenCode

**Commencer uniquement par la Phase 0 — Audit.**

> Inspecte le dépôt Next.js existant sans modifier ni supprimer de fichiers. Examine l'arborescence, `package.json`, les scripts, les routes, les composants, les styles, les images, la configuration et l'état Git si disponible. Identifie les problèmes qui empêchent l'application de démarrer ou d'afficher les images. Résume la stack réelle, ce qui fonctionne, ce qui manque et les risques éventuels. Propose ensuite un plan d'implémentation par petites étapes aligné sur ce PRD. N'installe aucune dépendance, ne réécris aucun fichier et ne lance aucune migration avant d'avoir présenté les constats et le plan.

---

**Fin du PRD ATLAS DRIVE — Version 1.1**
