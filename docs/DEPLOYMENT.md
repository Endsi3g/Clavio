# Clavio — Guide de Déploiement Complet

> Version : 1.1.0 · Stack : Next.js 15 · Supabase · Ollama · Whisper · n8n · Remotion

---

## Prérequis

| Outil | Version minimale | Installation |
|-------|-----------------|-------------|
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | inclus avec Node |
| Git | 2.x | https://git-scm.com |
| Python | 3.10+ | https://python.org (pour agents) |
| Docker Desktop | 4.x | https://docker.com (pour Whisper) |
| FFmpeg | 6+ | https://ffmpeg.org (pour Clipify) |

---

## 1. Cloner le dépôt

```bash
git clone https://github.com/TON_ORG/clavio.git
cd clavio
npm install
```

---

## 2. Variables d'environnement

Copier et remplir le fichier `.env.local` :

```bash
cp .env.local.example .env.local
```

### Variables obligatoires

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# URL publique de l'app (pour les webhooks n8n)
NEXT_PUBLIC_APP_URL=https://votre-domaine.com

# Workspace ID par défaut (single-tenant)
NEXT_PUBLIC_WORKSPACE_ID=00000000-0000-0000-0000-000000000001
```

### Variables pour les services locaux

```env
# Ollama (génération d'idées)
OLLAMA_BASE_URL=http://127.0.0.1:11434

# Whisper (transcription)
WHISPER_API_URL=http://127.0.0.1:9000

# n8n (automation)
N8N_BASE_URL=http://127.0.0.1:5678
N8N_API_KEY=votre-cle-api-n8n

# Cobalt (import vidéos YouTube)
COBALT_API_URL=http://127.0.0.1:9001
```

### Variables pour les fonctionnalités optionnelles

```env
# Nouvelles (NewsAPI.org — gratuit: 100 req/jour)
NEWS_API_KEY=votre-cle-newsapi

# Stripe (billing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Resend (emails transactionnels)
RESEND_API_KEY=re_...

# Sécurité webhook n8n
WEBHOOK_SECRET=un-secret-aleatoire-long

# Python (override du chemin si nécessaire)
PYTHON_PATH=/usr/bin/python3
```

---

## 3. Supabase — Base de données

### Option A — Supabase Cloud (Recommandé pour production)

1. Créer un projet sur https://supabase.com
2. Copier l'URL et les clés API dans `.env.local`
3. Ouvrir le **SQL Editor** dans Supabase Studio
4. Exécuter les migrations dans cet ordre :

```sql
-- Coller et exécuter chaque fichier dans l'ordre :
supabase/migrations/001_initial_schema.sql
supabase/migrations/20260508022821_add_script_to_ideas.sql
supabase/migrations/20260508031500_profiles_and_notifications.sql
supabase/migrations/20260509000000_constraints_and_rls.sql
supabase/migrations/20260510_approvals.sql
supabase/migrations/20260510_auth_workspaces.sql
supabase/migrations/20260510_rls_auth_uid.sql
supabase/migrations/20260511_integrations_tokens.sql
supabase/migrations/20260512_rls_profiles_notifications.sql
supabase/migrations/20260513_indexes_and_fk_constraints.sql
supabase/migrations/20260510_news.sql
supabase/migrations/20260510_content_templates.sql
```

5. Configurer **Storage** :
   - Créer un bucket `videos` (public: non, max: 500MB)
   - Créer un bucket `assets` (public: oui)
   - Créer un bucket `renders` (public: oui)

6. Configurer **Auth** :
   - Activer les providers désirés : Email/Password, Google, GitHub
   - Ajouter l'URL de callback : `https://votre-domaine.com/api/auth/callback`
   - Désactiver la confirmation d'email pour les tests locaux

### Option B — Supabase Local (Développement)

```bash
# Installer Supabase CLI
npm install -g supabase

# Démarrer Supabase local
supabase start

# Appliquer les migrations
supabase db push

# Les credentials locaux apparaissent dans le terminal
# Copier dans .env.local
```

---

## 4. Services locaux d'IA

### 4.1 Ollama — Génération d'idées

```bash
# macOS / Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows : télécharger le .exe sur https://ollama.ai

# Démarrer Ollama
ollama serve

# Télécharger le modèle (dans un autre terminal)
ollama pull llama3.2

# Vérifier
curl http://localhost:11434/api/tags
```

### 4.2 Whisper — Transcription audio

Utilise le conteneur Docker `whisper-asr-webservice` :

```bash
# CPU seulement
docker run -d \
  --name whisper \
  -p 9000:9000 \
  -e ASR_MODEL=base \
  onerahmet/openai-whisper-asr-webservice:latest-cpu

# GPU (NVIDIA CUDA)
docker run -d \
  --name whisper \
  -p 9000:9000 \
  --gpus all \
  -e ASR_MODEL=medium \
  onerahmet/openai-whisper-asr-webservice:latest

# Vérifier
curl http://localhost:9000/
```

Modèles disponibles : `tiny`, `base`, `small`, `medium`, `large-v3`  
(`base` = équilibre vitesse/qualité · `medium` = meilleure qualité)

### 4.3 FFmpeg — Rendu vidéo (Clipify)

```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt install ffmpeg

# Windows
# Télécharger sur https://ffmpeg.org/download.html
# Ajouter au PATH système

# Vérifier
ffmpeg -version
```

### 4.4 n8n — Automation Bridge

```bash
# Via npm (global)
npm install -g n8n

# Démarrer
n8n start

# Via Docker
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Interface web : http://localhost:5678
# Créer un compte admin à la première visite
```

**Configuration webhook dans n8n :**
1. Dans n8n, aller dans **Settings > API**
2. Générer une clé API → copier dans `N8N_API_KEY`
3. Dans chaque workflow, ajouter un nœud **HTTP Request** en fin de chaîne :
   - URL : `${NEXT_PUBLIC_APP_URL}/api/webhooks/n8n`
   - Method : POST
   - Body : `{ "workflow_run_id": "...", "post_id": "...", "status": "success" }`
   - Header : `X-Webhook-Secret: ${WEBHOOK_SECRET}`

### 4.5 Agents Python (ScrapeGraphAI + Hermes)

```bash
# Créer l'environnement virtuel
cd lib
python3 -m venv python_env
source python_env/bin/activate  # macOS/Linux
# ou : python_env\Scripts\activate  # Windows

# Installer les dépendances
pip install scrapegraphai
pip install requests openai

# Vérifier ScrapeGraphAI
python3 -c "import scrapegraphai; print('OK')"
```

---

## 5. Démarrer en mode développement

```bash
npm run dev
```

L'app est accessible sur **http://localhost:3000**

**Checklist de démarrage :**
- [ ] http://localhost:3000 charge la landing page
- [ ] http://localhost:3000/app/dashboard redirige vers login ou affiche le dashboard
- [ ] http://localhost:11434/api/tags répond (Ollama)
- [ ] http://localhost:9000 répond (Whisper)
- [ ] http://localhost:5678 charge n8n

---

## 6. Déploiement en production

### Option A — Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod

# Configurer les variables d'environnement dans Vercel Dashboard
# Settings > Environment Variables
# Ajouter toutes les variables de la section 2
```

**Important :**
- Activer **Fluid Compute** ou Edge Runtime pour les routes longues (transcription, render)
- Configurer `NEXT_PUBLIC_APP_URL` avec l'URL Vercel définitive
- Les services locaux (Ollama, Whisper, n8n) doivent être exposés publiquement via un tunnel si utilisés en production locale

### Option B — VPS / Serveur dédié

```bash
# Sur le serveur (Ubuntu 22.04 recommandé)

# 1. Cloner et installer
git clone https://github.com/TON_ORG/clavio.git
cd clavio
npm ci --production

# 2. Build
npm run build

# 3. Démarrer avec PM2
npm install -g pm2
pm2 start npm --name "clavio" -- start
pm2 save
pm2 startup

# 4. Nginx reverse proxy
sudo apt install nginx

# /etc/nginx/sites-available/clavio
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo nginx -t && sudo systemctl reload nginx

# 5. SSL avec Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

### Option C — Docker Compose (tout-en-un)

Créer `docker-compose.yml` à la racine :

```yaml
version: '3.8'
services:
  clavio:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    depends_on:
      - whisper
      - n8n

  whisper:
    image: onerahmet/openai-whisper-asr-webservice:latest-cpu
    ports:
      - "9000:9000"
    environment:
      - ASR_MODEL=base

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
```

```bash
docker-compose up -d
```

---

## 7. Configuration NewsAPI (feature Nouvelles)

1. Créer un compte gratuit sur https://newsapi.org
2. Aller dans **My Account > API Key**
3. Copier la clé dans `.env.local` :
   ```env
   NEWS_API_KEY=votre_cle_newsapi
   ```
4. Plan gratuit : 100 req/jour, 1000 articles/req
5. Plan Developer (18$/mois) : 250 req/jour, accès historique

---

## 8. Configuration Stripe (Billing)

1. Créer un compte sur https://stripe.com
2. Dans **Dashboard > Developers > API Keys** :
   - Copier la clé secrète (`sk_live_...`) → `STRIPE_SECRET_KEY`
   - Copier la clé publique (`pk_live_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Dans **Developers > Webhooks** :
   - Ajouter endpoint : `https://votre-domaine.com/api/stripe/webhook`
   - Sélectionner les événements : `customer.subscription.*`, `checkout.session.completed`
   - Copier le secret de signature → `STRIPE_WEBHOOK_SECRET`
4. Créer les produits dans Stripe Dashboard correspondant aux plans Free/Pro/Agency

---

## 9. Vérification post-déploiement

```bash
# TypeScript
npm run typecheck

# Lint
npm run lint

# Build production
npm run build
```

**Tests manuels à effectuer :**
- [ ] Landing page se charge correctement
- [ ] Inscription / connexion fonctionne
- [ ] Onboarding 5 étapes complet
- [ ] Génération d'idées Ollama → `/app/smart-worker`
- [ ] Transcription Whisper → `/app/smart-worker`
- [ ] Recherche ScrapeGraphAI → `/app/agents`
- [ ] Liste render jobs → `/app/render`
- [ ] Webhook URL copiable → `/app/automation`
- [ ] Nouvelles chargent → `/app/news`
- [ ] Bouton Profil navigue vers `/app/profile`
- [ ] Bouton Préférences navigue vers `/app/settings`
- [ ] Font Inter visible dans DevTools (Network > Fonts)
- [ ] Sidebar affiche les groupes AI Systems + Resources + System

---

## 10. Dépannage fréquent

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| `ECONNREFUSED localhost:11434` | Ollama arrêté | `ollama serve` |
| `ECONNREFUSED localhost:9000` | Whisper container arrêté | `docker start whisper` |
| `Cannot find module 'geist'` | Ancienne version cachée | `rm -rf node_modules && npm install` |
| Nouvelles vides | `NEWS_API_KEY` manquante | Ajouter la clé dans `.env.local` |
| Auth redirect loop | Supabase URL incorrecte | Vérifier `NEXT_PUBLIC_SUPABASE_URL` |
| Upload vidéo échoue | Bucket Supabase manquant | Créer le bucket `videos` dans Storage |
| Webhook n8n ignoré | Secret manquant | Vérifier `WEBHOOK_SECRET` dans les deux |
| Render job bloqué en `processing` | Remotion/FFmpeg absent | Installer FFmpeg, vérifier PATH |

---

## 11. Architecture de production recommandée

```
Internet
   │
   ▼
Vercel (Next.js)
   │
   ├── Supabase Cloud (DB + Auth + Storage)
   │
   ├── Ollama (VPS dédié ou local via tunnel)
   │       └── llama3.2 (pull requis)
   │
   ├── Whisper (Docker sur VPS)
   │       └── onerahmet/openai-whisper-asr-webservice
   │
   ├── n8n (Cloud n8n.io ou VPS)
   │       └── Webhooks → Clavio /api/webhooks/n8n
   │
   ├── NewsAPI.org (clé API)
   │
   └── Stripe (billing)
```

---

*Généré le 2026-05-10 — Clavio v1.1.0*
