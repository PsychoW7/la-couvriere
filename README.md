# La Couvrière — site de réservation directe

Gîte de montagne à Cilaos (La Réunion). Site one-page bilingue FR/EN, calendrier de disponibilités en temps réel, acompte réglé via Stripe Checkout, e-mail de confirmation Resend, mini-admin pour le propriétaire.

**Stack** : Next.js 15 (App Router, TypeScript) · Tailwind CSS 4 · next-intl · Supabase (Postgres) · Stripe Checkout · Resend · Vitest · Vercel.

```
config/gite.ts            prix, ménage, acompte, min. nuits, horaires, coordonnées
messages/{fr,en}.json     tous les textes du site
supabase/schema.sql       tables bookings + blocked_dates
public/photos/*.svg       placeholders à remplacer par vos photos (mêmes noms)
src/app/[locale]/         accueil, /reserver, /confirmation, /admin, pages légales
src/app/api/              availability, checkout, stripe/webhook
src/lib/calendar.ts       logique du calendrier (testée dans src/tests)
```

## 1. Lancer en local

```bash
pnpm install
cp .env.example .env.local   # puis remplir les variables (voir ci-dessous)
pnpm dev                     # http://localhost:3000 → redirige vers /fr
pnpm test                    # tests Vitest (calendrier, tarifs)
```

Sans Supabase configuré, le calendrier s'affiche vide en développement (toutes les dates libres) pour pouvoir travailler le design ; le paiement nécessite Supabase + Stripe.

## 2. Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Ouvrez **SQL Editor** et exécutez le contenu de `supabase/schema.sql`. Il crée :
   - `bookings` (réservations, statut `pending | confirmed | cancelled`, `stripe_session_id`) avec une **contrainte d'exclusion** : deux réservations `confirmed` ne peuvent jamais se chevaucher ;
   - `blocked_dates` (dates bloquées manuellement).
   - RLS activée : aucun accès anonyme, tout passe par la clé `service_role` côté serveur.
3. Dans **Project Settings → API**, copiez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

> Les dates sont stockées au format `start_date` (première nuit, incluse) / `end_date` (jour de départ, exclu). Une réservation `pending` bloque les dates pendant 30 min (durée de la session Stripe), puis expire via webhook.

## 3. Stripe

1. Dans le [Dashboard Stripe](https://dashboard.stripe.com), mode **Test** → **Developers → API keys** : copiez la clé secrète → `STRIPE_SECRET_KEY`.
2. Le site crée une session **Checkout (mode `payment`)** du montant de l'acompte. Le formulaire carte est hébergé par Stripe.
3. **Webhook** — en local :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   La CLI affiche un `whsec_…` → `STRIPE_WEBHOOK_SECRET`.
4. **Webhook** — en production : **Developers → Webhooks → Add endpoint**
   - URL : `https://votre-domaine.re/api/stripe/webhook`
   - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`
   - Copiez le **Signing secret** → `STRIPE_WEBHOOK_SECRET` dans Vercel.

Flux : `/reserver` → `POST /api/checkout` (re-vérifie la disponibilité côté serveur, crée la réservation `pending`, crée la session Stripe) → paiement → webhook passe la réservation en `confirmed` et envoie l'e-mail. La page `/confirmation` fait la même chose en filet de sécurité (idempotent) si le webhook est en retard. Carte de test : `4242 4242 4242 4242`.

## 4. Resend (e-mails)

1. Créez un compte sur [resend.com](https://resend.com), ajoutez et **vérifiez votre domaine** (DNS).
2. **API Keys** → `RESEND_API_KEY`.
3. `RESEND_FROM="La Couvrière <reservations@votre-domaine.re>"` (adresse du domaine vérifié).
4. Optionnel : `OWNER_NOTIFICATION_EMAIL` reçoit une copie (Bcc) de chaque confirmation.

Le gabarit (FR/EN) est dans `src/lib/email.ts`.

## 5. Admin

- URL : `/fr/admin` (ou `/en/admin`).
- `ADMIN_PASSWORD` : mot de passe de connexion.
- `ADMIN_SESSION_SECRET` : chaîne aléatoire longue (`openssl rand -hex 32`) qui signe le cookie de session (7 jours).
- Fonctions : liste des réservations (confirmer / annuler), bloquer / débloquer des dates.

## 6. Déploiement Vercel

1. Poussez le dépôt sur GitHub et importez-le dans [Vercel](https://vercel.com/new) (framework détecté : Next.js, package manager pnpm).
2. **Settings → Environment Variables** : recopiez toutes les variables de `.env.example` avec leurs valeurs de production. `NEXT_PUBLIC_SITE_URL` = URL finale du site (sert aux redirections Stripe).
3. Déployez, puis créez le webhook Stripe de production (étape 3.4) avec l'URL Vercel et ajoutez `STRIPE_WEBHOOK_SECRET`. Redéployez.
4. Testez une réservation complète en mode test Stripe avant de passer les clés en mode Live.

## Personnalisation

- **Prix, acompte, horaires, coordonnées** : `config/gite.ts`.
- **Textes** : `messages/fr.json` et `messages/en.json`.
- **Photos** : remplacez `public/photos/chalet.svg`, `terrasse.svg`, `jardin.svg` (ou changez l'extension dans `src/components/Gite.tsx`).
- **Mentions légales** : complétez le nom du propriétaire et le SIRET dans les messages (`legal.sections`).

## Scripts

| Commande          | Rôle                              |
| ----------------- | --------------------------------- |
| `pnpm dev`        | serveur de développement          |
| `pnpm build`      | build de production               |
| `pnpm test`       | tests Vitest                      |
| `pnpm lint`       | ESLint                            |
| `pnpm typecheck`  | `tsc --noEmit`                    |
