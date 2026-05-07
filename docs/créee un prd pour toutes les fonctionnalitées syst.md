<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# créee un prd pour toutes les fonctionnalitées systemes et outils (je veux que du self-hosted ou 100% gratuit)

Oui — voici la **version PRD structurée complète** de **Clavio**, en mode **100% self-hosted ou gratuit**, sans auth dans la première version, et pensée comme une vraie base de SaaS de production.[^1][^2][^3]

## 1) Vision Produit

### Nom

**Clavio**

### Promesse

Clavio est un système de création de contenu bilingue pour créateurs anglais/français, conçu pour transformer une idée en publication sans multiplier les outils.

### Objectif business

Créer un SaaS simple à comprendre, puissant à utiliser, et entièrement opérable sur une infrastructure self-hosted ou free-tier.

### Contraintes non négociables

- Aucun outil payant obligatoire.
- Aucun service SaaS indispensable au fonctionnement principal.
- Aucun auth dans v1.
- Pas de mock data en production.
- Toutes les données visibles viennent de la base ou des services connectés.[^4][^1]

***

## 2) Product Principles

### Principes fondateurs

1. **Self-hosted first**: chaque brique possible doit pouvoir tourner chez toi.
2. **Free-tier compatible**: si un service externe existe, il doit avoir une alternative gratuite ou localement remplaçable.
3. **Single workspace**: pas de comptes utilisateurs au début.
4. **Operational UI**: chaque page doit servir une action réelle.
5. **Bilingual by design**: UI et contenus doivent pouvoir fonctionner en anglais et en français.
6. **Live data only**: aucune carte décorative remplie à la main.

### Conséquence produit

Le produit doit être conçu comme un **orchestrateur de pipeline** plus qu’un “editor”. Le but est de connecter les modules ensemble de façon fiable, répétable, observable.

***

## 3) Scope Fonctionnel

### Module A — Ideation

Permettre de créer, générer, enrichir et structurer des idées de contenu.

### Module B — Video Processing

Permettre d’uploader, transcrire, détecter, découper, rendre et exporter des vidéos.

### Module C — Publishing

Permettre de préparer, programmer, publier et dupliquer des contenus sur plusieurs plateformes.

### Module D — Analytics

Permettre d’analyser les performances des contenus et d’alimenter le prochain cycle de création.

### Module E — Assets

Permettre de stocker et réutiliser les éléments de marque.

### Module F — Automations

Permettre de voir, exécuter, relancer et déboguer les workflows.

### Module G — Integrations

Permettre de connecter les outils locaux ou gratuits nécessaires au système.

### Module H — Logs

Permettre un suivi technique et opérationnel complet.

***

## 4) Stack Technique Autorisée

### Frontend

- Next.js
- Shadcn/UI
- Tailwind CSS
- Geist / Geist Mono via `next/font`.[^5]


### Backend

- Supabase Postgres
- Supabase Storage
- Server Actions ou Route Handlers
- RLS activé sur les tables exposées.[^3]


### Automation

- n8n self-hosted.[^1]
- éventuellement Node-RED ou Huginn comme alternatives self-hosted si nécessaire.[^6][^7]


### Video

- Remotion pour render programmatique.[^2]
- FFmpeg pour traitement bas niveau.


### AI / Local

- Ollama ou autre LLM local gratuit.
- Whisper local pour transcription.

***

## 5) Architecture Produit

### Flux central

`Idea -> Variant -> Script -> Video Job -> Clip -> Render Job -> Post -> Metrics -> Insight`

### Règle système

Chaque objet de contenu doit pouvoir évoluer d’un état à un autre sans perdre l’historique. Le système doit garder la trace des transitions, des erreurs, des retries, et des outputs produits.

### Règle d’interface

Chaque page du produit doit afficher:

- le statut courant,
- la prochaine action possible,
- les erreurs éventuelles,
- les objets liés,
- les logs associés.

***

## 6) Pages et Fonctions

### Dashboard

Montre:

- tâches urgentes,
- rendus en cours,
- posts à publier,
- erreurs système,
- performance récente.

Actions:

- ouvrir l’élément,
- approuver,
- relancer,
- publier,
- corriger.


### Ideas

Montre:

- liste d’idées,
- filtres,
- statut,
- source,
- format,
- platform,
- priorité.

Actions:

- générer,
- éditer,
- convertir,
- archiver.


### Idea Detail

Montre:

- titre,
- hook,
- angle,
- CTA,
- script,
- notes,
- historique.

Actions:

- créer variante,
- envoyer au module vidéo,
- envoyer au planning.


### Videos

Montre:

- uploads,
- durées,
- transcriptions,
- clips détectés,
- rendus.

Actions:

- transcrire,
- détecter clips,
- éditer coupe,
- rendre,
- exporter.


### Publishing

Montre:

- drafts,
- scheduled,
- published,
- failed.

Actions:

- programmer,
- publier maintenant,
- dupliquer,
- éditer.


### Analytics

Montre:

- KPIs,
- top posts,
- trends,
- platform performance,
- hook performance.

Actions:

- filtrer,
- comparer,
- exporter.


### Assets

Montre:

- templates,
- logos,
- B-roll,
- musiques,
- overlays.


### Automations

Montre:

- workflows,
- runs,
- success rate,
- errors,
- retries.


### Integrations

Montre:

- providers,
- status,
- config,
- sync health.


### Logs

Montre:

- erreurs,
- events,
- payloads,
- timestamps,
- source.

***

## 7) Data Model

### Tables principales

- `ideas`
- `idea_variants`
- `videos`
- `transcripts`
- `clips`
- `render_jobs`
- `posts`
- `post_metrics`
- `assets`
- `workflow_runs`
- `integrations`
- `logs`
- `settings`


### Relations

- Une idée peut générer plusieurs variantes.
- Une vidéo peut générer plusieurs clips.
- Un clip peut générer plusieurs render jobs.
- Un post peut avoir plusieurs snapshots de métriques.
- Un workflow run peut être attaché à n’importe quel objet métier.

***

## 8) PRD par Fonctionnalité

### Ideation

#### Objectif

Générer et organiser les idées de contenu.

#### Entrées

- texte libre,
- transcript,
- keyword,
- campagne,
- template.


#### Sorties

- idée,
- variante,
- script,
- carousel outline,
- post draft.


#### Exigences

- génération multi-variantes,
- scoring,
- tags,
- statut,
- historique.


### Video Processing

#### Objectif

Transformer une vidéo longue en assets exploitables.

#### Entrées

- upload local,
- URL,
- fichier importé.


#### Étapes

1. Upload.
2. Stockage.
3. Transcription.
4. Détection des segments.
5. Sélection des clips.
6. Render.
7. Export.

#### Exigences

- retry,
- status par étape,
- preview,
- logs.


### Publishing

#### Objectif

Distribuer le contenu.

#### Sorties

- drafts,
- scheduled posts,
- published posts.


#### Exigences

- multi-platform,
- versioning,
- duplication,
- approval flow.


### Analytics

#### Objectif

Transformer les résultats en signal.

#### Exigences

- charts,
- tables,
- comparisons,
- summary insights,
- trend detection.


### Automations

#### Objectif

Exposer la mécanique système.

#### Exigences

- logs,
- retries,
- run history,
- failure reasons,
- trigger definitions.


### Assets

#### Objectif

Réutilisation rapide.

#### Exigences

- upload,
- preview,
- tagging,
- search,
- template linking.

***

## 9) Tooling PRD

### Self-hosted Required Tools

- Next.js app.
- Supabase local or self-hosted alternative.
- n8n self-hosted.[^1]
- FFmpeg local.
- Remotion local.[^2]
- Whisper local.
- Ollama local.


### Free Alternative Philosophy

If a tool cannot be self-hosted, it must have:

- a free tier,
- or a local replacement,
- or it is excluded from v1.


### Forbidden in v1

- paid auth provider,
- paid automation platform,
- paid video SaaS dependency,
- paid content scheduler dependency if not self-hostable.

***

## 10) UX and Interface Requirements

### Global layout

- left sidebar,
- top bar,
- centered working canvas,
- optional right inspector.


### Card rules

- all cards white,
- minimal border,
- consistent padding,
- compact headings,
- exact spacing scale.


### Font rules

- Geist for UI.
- Geist Mono for technical values.[^5]


### Empty states

- must be real,
- must explain what to do next,
- must not pretend data exists.


### Error states

- visible,
- actionable,
- retryable,
- linked to logs.

***

## 11) Execution Rules

### State Machine

Each core entity has:

- `draft`
- `processing`
- `review`
- `scheduled`
- `published`
- `failed`
- `archived`


### Required metadata

Every record needs:

- `created_at`
- `updated_at`
- `status`
- `source`
- `workspace_id`


### Observability

Every automation step writes to `workflow_runs`. Every failure writes to `logs`. Every publish writes to `posts` and later `post_metrics`.

***

## 12) V1 Definition

### Included

- no auth,
- one workspace,
- idea management,
- video pipeline,
- publishing queue,
- analytics,
- assets,
- automations,
- logs.


### Excluded

- billing,
- team management,
- permissions,
- account switching,
- auth flows.

This reduces breakage and keeps the first usable release focused.

***

## 13) Acceptance Criteria

A feature is complete only if:

- it has a DB table or query source,
- it appears in the UI through live data,
- it has loading, empty, error, success states,
- it can be traced in logs,
- it can be retried if it fails,
- it fits the light-mode design system.

***

## 14) Final Product Statement

Clavio is a self-hosted-first, bilingual creator operating system that unifies idea generation, video processing, publishing, and analytics into one clean light-mode SaaS.

If you want, I can now convert this into a **real PRD markdown document** with:

- executive summary,
- goals,
- non-goals,
- user stories,
- functional requirements,
- non-functional requirements,
- data model,
- page specs,
- and acceptance criteria.
<span style="display:none">[^10][^11][^12][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://docs.n8n.io/hosting/

[^2]: https://github.com/remotion-dev

[^3]: https://supabase.com/docs/guides/database/postgres/row-level-security

[^4]: https://supabase.com/pricing

[^5]: https://nextjs.org/docs/app/getting-started/fonts

[^6]: https://www.usecollect.com/blog/top-10-open-source-tools-for-workflow-automation/

[^7]: https://selfh.st/apps/

[^8]: https://www.virtualizationhowto.com/2025/10/best-self-hosted-ai-tools-you-can-actually-run-in-your-home-lab/

[^9]: https://www.reddit.com/r/selfhosted/comments/1q21n9b/built_a_localfirst_ai_agent_automation_platform/

[^10]: https://spacelift.io/blog/open-source-automation-tools

[^11]: https://www.reddit.com/r/PleX/comments/ua8g6f/how_to_burn_in_imagebased_subtitles_with_ffmpeg/

[^12]: https://baserow.io/blog/top-ai-productivity-tools-2025

