# Clavio — Étapes restantes (après v0.1.0)

## ✅ Déjà complété dans cette session

| Système | Fichiers créés |
|---|---|
| Smart Worker — Ollama | `/api/ideas/generate`, `/api/ideas/expand` |
| Smart Worker — Whisper | `/api/videos/transcribe`, `/api/videos/clip` |
| Render Engine | `/api/videos/render`, `remotion/ClavioClip.tsx` |
| Automation Bridge | `/api/posts/publish`, `/api/webhooks/[provider]` |
| Storage Orchestrator | `/api/videos/upload` |
| UI connectée | `GenerateIdeasDialog`, `UploadVideoDialog`, `VideoActions`, `RenderClipButton`, `PublishPostButton`, `VideoRowActions` |
| Tiptap SSR Fix | `immediatelyRender: false` ajouté dans `IdeaEditor` |
| Bugfix accessibilité | `CommandDialog` — `VisuallyHidden DialogTitle` ajouté |
| Empty/Error states | Redesign visuel avec gradient + ring + icônes améliorées |

---

## 🔲 Étapes restantes

### Priorité 1 — Seed & migrations

**Fichier à créer : `supabase/seed.sql`**

Insérer des données de test pour toutes les tables :
- 3 `ideas` (draft, review, published)
- 2 `videos` (dont 1 avec transcript + clips)
- 1 `transcript` + 2 `clips` liés à la vidéo
- 3 `posts` (draft, scheduled, published) sur différentes plateformes
- `post_metrics` pour les posts publiés
- 2 `workflow_runs` (1 success, 1 failed)
- 5 `logs` variés
- 2 `assets` (logo, music)
- 1 `integration` par plateforme (instagram, tiktok)

```sql
-- Exemple de structure
INSERT INTO ideas (id, workspace_id, title, ...) VALUES (...);
INSERT INTO videos (id, workspace_id, ...) VALUES (...);
-- etc.
```

---

### Priorité 2 — Responsive (mobile)

**Fichier à modifier : `components/layout/sidebar.tsx`**

- Sur mobile (< 768px) : la sidebar doit se replier en Sheet Radix (déjà prévu avec `Sheet` dans les dépendances)
- Les tables (`DataTable`) : sur mobile, masquer les colonnes secondaires (`format`, `platform`, etc.) avec `hidden sm:table-cell`
- Le dashboard : sur mobile, les deux colonnes (`flex gap-6`) doivent passer en `flex-col`

---

### Priorité 3 — i18n (complétion)

**Fichier à modifier : `lib/i18n/dictionaries.ts`**

Actuellement les chaînes du dashboard, ideas, videos sont en dur en anglais. Étapes :

1. Ajouter dans `dictionaries.ts` les clés manquantes (ex: `ideas.title`, `ideas.generate`, `videos.upload`, etc.)
2. Dans chaque Server Component, importer `getDictionary(locale)` et remplacer les chaînes hardcodées
3. Vérifier que `I18nProvider` est bien wrappé autour de l'app dans `app/app/layout.tsx`

---

### Priorité 4 — Boucle de rétroaction (Analytics → Ideas)

**Nouveau fichier à créer : `app/api/ideas/suggest/route.ts`**

Route POST qui :
1. Récupère les `post_metrics` des 30 derniers posts publiés
2. Calcule le taux d'engagement moyen par type de contenu
3. Envoie ce résumé à Ollama avec le prompt : _"Quels types de contenus performent le mieux ? Génère 3 nouvelles idées dans ce style."_
4. Insère les idées générées avec `source_type = 'analytics_loop'`

Déclencher ce flow depuis `/app/analytics` avec un bouton "Suggest from top performers".

---

### Priorité 5 — Lecteur vidéo dans la page détail

**Fichier à modifier : `app/app/videos/[id]/page.tsx`**

Ajouter un lecteur vidéo natif HTML5 si `storage_path` existe :
- Obtenir une signed URL côté serveur via `supabase.storage.from('videos').createSignedUrl()`
- Afficher `<video controls>` avec la signed URL
- En dessous : timeline des clips avec les marqueurs start/end visuels

---

### Priorité 6 — Page Analytics complète

**Fichier à modifier : `app/app/analytics/page.tsx`**

La page existe mais est vide. À implémenter :
- KPI cards : total views, likes, engagement rate, best platform
- Graphique ligne (Recharts, déjà installé) : views/likes par jour sur 30j
- Tableau des top 5 posts par views
- Section "Hook performance" : grouper les posts par `ideas.pillar` et comparer les moyennes

---

### Priorité 7 — Automations page

**Fichier à modifier : `app/app/automations/page.tsx`**

Actuellement vide. À implémenter :
- Liste des `workflow_runs` avec statut, durée, entité liée
- Bouton "Trigger sync metrics" → appelle `/api/cron/sync-metrics`
- Bouton "Retry failed posts" → appelle `/api/cron/retry-failed-posts`
- Indicateur de santé n8n (ping `N8N_BASE_URL/healthz`)

---

### Priorité 8 — Assets page

**Fichier à modifier : `app/app/assets/page.tsx`**

- Liste des assets depuis la table `assets`
- Upload d'asset (logo, musique, b-roll) vers le bucket `assets` de Supabase Storage
- Filtrage par `asset_type`
- Preview inline pour les images

---

## 🔧 Commandes utiles

```bash
# Démarrer tous les services Docker
docker-compose up -d

# Vérifier que Ollama tourne
curl http://localhost:11434/api/tags

# Vérifier que Whisper tourne
curl http://localhost:9000/

# Appliquer le seed
npx supabase db reset  # ou psql avec le fichier seed.sql

# Build de production
npm run build

# Type check
npx tsc --noEmit
```

---

## 📋 Ordre d'exécution recommandé

1. `supabase/seed.sql` — avoir des données pour tester le reste
2. Responsive sidebar + tables
3. Analytics page (données de test nécessaires)
4. Automations page
5. Assets page
6. Lecteur vidéo
7. i18n
8. Boucle rétroaction (dernière car nécessite analytics)
