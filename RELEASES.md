# Clavio Releases

## v0.1.1 (2026-05-08) - Profile & Notifications

### Core Features
- **Complete Notification System**: Real-time ready notification center with type-specific icons and read status management.
- **Enhanced Profile Page**: Implemented Security and Notifications tabs for granular user settings.
- **Avatar Customization**: Users can now upload and change their profile picture directly from the profile page.

### Technical Improvements
- **Database Schema**: Added `profiles` and `notifications` tables with full RLS policies.
- **Server Actions**: Implemented backend logic for notification management.

## v0.1.0 (2026-05-08) - Initial MVP

### Core Features
- **Ideas Management**: Capture, edit, and expand content ideas.
- **Video Processing Pipeline**: Source video imports (Cobalt) and initial processing.
- **Remotion Integration**: Baseline for programmatic video rendering.
- **Supabase Backend**: Fully typed database and storage integration.
- **Next.js 15 UI**: Modern, premium dashboard with Geist font system.

### Fixes & Improvements
- **Tiptap SSR Fix**: Resolved `immediatelyRender` hydration mismatch in the script editor.
- **Design System**: Implemented `AGENTS.md` compliant light-mode premium design.
