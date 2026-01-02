# Rukn Beihan Frontend

A Vite + React + TypeScript frontend using Tailwind CSS and Radix/Shadcn UI components. This README documents local development, build, and deployment without any external UI builder tooling.

## Tech Stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- Radix UI primitives and Shadcn components
- React Router, TanStack Query, Recharts

## Prerequisites

- Node.js 18+ and npm

## Getting Started

```sh
# Clone repository
git clone <YOUR_GIT_URL>
cd rukn-beihan-frontend

# Install dependencies
npm i

# Start development server
npm run dev
# Local preview: http://localhost:8080 (or next available port)
```

## Scripts

- `npm run dev` — Start the Vite dev server
- `npm run build` — Build production assets
- `npm run build:dev` — Build in development mode
- `npm run preview` — Preview the production build
- `npm run lint` — Run ESLint

## Configuration

- `vite.config.ts` — Vite config and path aliases
- `tailwind.config.ts` — Tailwind setup and presets
- `tsconfig.json` — TypeScript compiler options

## Environment

If the app requires environment variables, create a `.env` file at the project root. For Vite, only variables prefixed with `VITE_` are exposed to the client, e.g.:

```
VITE_API_BASE_URL=https://your-api.example.com
```

## Deployment

- Build using `npm run build`
- Serve the generated `dist/` directory with your web server (e.g., Nginx, Apache, or a static host).

## Notes

- Shadcn UI components are included as regular React components in `src/components`; the project does not depend on any external UI builder runtime.
- Security-sensitive features (auth, sessions, cookies) are implemented in `src/context` and `src/services`. Review `api.ts` and `AuthContext.tsx` when configuring your backend.
