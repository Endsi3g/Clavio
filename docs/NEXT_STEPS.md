# Clavio — Roadmap to Production

_Mise à jour · Mai 2026 — v0.3.0 toward v1.0_

> **Vision:** Clavio becomes the operating system for every creator — from the solo YouTuber to the 20-person agency. One workspace, full pipeline, zero friction.

---

## Statut actuel

| Couche | État |
|--------|------|
| Core pipeline (Idea → Variant → Post) | ✅ Fonctionnel |
| Clip browser + bulk scheduling | ✅ Livré |
| Analytics charts (Recharts) | ✅ Livré |
| Render progress polling | ✅ Livré |
| Notification center realtime | ✅ Livré |
| i18n FR/EN | ✅ Complet |
| RLS + contraintes DB | ✅ Migration livrée |
| Auth / multi-workspace | ❌ Non implémenté |
| Mobile responsive | ⚠️ Partiel |
| Dark mode | ⚠️ Partiel |
| Production deploy | ❌ Non configuré |

---

## Phase 1 — Production blockers (must ship first)

### P1.1 — Onboarding wizard
**Impact : critique pour toute acquisition.**

Aucun nouvel utilisateur ne comprend l'app sans guide. Premier écran après installation :

```
Step 1: Workspace setup (name, logo, language, timezone)
Step 2: Choose profile (Solo creator / Small team / Agency)
Step 3: Connect integrations (n8n, Ollama, Whisper, Cobalt — health check inline)
Step 4: Import first content (upload video OR paste YouTube URL OR generate idea)
Step 5: Done — redirect to dashboard with confetti + first CTA
```

Fichiers à créer :
- `app/app/onboarding/page.tsx` — stepper UI
- `app/actions/onboarding.ts` — save workspace settings + mark onboarding complete
- `lib/hooks/use-onboarding.ts` — middleware redirect si onboarding non complété

---

### P1.2 — Global Command Palette (⌘K)
**Impact : productivité, UX power-user.**

Indispensable pour agences et utilisateurs avancés. Permet de naviguer, créer, et chercher sans souris.

```tsx
// components/command-palette.tsx
// Raccourcis:
// ⌘K → ouvre la palette
// > ideas new → crée une idée
// > publish [title] → cherche post à publier
// ⌘J → va à dashboard
// ⌘I → va à ideas
// ⌘V → va à videos
```

Stack : `cmdk` (déjà dans les dépendances via Shadcn) ou `@radix-ui/react-dialog` + filtre custom.

Sections dans la palette :
- **Navigation** — toutes les routes
- **Créer** — nouvelle idée / vidéo / post
- **Recherche** — idées, posts, vidéos par titre
- **Actions rapides** — générer idées, lancer sync métriques

---

### P1.3 — Mobile responsive complet
**Impact : critique pour solo créateurs qui gèrent depuis leur téléphone.**

Points actuels non responsifs :
- Sidebar (collapse partiel, pas de swipe-to-close sur mobile)
- Tables (overflow horizontal non géré sur < 768px)
- TopBar (search bar trop large sur mobile)
- Analytics (grille 6 colonnes crash à 320px)
- Publishing page (columns trop serrées)

**Plan :**
- Tables → passer en card view sur `sm:` breakpoint (`hidden sm:table-cell` pattern)
- Sidebar mobile → `<Sheet>` déjà présent, connecter le burger button de TopBar
- Analytics → responsive grid `grid-cols-2 sm:grid-cols-4`
- Charts → `ResponsiveContainer` déjà utilisé ✅

---

### P1.4 — Dark mode complet
**Impact : confort visuel, standard 2026.**

Le design system est en `light-only` selon CLAUDE.md. Mais plusieurs composants ont déjà des classes `dark:`. Compléter :

- `components/layout/app-shell.tsx` — ajouter `dark:bg-slate-950`
- Toutes les pages — ajouter classes `dark:` manquantes
- `components/ui/*` — vérifier que les Shadcn primitives ont leur dark variant
- Toggle dark/light dans TopBar (bouton existe mais sans effet réel)
- Persister le choix dans `settings` table (`key = 'theme'`)

---

### P1.5 — Error monitoring & observabilité
**Impact : impossible de maintenir en production sans ça.**

```bash
npm install @sentry/nextjs
```

- `sentry.client.config.ts` + `sentry.server.config.ts`
- Wrapper les server actions critiques dans `Sentry.captureException`
- Dashboard Sentry pour suivre les erreurs de production
- Optionnel : Uptime monitoring (Better Uptime, UptimeRobot)

---

### P1.6 — Variables d'environnement de production
Créer un guide de déploiement complet :

```bash
# .env.production (ne jamais committer)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=https://clavio.yourdomain.com
OLLAMA_BASE_URL=http://your-ollama-server:11434
WHISPER_API_URL=http://your-whisper-server:9000
N8N_BASE_URL=https://n8n.yourdomain.com
N8N_API_KEY=...
WEBHOOK_SECRET=<openssl rand -hex 32>
COBALT_API_URL=https://cobalt.yourdomain.com
SENTRY_DSN=...
```

Documenter dans `docs/deployment.md`.

---

## Phase 2 — UI/UX overhaul (priorité maximale selon brief)

### P2.1 — Redesign : Content Calendar (vue principale)
**Le feature le plus demandé par les créateurs et agences.**

Une vue calendrier interactive type Notion Calendar / Buffer :

```
/app/calendar
├── Mois vue (défaut) — cards par jour avec posts planifiés
├── Semaine vue — timeline par heure et plateforme
└── Drag & drop pour reprogrammer un post
```

Composants nécessaires :
- `app/app/calendar/page.tsx` — serveur, fetch posts du mois
- `app/app/calendar/calendar-grid.tsx` — client, rendu des jours + drag
- `app/app/calendar/calendar-post-card.tsx` — mini card par post (couleur = plateforme)
- `app/actions/calendar.ts` — `reschedulePost(postId, newDate)`

Stack : `@dnd-kit/core` pour drag & drop (léger, React-friendly).

---

### P2.2 — Redesign : Dashboard command center
**Le dashboard doit devenir LA page de contrôle.**

```
Layout actuel :
┌─────────────────────┬──────────┐
│ Things to do        │ Status   │
│ Upcoming posts      │ Perf     │
│ Recent activity     │ Platform │
└─────────────────────┴──────────┘

Layout cible :
┌────────────────────────────────────┐
│ Greeting + Today's date + Live     │
├──────────┬──────────┬──────────────┤
│ KPI strip: Views · Likes · Posts · Processing │
├──────────────────────────────────────────────┤
│ Content timeline (today's posts, next 7j)    │
├──────────────────────────────────────────────┤
│ Active jobs    │ Recent activity │ Quick add  │
└────────────────┴─────────────────┴────────────┘
```

Nouveau `MetricStrip` component en haut qui pulse quand des jobs tournent.

---

### P2.3 — Skeleton loading screens
**Chaque page doit avoir un état de chargement.**

Next.js 15 App Router : ajouter `loading.tsx` dans chaque route :

```
app/app/dashboard/loading.tsx     → skeleton cards
app/app/ideas/loading.tsx         → skeleton table rows
app/app/videos/loading.tsx        → skeleton table rows
app/app/publishing/loading.tsx    → skeleton tabs + rows
app/app/analytics/loading.tsx     → skeleton KPI cards + chart
app/app/clips/loading.tsx         → skeleton rows
```

Utiliser `<Skeleton>` de Shadcn (déjà installé).

---

### P2.4 — Empty states avec illustrations SVG
**Les empty states actuels sont trop minimalistes.**

Chaque feature doit avoir un empty state brandé :

```
Ideas empty → illustration ampoule + "Votre première idée vous attend"
Videos empty → illustration caméra + upload CTA prominent
Clips empty → illustration ciseaux + "Traitez une vidéo pour voir des clips"
Publishing empty → illustration calendrier + "Planifiez votre premier post"
Analytics empty → illustration graphique + "Publiez pour voir vos métriques"
```

Structure : `components/empty-states/ideas-empty.tsx`, etc. — SVG inline + copy bilingue.

---

### P2.5 — Detail panels (slide-over)
**Ouvrir un post / une idée / un clip sans quitter la liste.**

Au lieu de naviguer vers une page dédiée depuis la liste, un `<Sheet>` slide-over s'ouvre depuis la droite avec les détails + actions.

```tsx
// Comportement:
// Clic sur ligne de tableau → ouvre DetailSheet
// Sheet contient: metadata, actions, statut, liens
// Navigation profonde reste disponible via "Ouvrir en pleine page"
```

Composants :
- `components/detail-sheet.tsx` — wrapper générique
- `components/idea-detail-sheet.tsx`
- `components/post-detail-sheet.tsx`
- `components/clip-detail-sheet.tsx`

---

### P2.6 — Toast system amélioré + Undo
**Les toasts actuels sont informatifs mais non actionnables.**

Ajouter un pattern "undo" pour les actions destructives :
```tsx
// Au lieu de: toast.success("Idea archived")
// Faire:
toast.success("Idea archived", {
  action: {
    label: "Undo",
    onClick: () => unarchiveIdea(ideaId)
  },
  duration: 6000,
})
```

Actions concernées : Archive, Delete, Bulk schedule.

---

### P2.7 — Keyboard shortcuts système
**Indispensable pour les power users / agences.**

```
⌘K       → Command palette
⌘N       → Nouvelle idée (si sur /ideas)
⌘N       → Nouveau post (si sur /publishing)  
⌘/       → Toggle sidebar collapse
⌘⇧A     → Go to Analytics
⌘⇧I     → Go to Ideas
⌘⇧V     → Go to Videos
⌘⇧P     → Go to Publishing
Escape   → Ferme modal / slide-over / sheet
```

Composant global : `components/keyboard-shortcuts.tsx` avec `useEffect` + `document.addEventListener`.

Panel d'aide : `?` → modal listant tous les raccourcis.

---

### P2.8 — Breadcrumbs dynamiques dans TopBar
**La navigation entre pages profondes (video → clip → render) est confuse.**

```
Dashboard > Videos > "Mon Interview" > Renders
```

Remplacer le titre statique dans TopBar par un breadcrumb dynamique basé sur `usePathname()`.

---

### P2.9 — Global search (⌘F ou barre TopBar)
**Chercher à travers toutes les entités depuis n'importe où.**

```
Recherche "marketing" → trouve:
  - Idées : "Stratégie marketing Q3"
  - Posts : "Thread marketing automation"
  - Assets : "Logo-marketing.png"
  - Videos : "Interview marketing director"
```

API route : `GET /api/search?q=marketing&types=ideas,posts,assets,videos`

Résultats affichés dans une dropdown sous la barre de recherche existante dans TopBar.

---

### P2.10 — Vue "Kanban" pour les idées
**Les créateurs pensent en flux, pas en tableau.**

Ajouter une vue toggle (tableau / kanban) sur `/app/ideas` :

```
Columns: Draft | Review | Approved | Scheduled | Published | Archived
Cards: titre, platform badge, priority dot, updated date
Drag-and-drop: déplacer une carte change son status via server action
```

---

## Phase 3 — Écosystème Solo créateur

### S1 — Brand Kit complet
Page `/app/settings/brand` opérationnelle avec :
- Upload logo (principal + dark + favicon)
- Palette de couleurs (primary, secondary, accent)
- Polices (Google Fonts picker)
- Bio / tagline (utilisé comme contexte dans les prompts AI)
- Voix de marque (ton : professionnel / décontracté / humoristique) → injecté dans Ollama system prompt

---

### S2 — Script Studio (éditeur enrichi)
`/app/ideas/[id]` — onglet "Script" refonte :

- **Tiptap** (déjà installé) avec toolbar complète
- Blocs spéciaux : `[HOOK]` `[B-ROLL]` `[CTA]` `[PAUSE]`
- Compteur de mots / temps de lecture estimé
- Export `.txt` / `.docx` / PDF
- Mise en page téléprompter (plein écran, grande police, défilement auto)
- AI inline : sélectionner un paragraphe → "Reformuler" / "Raccourcir" / "Traduire"

---

### S3 — Médiathèque unifiée
`/app/assets` refonte totale :

```
Categories: Logos | Music | B-roll | Templates | Captions | Fonts
├── Upload drag-and-drop zone
├── Preview inline (image, audio player, video thumbnail)
├── Tags + recherche
├── Utilisation : "utilisé dans 3 posts"
└── Favoris
```

---

### S4 — Templates de contenu
`/app/templates` — bibliothèque de formats sauvegardés :

- Format YouTube long (intro → segments → CTA)
- Format TikTok vertical (hook 3s → valeur → CTA)
- Format LinkedIn post (story → insight → question)
- Créer depuis un post existant : "Sauvegarder comme template"
- Appliquer à une nouvelle idée : pré-remplir le script avec la structure

---

### S5 — Objectifs et streaks
`/app/dashboard` — widget motivation :

- Objectif hebdomadaire (ex : "3 posts/semaine")
- Progression visuelle (progress bar + streak count)
- Rappel si aucune activité depuis 48h (notification in-app)
- Statistiques personnelles : "Cette semaine vs semaine dernière"

---

### S6 — Inspirations & Trends
`/app/ideas/trends` — nouveau module :

- Trending topics par plateforme (via ScrapeGraph + APIs publiques)
- "Générer une idée depuis ce trend" → appel Ollama
- Sauvegarde de références (lien YouTube, TikTok, article)
- Tableau de veille concurrentielle (URLs de chaînes à surveiller)

---

## Phase 4 — Écosystème Agence / Équipe

### A1 — Multi-workspace avec invitation
**Prérequis absolu pour les agences.**

```
Architecture:
- Un compte = plusieurs workspaces (ex: "Agence Dupont", "Client Apple", "Client Nike")
- Invitation par email → token signé → `workspace_members` table
- Rôles: Owner | Admin | Editor | Reviewer | Client (read-only)
```

Tables à créer :
```sql
workspaces (id, name, logo_url, plan, created_at)
workspace_members (workspace_id, user_id, role, invited_at, accepted_at)
users (id, email, full_name, avatar_url, created_at)
```

Middleware Next.js : lire `workspace_id` depuis session JWT, pas de constante hardcodée.

---

### A2 — Portail client (Client Portal)
**Le différenciateur clé pour les agences.**

URL dédiée : `https://clavio.yoursite.com/client/[token]`

Le client voit :
- Posts en attente d'approbation
- Commentaires inline sur chaque post
- Bouton "Approuver" / "Demander modification"
- Historique des publications
- Métriques simples (pas les données internes)

Sans compte — accès par lien sécurisé (magic link ou token URL).

---

### A3 — Flux d'approbation (Approval workflow)
**Essentiel pour le travail en équipe.**

```
Idée → Script écrit → Review interne → Client review → Approved → Schedule
         Editor        Senior/Admin     Client portal    Auto-post
```

Statuts enrichis dans `idea_variants` et `posts` :
- `pending_review` → assigné à un reviewer interne
- `pending_client` → envoyé au portail client
- `approved` → prêt à planifier
- `revision_requested` → revenir à l'éditeur avec commentaire

Notifications : in-app + email (Resend ou Nodemailer) à chaque changement de statut.

---

### A4 — Commentaires et annotations
**Feedback collaboratif directement sur le contenu.**

```
Posts : commentaires inline sur le caption (type Google Docs)
Videos : annotations sur la timeline (ex: "ce passage à 1:23 est trop long")
Images : annotations sur la zone cliquée (type Figma comment)
```

Table : `comments (id, entity_type, entity_id, author_id, content, position_json, resolved, created_at)`

---

### A5 — Rapports et exports pour clients
**Les agences doivent prouver leur ROI.**

`/app/reports` — nouveau module :

- Rapport mensuel auto-généré (PDF) avec métriques par plateforme
- Comparaison mois sur mois
- Export CSV des métriques brutes
- Rapport brandé (logo client en-tête)
- Partage direct par lien (URL temporaire 30 jours)

Stack : `@react-pdf/renderer` ou Puppeteer screenshot + PDF.

---

### A6 — Gestion des clients
`/app/clients` — CRM léger :

- Fiche client (nom, logo, contacts, brief de marque)
- Workspaces liés au client
- Budgets et heures (optionnel)
- Historique des livrables

---

### A7 — Automatisations avancées (Workflow builder)
Étendre `/app/automations` avec un builder visuel simple :

```
Trigger: "Quand une idée est approuvée"
  → Action 1: Générer un variant avec Ollama
  → Action 2: Notifier le client
  → Condition: Si client approuve
    → Action 3: Planifier le post à 09:00 le lundi suivant
```

Intégration n8n : importer/exporter des workflows JSON.

---

## Phase 5 — Intégrations plateformes

### I1 — Publication native (sans n8n pour les bases)

| Plateforme | API | Priorité |
|------------|-----|----------|
| YouTube Data API v3 | Upload video + thumbnail + description | P1 |
| Instagram Graph API | Publish Reels / carousel / post | P1 |
| TikTok Content Posting API | Upload vidéo | P1 |
| LinkedIn API | Post texte + image + vidéo | P2 |
| X (Twitter) API v2 | Tweet + thread | P2 |
| Pinterest API | Pin | P3 |

Route : `POST /api/platforms/[platform]/publish` — wrapper de l'API officielle.

---

### I2 — OAuth réel pour les intégrations
`/api/auth/callback/[provider]` actuellement stub. Implémenter :

```
/api/auth/youtube → Google OAuth 2.0 → store token chiffré dans integrations
/api/auth/instagram → Meta OAuth → store token
/api/auth/tiktok → TikTok OAuth → store token
```

Token refresh automatique via cron `POST /api/cron/refresh-tokens`.

---

### I3 — Sync métriques automatique
Cron configuré via `vercel.json` :

```json
{
  "crons": [
    { "path": "/api/cron/metrics-sync", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/cleanup", "schedule": "0 2 * * *" },
    { "path": "/api/cron/refresh-tokens", "schedule": "0 1 * * *" }
  ]
}
```

---

### I4 — Stockage cloud
Actuellement Supabase Storage (local). Pour la production :

- **Cloudflare R2** (S3-compatible, pas d'egress fees) — recommandé
- **Bunny CDN** pour la livraison vidéo
- Migration : changer l'URL de bucket dans `.env.production`

---

### I5 — Email transactionnel
Notifications par email pour :
- Invitation workspace
- Approbation requise (client portal)
- Rapport hebdomadaire
- Alerte d'échec de publication

Stack recommandé : **Resend** (SDK TypeScript, gratuit à 3k emails/mois).

---

## Phase 6 — Performance & Infrastructure

### Perf 1 — Optimisation des images
- `next/image` avec `sizes` et `priority` sur les images above-the-fold
- Thumbnails vidéo : générer via FFmpeg au moment de l'upload, stocker en Supabase Storage
- Avatar utilisateur : resize automatique à 128×128

### Perf 2 — Pagination des listes
Toutes les listes (ideas, posts, videos, clips) sont unbounded.
Ajouter cursor-based pagination :

```tsx
// Composant: components/pagination.tsx
// Paramètre: ?cursor=<timestamp> ou ?page=<n>
// Limit: 25 items par page
```

### Perf 3 — Cache des données statiques
`getDictionary()` est appelé à chaque requête — mettre en cache :

```ts
// lib/i18n/server.ts
import { unstable_cache } from 'next/cache'
export const getDictionary = unstable_cache(
  async () => { /* ... */ },
  ['dictionary'],
  { revalidate: 3600 }
)
```

### Perf 4 — React Query / SWR pour les données client
Les composants client actuels (`NotificationCenter`, `RenderTab`) font des fetch manuels.
Migrer vers SWR pour la déduplification, le cache et le retry automatique :

```bash
npm install swr
```

### Perf 5 — Bundle analysis
```bash
npm install @next/bundle-analyzer
ANALYZE=true npm run build
```

Cibles à optimiser :
- `recharts` (heavy) → lazy load uniquement sur la page Analytics
- `@tiptap/*` → lazy load uniquement sur la page IdeaEditor
- `framer-motion` → vérifier si réellement utilisé

---

## Phase 7 — Sécurité production

### Sec 1 — Sanitize les inputs utilisateur
Toutes les inputs texte (titre idée, caption, nom workspace) passent directement en DB.
Ajouter validation avec `zod` :

```bash
npm install zod
```

```ts
const IdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  platform: z.enum(['youtube', 'tiktok', 'instagram', 'linkedin', 'twitter']).optional(),
})
```

### Sec 2 — Rate limiting sur les API routes
Les routes `/api/ideas/generate` et `/api/videos/transcribe` appellent des LLM locaux.
Sans rate limiting, un bot peut saturer les ressources.

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Sec 3 — Content Security Policy
Ajouter headers dans `next.config.ts` :

```ts
headers: [{ key: 'Content-Security-Policy', value: "default-src 'self'; ..." }]
```

### Sec 4 — Audit des données sensibles
- Tokens OAuth → chiffrer avec `crypto.createCipheriv` avant stockage en DB
- Webhook secrets → ne jamais logger
- `payload_json` dans `logs` → filtrer les champs sensibles avant insertion

---

## Phase 8 — Expérience utilisateur avancée

### UX 1 — Onboarding interactif (tour produit)
Après l'onboarding wizard, proposer un tour guidé interactif :

```
"Créez votre première idée" → highlight bouton + tooltip
"Générez un variant AI" → guide vers le bouton Sparkles
"Planifiez votre post" → guide vers Publishing
```

Stack : `driver.js` ou implémentation custom avec portails React.

### UX 2 — Mode Focus (Distraction-free writing)
Sur `/app/ideas/[id]` → bouton "Mode Focus" :

- Cache la sidebar et la topbar
- Éditeur plein écran avec fond blanc pur
- Compteur de mots flottant
- Timer Pomodoro optionnel
- ESC pour sortir

### UX 3 — Prévisualisation post (par plateforme)
Avant de publier, voir à quoi ressemble le post sur chaque plateforme :

```
Instagram preview → carré 1080×1080 avec caption + hashtags
TikTok preview → vertical 9:16 avec overlay
LinkedIn preview → post card avec avatar + texte
YouTube preview → thumbnail + titre + description
```

Composant : `components/post-preview.tsx` — frames mockup SVG + contenu réel.

### UX 4 — Raccourcis de création rapide
Floating action button (FAB) sur mobile :

```
FAB (+) → bottom-right
├── Nouvelle idée
├── Importer vidéo
└── Nouveau post
```

### UX 5 — Historique des modifications (Audit trail)
Chaque entité doit avoir un historique visible :

```
Idée "Marketing Q3"
├── 14 mai 14:32 — Créée
├── 14 mai 15:10 — Titre modifié
├── 15 mai 09:45 — Variant généré
└── 15 mai 10:00 — Envoyée en review
```

Utiliser la table `logs` existante avec `entity_type` + `entity_id` comme filtre.

### UX 6 — Notifications push (PWA)
Enregistrer un service worker pour les notifications push :

```
"Votre post a été publié ✅"
"Render terminé — télécharger le clip"
"Client a approuvé le contenu"
```

`next-pwa` + Web Push API + VAPID keys.

### UX 7 — Thèmes de couleur workspace
Chaque workspace peut choisir sa couleur d'accent :

```
Blue (défaut) | Purple | Orange | Green | Rose
```

La couleur primaire remplace `#60A5FA` partout via CSS custom property :
```css
:root { --primary: 60 130 246; }
```

---

## Backlog technique

| Tâche | Priorité | Effort |
|-------|----------|--------|
| `npm install` + `npm run build` passant | 🔴 Critique | 30min |
| Migration SQL `20260510` — indexes perf | 🟠 Haute | 1h |
| Tests E2E Playwright (pipeline critique) | 🟠 Haute | 2j |
| Tests unitaires server actions | 🟡 Moyenne | 1j |
| Storybook pour le design system | 🟡 Moyenne | 1j |
| Remotion package install ou retrait | 🟠 Haute | 2h |
| Python scripts Clipify (analyze.py etc.) | 🟠 Haute | 3j |
| Documentation API (OpenAPI / Swagger) | 🟡 Moyenne | 1j |
| `WORKSPACE_ID` → session cookie | 🟠 Haute | 4h |

---

## Roadmap versions

```
v0.3.0 (court terme)
├── ⌘K Command palette
├── loading.tsx sur toutes les routes
├── Mobile responsive complet
├── Content Calendar drag & drop
├── Detail slide-over panels
└── Toast undo pattern

v0.4.0 (moyen terme)
├── Onboarding wizard
├── Brand Kit complet
├── Script Studio (téléprompter, export)
├── Post preview par plateforme
├── Dark mode complet

v0.5.0 (agences)
├── Multi-workspace + invitation
├── Client portal
├── Approval workflow
├── Commentaires inline
├── Rapports PDF

v1.0.0 (production)
├── OAuth réel (YouTube, Instagram, TikTok)
├── Zod validation sur toutes les mutations
├── Rate limiting
├── Sentry monitoring
├── Cron Vercel pour métriques
├── Tests E2E passants
└── Documentation complète
```

---

_Clavio vise à être le meilleur outil de création de contenu pour les indépendants et les équipes — simple pour débuter, puissant pour scaler._
