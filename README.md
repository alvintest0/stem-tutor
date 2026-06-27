# Mindcraft

An AI STEM tutor. Type any concept, get a simple, beginner-friendly explanation
powered by Claude, and revisit everything you've explored from your dashboard.

- **Auth**: Firebase Authentication (email/password + email verification)
- **Data**: Firestore, scoped per-user via security rules
- **Explanations**: Claude (Haiku 4.5) via a Vercel serverless function — the
  API key never reaches the browser
- **Stack**: React, TypeScript, Vite, Tailwind CSS v4

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your Firebase project config
and `ANTHROPIC_API_KEY`. The dev server runs `/api/explain` locally too (see
`vite.config.ts`), so no separate backend is needed.

## Deployment

Push to `main` — Vercel auto-deploys from the connected GitHub repo. Environment
variables are configured in the Vercel project settings.
