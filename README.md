# Clavio OS

**Clavio** is a premium, bilingual (FR/EN) creator operations SaaS designed to streamline the entire content lifecycle—from initial ideation to multi-platform publishing and performance analytics.

## 🚀 Core Mission

Transform ideas into high-performing content through a unified, automated, and intelligent workspace. Clavio moves creators from "what should I post?" to "here is your scheduled content" in a single, cohesive system.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Automation:** n8n (Self-hosted)
- **Video Engine:** Remotion + FFmpeg
- **AI Integration:** Ollama (Local AI) + Whisper (Local Transcription)

## 📁 Project Structure

The codebase is organized for high navigability and scalability:

```text
├── app/                  # Next.js App Router (Routes, API, Actions)
│   ├── api/              # Backend API routes
│   └── app/              # Main application screens (Dashboard, Ideas, Videos, etc.)
├── components/           # React Components
│   ├── assets/           # Asset management components
│   ├── dashboard/        # KPIs and dashboard widgets
│   ├── ideas/            # Ideation and script editors
│   ├── layout/           # AppShell, Sidebar, TopBar, Navigation
│   ├── providers/        # Context providers (Theme, I18n, Realtime)
│   ├── publishing/       # Post previews and scheduling dialogs
│   ├── shared/           # Reusable UI patterns (Data tables, empty states)
│   ├── ui/               # Base Shadcn/UI primitives
│   └── videos/           # Video players and processing controls
├── docs/                 # Documentation, Design Specs, and Releases
├── hooks/                # Custom React hooks
├── lib/                  # Core business logic, SDKs, and utilities
├── scripts/              # Maintenance and automation scripts
└── supabase/             # Database migrations and configuration
```

## ✨ Key Features

- **Centralized Ideation:** Capture ideas, generate variants with AI, and promote them directly to scripts.
- **Smart Video Pipeline:** Automated video processing, clipping, and rendering using local engines.
- **Bilingual by Design:** Native support for French and English across the entire interface.
- **Unified Publishing:** Schedule and publish content across multiple social platforms.
- **Operational Logs:** Full traceability for every workflow, background job, and AI interaction.
- **Privacy First:** Designed to run with local AI models (Ollama/Whisper) to keep your creative data secure.

## 🚦 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/clavio.git
    cd clavio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Copy `.env.local.example` to `.env.local` and fill in your Supabase and local service credentials.

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 📜 Documentation

For more detailed information, please refer to the `docs/` directory:
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Ecosystem Design](docs/ecosystem_design_v1.md)
- [Release Notes](docs/RELEASES.md)

---

Built with ❤️ for creators.
