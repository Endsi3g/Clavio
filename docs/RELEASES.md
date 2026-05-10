# Clavio Releases

## v1.2.0 (2026-05-10) - Codebase Optimization & Navigation

### Structural Changes
- **Directory Reorganization**: Categorized root documentation into `docs/` and reorganized the flat `components/` directory into logical sub-modules (`layout`, `shared`, `providers`, `videos`, `ideas`, `publishing`, `dashboard`, `assets`).
- **Enhanced Navigability**: Improved the project structure to follow modern Next.js best practices, making the codebase easier to navigate for developers.
- **Import Optimization**: Batch updated all application imports to use the new categorized component paths.

### Documentation
- **New README**: Created a professional, comprehensive `README.md` at the root, detailing the mission, tech stack, and new project structure.
- **Centralized Docs**: Moved design reports, next steps, and deployment guides into a dedicated `docs/` folder.

### Improvements
- **Bilingual Consistency**: Verified and stabilized i18n providers within the new directory structure.
- **Clean Architecture**: Decoupled UI components into domain-specific folders to reduce complexity.


## v0.1.1 (2026-05-08) - Profile & Notifications

### Core Features
- **Complete Notification System**: Real-time ready notification ce