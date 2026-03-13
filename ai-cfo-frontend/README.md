# AI CFO Frontend (Next.js)

## Overview
This is the React-based User Interface for the Enterprise AI CFO Platform, heavily optimized for speed, aesthetics, and enterprise features.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI (Lucide Icons)
- **Authentication & Multi-Tenancy:** Clerk (`@clerk/nextjs`). Provides secure login, `<OrganizationSwitcher />` for B2B workspace isolation, and protected route middleware.
- **State Management:** React Hooks + Server Actions (via `api.ts` fetch wrappers)

## Features Included
1. **Dynamic Landing Page:** A modern, dark-themed hero page outlining platform features and workflow, directing users to the Clerk-hosted sign-up page.
2. **Dashboard Layout:** A persistent sidebar navigation panel offering access to File Uploads, Analytics Pipelines, Conversational RAG Chat, and Simulation tables.
3. **Clerk Security:** The frontend securely retrieves the active Clerk session JWT and injects it as a `Bearer` token into all outgoing requests to the Django backend.
4. **Dynamic Contexts:** The `organization_id` (or `user_id` as fallback) is strictly used as the `bot_id` parameter to orchestrate isolated data requests.

## Setup Locally

1. Create a `.env.local` file containing your Clerk and Supabase public keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.
