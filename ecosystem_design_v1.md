# Clavio — Ecosystem Design v1

> Source de vérité architecturale. Décrit l'écosystème complet : services, flux de données, modèle de données, composants UI, et points d'intégration.

---

## 1. Philosophie

Clavio est un **Creator OS** — un centre de contrôle opérationnel pour créateurs de contenu. Chaque pixel visible provient d'une source de données réelle (DB, API, workflow output). Aucun contenu statique, aucune donnée fictive en production.

L'interface doit répondre à cinq questions à tout moment :
- Qu'est-ce qui requiert attention maintenant ?
- Qu'est-ce qui est en cours de traitement ?
- Qu'est-ce qui est planifié ?
- Qu'est-ce qui a échoué ?
- Qu'est-ce qui performe bien ?

---

## 2. Services de l'Écosystème

### 2.1 Couche Applicative

| Service | Rôle | Port | Mode |
|---|---|---|---|
| **Next.js 15** | Frontend + API Routes + Server Actions | 3000 | App Router |
| **Supabase (local)** | Postgres + Storage + Realtime | 54321 | Self-hosted |
| **n8n** | Moteur d'automatisation des workflows | 5678 | Docker |
| **Cobalt** | Importation de médias TikTok / YouTube / Instagram | 9001 | Docker |
| **Remotion** | Rendu vidéo React-based | — | Library |
| **Ollama** | LLM local pour génération d'idées et scripts | 11434 | Local |
| **Whisper** | Transcription audio/vidéo locale | — | Local binary |
| **FFmpeg** | Traitement bas niveau audio/vidéo | — | System binary |

### 2.2 Responsabilités par Service

**Next.js**
- Rendu SSR/SSG des pages opérationnelles
- Server Actions pour toutes les mutations
- API Routes pour webhooks et tâches cron
- Réception des événements Realtime Supabase

**Supabase**
- Base de données relationnelle (13 tables core)
- Stockage des fichiers vidéo, assets, exports
- Canaux Realtime pour synchronisation UI live
- RLS activé sur toutes les tables exposées

**n8n**
- Orchestration des workflows multi-étapes
- Déclencheurs : webhook entrant, cron, événement DB
- Appels sortants vers Ollama, Whisper, FFmpeg, Cobalt
- Écriture du résultat dans `workflow_runs` et `logs`

**Cobalt**
- Reçoit une URL de média social
- Télécharge et retourne le fichier brut
- Le fichier est ensuite stocké dans Supabase Storage

**Remotion**
- Composition React montée à la demande
- Rendu déclenché via `render_jobs`
- Export MP4 stocké dans Supabase Storage

**Ollama**
- Modèle LLM local (ex. Llama 3, Mistral)
- Génération d'idées de contenu
- Expansion de scripts et variantes
- Analyse de performance pour suggestions

**Whisper**
- Transcription de la piste audio d'une vidéo
- Sortie : texte brut + timestamps stockés dans `transcripts`
- Déclenché automatiquement après import vidéo

---

## 3. Pipeline de Données Central

```
[URL externe]
     │
     ▼
  Cobalt (import)
     │ fichier brut
     ▼
Supabase Storage ──────────────────────┐
     │                                 │
     ▼                                 │
 videos (DB)                           │
     │                                 │
     ▼                                 │
Whisper (transcription)                │
     │                                 │
     ▼                                 │
transcripts (DB)                       │
     │                                 │
     ▼                                 │
n8n → Ollama (clip suggestions)        │
     │                                 │
     ▼                                 │
  clips (DB)                           │
     │ (approbation utilisateur)       │
     ▼                                 │
render_jobs (DB)                       │
     │                                 │
     ▼                                 │
Remotion / FFmpeg (rendu)              │
     │                                 │
     ▼                                 │
Supabase Storage ◄─────────────────────┘
     │ (fichier rendu)
     ▼
  posts (DB)
     │ (scheduling)
     ▼
  Publication API (TikTok / YT / IG)
     │
     ▼
post_metrics (DB)
     │
     ▼
n8n → Ollama (analyse + insights)
     │
     ▼
ideas (DB) ◄── boucle de rétroaction
```

### Pipeline Idées

```
[Prompt utilisateur]
     │
     ▼
n8n → Ollama (génération)
     │
     ▼
  ideas (DB)
     │
     ▼
idea_variants (DB)  ←──  expansion manuelle ou automatique
     │
     ▼
  posts (DB)  ←──  validation utilisateur + scheduling
```

---

## 4. Modèle de Données

### 4.1 Champs Universels

Chaque table possède obligatoirement :

```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id uuid NOT NULL
status       text NOT NULL
created_at   timestamptz DEFAULT now()
updated_at   timestamptz DEFAULT now()
```

### 4.2 Tables Core

#### `ideas`
```
id, workspace_id, title, hook, platform, format,
source (manual|ai|import), status, tags[], score,
created_at, updated_at
```

#### `idea_variants`
```
id, workspace_id, idea_id (→ ideas),
title, script, angle, hook_variant,
status, created_at, updated_at
```

#### `videos`
```
id, workspace_id, title, source_url, storage_path,
duration_seconds, platform, status,
import_job_id, cobalt_response,
created_at, updated_at
```

#### `transcripts`
```
id, workspace_id, video_id (→ videos),
raw_text, segments (jsonb [{start, end, text}]),
language, model_version, status,
created_at, updated_at
```

#### `clips`
```
id, workspace_id, video_id (→ videos),
transcript_id (→ transcripts),
start_seconds, end_seconds, title, hook,
score, approved_at, status,
created_at, updated_at
```

#### `render_jobs`
```
id, workspace_id, clip_id (→ clips),
template_id, composition_props (jsonb),
output_path, duration_seconds,
remotion_version, status,
started_at, completed_at,
created_at, updated_at
```

#### `posts`
```
id, workspace_id, idea_variant_id (→ idea_variants),
render_job_id (→ render_jobs),
platform, caption, hashtags[],
scheduled_at, published_at,
platform_post_id, status,
created_at, updated_at
```

#### `post_metrics`
```
id, workspace_id, post_id (→ posts),
platform, views, likes, comments, shares,
watch_time_seconds, completion_rate,
synced_at, created_at, updated_at
```

#### `assets`
```
id, workspace_id, type (logo|music|broll|template|font),
name, storage_path, metadata (jsonb),
tags[], status, created_at, updated_at
```

#### `workflow_runs`
```
id, workspace_id, workflow_name, trigger_type,
input_payload (jsonb), output_payload (jsonb),
n8n_execution_id, status,
started_at, completed_at,
created_at, updated_at
```

#### `integrations`
```
id, workspace_id, provider (tiktok|youtube|instagram|n8n|cobalt|ollama),
credentials (jsonb encrypted), scopes[],
last_sync_at, health_status, status,
created_at, updated_at
```

#### `logs`
```
id, workspace_id, entity_type, entity_id,
event (start|success|failure|retry|output|publish_result|provider_error),
level (info|warn|error), message,
metadata (jsonb), created_at
```

#### `settings`
```
id, workspace_id, key, value (jsonb),
category (workspace|brand|publishing|system),
created_at, updated_at
```

### 4.3 Machine à États par Entité

| État | `ideas` | `videos` | `clips` | `render_jobs` | `posts` |
|---|---|---|---|---|---|
| `draft` | ✓ | ✓ | ✓ | — | ✓ |
| `processing` | — | ✓ | — | ✓ | — |
| `review` | ✓ | ✓ | ✓ | — | ✓ |
| `scheduled` | — | — | — | — | ✓ |
| `published` | — | — | — | — | ✓ |
| `failed` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `archived` | ✓ | ✓ | ✓ | — | ✓ |

---

## 5. Routes API

### 5.1 Idées

| Route | Méthode | Action |
|---|---|---|
| `/api/ideas/generate` | POST | n8n → Ollama → `ideas` |
| `/api/ideas/expand` | POST | Ollama → `idea_variants` |

### 5.2 Vidéos

| Route | Méthode | Action |
|---|---|---|
| `/api/videos/upload` | POST | Supabase Storage → `videos` |
| `/api/videos/transcribe` | POST | Whisper → `transcripts` |
| `/api/videos/clip` | POST | Ollama → `clips` |
| `/api/videos/render` | POST | Remotion → `render_jobs` |

### 5.3 Publication

| Route | Méthode | Action |
|---|---|---|
| `/api/posts/schedule` | POST | `posts` status=scheduled |
| `/api/posts/publish` | POST | Platform API → `posts` status=published |

### 5.4 Métriques & Infrastructure

| Route | Méthode | Action |
|---|---|---|
| `/api/metrics/sync` | POST | Platform API → `post_metrics` |
| `/api/webhooks/[provider]` | POST | Réception événements externes |
| `/api/cron/[task]` | GET | Tâches planifiées (sync, cleanup) |

---

## 6. Structure UI

### 6.1 Shell Applicatif

```
┌──────────────────────────────────────────────────────┐
│  TopBar (64px sticky)                                │
│  Logo · Workspace · CommandMenu(⌘K) · Status        │
├────────────┬─────────────────────────────────────────┤
│  Sidebar   │  Canvas Principal (padding 24px)        │
│  280px     │                                         │
│  (72px     │  [Contenu de la page active]            │
│  collapsed)│                                         │
│            │                          ┌─────────────┐│
│  Nav       │                          │ Detail Panel ││
│  primaire  │                          │ (optionnel)  ││
│  ─────     │                          └─────────────┘│
│  Nav       │                                         │
│  secondaire│                                         │
│  ─────     │                                         │
│  Footer    │                                         │
└────────────┴─────────────────────────────────────────┘
```

### 6.2 Navigation Sidebar

**Primaire**
- Dashboard `/app/dashboard`
- Ideas `/app/ideas`
- Videos `/app/videos`
- Publishing `/app/publishing`
- Analytics `/app/analytics`

**Secondaire**
- Assets `/app/assets`
- Automations `/app/automations`
- Integrations `/app/integrations`
- Logs `/app/logs`
- Settings `/app/settings`

**Footer Sidebar**
- Nom du workspace
- Badge d'environnement (dev / prod)
- Dernier sync
- Indicateur de santé des services

### 6.3 Pages et Leur Source de Données

| Page | Source primaire | Composants clés |
|---|---|---|
| `/app/dashboard` | `workflow_runs`, `render_jobs`, `posts`, `post_metrics` | `MetricCard`, `TaskCard`, `StatusBadge` |
| `/app/ideas` | `ideas`, `idea_variants` | `DataTable`, `DetailDrawer`, `FilterBar` |
| `/app/ideas/[id]` | `ideas`, `idea_variants`, `logs` | `WorkflowTimeline`, `StatusBadge` |
| `/app/videos` | `videos`, `transcripts`, `clips` | `ClipCard`, `RenderStatusCard` |
| `/app/videos/[id]` | `videos`, `transcripts`, `clips`, `render_jobs` | `WorkflowTimeline`, `DetailDrawer` |
| `/app/publishing` | `posts`, `render_jobs` | `PublishCalendar`, `DataTable` |
| `/app/publishing/[id]` | `posts`, `post_metrics` | `MetricCard`, `StatusBadge` |
| `/app/analytics` | `post_metrics`, `posts`, `ideas` | `MetricCard`, `DataTable` |
| `/app/assets` | `assets` | `DataTable`, `FilterBar` |
| `/app/automations` | `workflow_runs`, `integrations` | `WorkflowTimeline`, `StatusBadge` |
| `/app/integrations` | `integrations` | `StatusBadge`, `MetricCard` |
| `/app/logs` | `logs` | `LogStream`, `FilterBar`, `DataTable` |
| `/app/settings` | `settings` | Forms Shadcn |

---

## 7. Composants Personnalisés

### 7.1 Shell

| Composant | Source de données | Description |
|---|---|---|
| `AppShell` | — | Wrapper global sidebar + topbar |
| `TopBar` | `integrations.health_status` | Barre supérieure sticky |
| `NavItem` | route active | Élément de navigation sidebar |

### 7.2 Données Opérationnelles

| Composant | Source de données | Description |
|---|---|---|
| `MetricCard` | `post_metrics`, agrégats | Carte KPI avec tendance |
| `TaskCard` | `render_jobs`, `posts` | Tâche urgente avec CTA |
| `StatusBadge` | `*.status` | Badge coloré par état de machine |
| `FilterBar` | — | Filtres et recherche de liste |
| `DataTable` | toute table | Table full-width avec tri/filtre |
| `DetailDrawer` | entité sélectionnée | Panneau contextuel droit |

### 7.3 Workflow & Logs

| Composant | Source de données | Description |
|---|---|---|
| `WorkflowTimeline` | `workflow_runs`, `logs` | Timeline verticale des étapes |
| `LogStream` | `logs` | Flux de logs filtrable en temps réel |
| `RealtimeStatus` | Supabase Realtime | Indicateur de connexion live |

### 7.4 Vidéo & Publication

| Composant | Source de données | Description |
|---|---|---|
| `ClipCard` | `clips` | Prévisualisation d'un clip avec timestamps |
| `RenderStatusCard` | `render_jobs` | Progression du job de rendu |
| `PublishCalendar` | `posts` | Calendrier de publication |
| `PreviewDrawer` | `render_jobs.output_path` | Prévisualisation du rendu final |

### 7.5 États Système

| Composant | Usage |
|---|---|
| `EmptyState` | Liste vide — toute page |
| `ErrorState` | Erreur de chargement — toute page |
| `Skeleton` (Shadcn) | Chargement — toute liste/carte |

---

## 8. Système de Design

### 8.1 Couleurs

| Token | Hex | Usage |
|---|---|---|
| Background | `#F8FAFC` | Surface principale canvas |
| Card | `#FFFFFF` | Cartes et panneaux |
| Border | `#E2E8F0` | Séparateurs, contours |
| Primary | `#60A5FA` | Actions, liens, accents |
| Primary Hover | `#3B82F6` | État survol boutons |
| Primary Strong | `#1D4ED8` | Actions de force |
| Text | `#0F172A` | Corps de texte principal |

### 8.2 Typographie

| Niveau | Taille | Poids | Tracking | Usage |
|---|---|---|---|---|
| Page Title | 24–28px | 600 | -0.02em | H1 de page |
| Section | 16–18px | 600 | normal | En-têtes de section |
| Card Title | 14–16px | 500–600 | normal | Titres de carte |
| Body | 14px | 400 | normal | Contenu courant |
| Caption / Meta | 12px | 400 | normal | Labels, timestamps |
| Mono | 12–13px | 400 | normal | Valeurs techniques, logs |

**Polices :** `Geist` (UI) · `Geist Mono` (valeurs techniques) — chargées via `next/font`.

### 8.3 Layout

| Élément | Valeur |
|---|---|
| Sidebar étendue | 280px |
| Sidebar réduite | 72px |
| TopBar | 64px |
| Canvas padding | 24px |
| Border radius card | 8px (rounded-lg) |
| Border radius button | 6px (rounded-md) |

### 8.4 Mode

**Light mode uniquement.** Surfaces blanc/off-white, ombres minimes, bordures subtiles. Atmosphère : calme, premium, salle de contrôle opérationnelle.

---

## 9. Règles de Logging

Chaque workflow doit émettre des événements dans `logs` :

| Événement | Déclencheur |
|---|---|
| `start` | Début de l'opération |
| `success` | Opération réussie avec output |
| `failure` | Échec avec message d'erreur |
| `retry` | Tentative de ré-essai avec raison |
| `output` | Lien vers le fichier produit (Storage path) |
| `provider_error` | Erreur de l'API externe (TikTok, YouTube, etc.) |
| `publish_result` | Résultat complet de la publication (platform_post_id) |

Tous les logs sont consultables depuis `/app/logs` avec filtres : `entity_type`, `level`, `event`, plage de dates.

---

## 10. Contraintes v1

| Catégorie | Règle |
|---|---|
| Auth | Aucune — workspace unique, pas de login |
| Monétisation | Aucune — pas de billing, pas de plans |
| Équipe | Aucune — pas de permissions, pas de multi-user |
| Dépendances | Zéro SaaS payant requis en core |
| Données | Zéro contenu hardcodé ou mocké en production |
| RLS | Activé sur toutes les tables Supabase exposées |
| TypeScript | Types explicites partout — pas de `any` |
| Internationalisation | Bilinguisme EN/FR via `I18nProvider` |

---

## 11. Boucle de Rétroaction Analytics

Les métriques de performance alimentent directement la génération d'idées :

```
post_metrics (vues, rétention, engagement)
     │
     ▼
n8n → Ollama (analyse des top performers)
     │  "Les hooks de type [X] ont 3× plus de rétention"
     ▼
ideas (DB) ← nouvelles idées biaisées par ce qui performe
```

Cette boucle transforme Clavio d'un outil de publication en un système d'apprentissage continu.

---

*Version : v1 · Dernière mise à jour : 2026-05-07 · Statut : Actif*
